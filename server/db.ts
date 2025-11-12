import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory,
  transactions, InsertTransaction,
  budgets, InsertBudget,
  goals, InsertGoal,
  chatMessages, InsertChatMessage,
  alerts, InsertAlert,
  documents, InsertDocument,
  investments, InsertInvestment,
  stockCache, InsertStockCache,
  monitoredStocks, InsertMonitoredStock
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: Partial<InsertUser>): Promise<void> {
  // For email/password auth, openId can be generated from email
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const openId = user.openId || (user.email ? `email_${user.email}` : undefined);
    if (!openId) {
      throw new Error("Cannot determine openId for user");
    }

    const values: Partial<InsertUser> = {
      openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for MySQL
    // Type assertion needed because openId can be nullable in schema but required in InsertUser
    const insertValues: any = {
      ...values,
      openId: openId, // Ensure openId is set
    };
    
    await db.insert(users).values(insertValues).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(user: {
  openId: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  loginMethod?: string;
}) {
  const database = await getDb();
  if (!database) {
    throw new Error("Database not available");
  }

  try {
    // Ensure openId is set (required for insertion even if nullable in schema)
    const insertData: any = {
      openId: user.openId,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name || null,
      loginMethod: user.loginMethod || "email",
      lastSignedIn: new Date(),
    };
    
    await database.insert(users).values(insertData);
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

// Categories
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(categories).values(category);
}

// Transactions
export async function getUserTransactions(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    return db.select().from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }
  
  return db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(100);
}

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values(transaction);
  return result;
}

export async function updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(transactions)
    .set(data)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

// Budgets
export async function getUserBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(budgets.createdAt);
}

export async function createBudget(budget: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(budgets).values(budget);
}

// Goals
export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(goals.createdAt);
}

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(goals).values(goal);
}

// Chat Messages
export async function getUserChatMessages(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatMessages).values(message);
}

// Alerts
export async function getUserAlerts(userId: number, onlyUnread: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (onlyUnread) {
    return db.select().from(alerts)
      .where(and(eq(alerts.userId, userId), eq(alerts.isRead, 0)))
      .orderBy(desc(alerts.createdAt));
  }
  
  return db.select().from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt))
    .limit(50);
}

export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(alerts).values(alert);
}

// Documents
export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function createDocument(document: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values(document);
  return result;
}

// Analytics
export async function getSpendingByCategory(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    categoryId: transactions.categoryId,
    total: sql<number>`SUM(${transactions.amount})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(transactions.categoryId);
}

// Investments
export async function getUserInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const results = await db.select().from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.updatedAt));
    
    // Ensure all values are properly typed and handle nulls
    return results.map(inv => {
      // Convert to numbers, handling null/undefined safely
      const totalInvested = typeof inv.totalInvested === 'number' && !isNaN(inv.totalInvested)
        ? inv.totalInvested
        : 0;
      const currentValue = typeof inv.currentValue === 'number' && !isNaN(inv.currentValue) && inv.currentValue > 0
        ? inv.currentValue
        : totalInvested; // Fallback to totalInvested if currentValue is null/invalid
      const averagePrice = typeof inv.averagePrice === 'number' && !isNaN(inv.averagePrice)
        ? inv.averagePrice
        : 0;
      const quantity = typeof inv.quantity === 'number' && !isNaN(inv.quantity)
        ? inv.quantity
        : 0;
      
      return {
        ...inv,
        currentValue,
        totalInvested,
        averagePrice,
        quantity,
      };
    });
  } catch (error) {
    console.error("[Database] Error getting user investments:", error);
    return [];
  }
}

export async function createInvestment(investment: InsertInvestment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(investments).values(investment);
}

export async function updateInvestment(id: number, userId: number, updates: Partial<InsertInvestment>) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  await database.update(investments)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

export async function deleteInvestment(id: number, userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  await database.delete(investments)
    .where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

// Dashboard Stats
export async function getDashboardStats(userId: number) {
  const database = await getDb();
  if (!database) {
    return {
      portfolioTotal: 0,
      monthlyReturn: 0,
      monitoredStocks: 6, // Default
      investmentsCount: 0,
    };
  }
  
  try {
    // Get total portfolio value from investments
    const userInvestments = await getUserInvestments(userId);
    
    // Safely calculate portfolio total, handling null/undefined values
    const portfolioTotal = userInvestments.reduce((sum, inv) => {
      // Get values safely, handling null/undefined
      const currentValue = typeof inv.currentValue === 'number' && !isNaN(inv.currentValue)
        ? inv.currentValue
        : null;
      const totalInvested = typeof inv.totalInvested === 'number' && !isNaN(inv.totalInvested)
        ? inv.totalInvested
        : 0;
      
      // Use currentValue if available and valid, otherwise use totalInvested
      const value = currentValue !== null && currentValue > 0 ? currentValue : totalInvested;
      return sum + (value > 0 ? value : 0);
    }, 0);
    
    const investmentsCount = userInvestments.length;
    
    // Calculate total invested separately for return calculation
    const totalInvested = userInvestments.reduce((sum, inv) => {
      const invested = typeof inv.totalInvested === 'number' && !isNaN(inv.totalInvested)
        ? inv.totalInvested
        : 0;
      return sum + invested;
    }, 0);
    
    // Calculate monthly return safely, avoiding division by zero
    let monthlyReturn = 0;
    if (totalInvested > 0 && portfolioTotal >= 0) {
      const returnValue = ((portfolioTotal - totalInvested) / totalInvested) * 100;
      // Ensure return is a valid number
      if (!isNaN(returnValue) && isFinite(returnValue)) {
        monthlyReturn = returnValue;
      }
    }
    
    // Get unique tickers for monitored stocks count
    const uniqueTickers = new Set(
      userInvestments
        .map(inv => inv.ticker)
        .filter(ticker => ticker !== null && ticker !== undefined)
    );
    const monitoredStocks = Math.max(uniqueTickers.size, 6); // At least 6 (default featured stocks)
    
    return {
      portfolioTotal: Math.max(0, portfolioTotal), // Ensure non-negative
      monthlyReturn: Math.round(monthlyReturn * 100) / 100, // Round to 2 decimal places
      monitoredStocks,
      investmentsCount,
    };
  } catch (error) {
    console.error("[Dashboard] Error getting stats:", error);
    // Return safe default values
    return {
      portfolioTotal: 0,
      monthlyReturn: 0,
      monitoredStocks: 6,
      investmentsCount: 0,
    };
  }
}

// Stock Cache operations
export async function getStockFromCache(ticker: string) {
  const database = await getDb();
  if (!database) return null;
  
  try {
    const result = await database.select().from(stockCache)
      .where(eq(stockCache.ticker, ticker.toUpperCase()))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Error getting stock from cache:", error);
    return null;
  }
}

export async function upsertStockCache(data: {
  ticker: string;
  normalizedTicker?: string;
  name?: string;
  currentPrice?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  currency?: string;
  market?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  historyData?: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    const ticker = data.ticker.toUpperCase();
    const existing = await getStockFromCache(ticker);
    
    // Prepara dados do cache (só inclui campos que foram fornecidos)
    const cacheData: any = {
      ticker,
      lastUpdated: new Date(),
    };
    
    // Só atualiza campos que foram fornecidos (não undefined)
    if (data.normalizedTicker !== undefined) {
      cacheData.normalizedTicker = data.normalizedTicker || null;
    }
    if (data.name !== undefined) {
      cacheData.name = data.name || null;
    }
    if (data.currentPrice !== undefined) {
      // Verifica explicitamente null/undefined para permitir 0 (zero é falsy em JS)
      cacheData.currentPrice = (data.currentPrice !== null && data.currentPrice !== undefined) ? Math.round(data.currentPrice * 100) : null;
    }
    if (data.previousClose !== undefined) {
      cacheData.previousClose = (data.previousClose !== null && data.previousClose !== undefined) ? Math.round(data.previousClose * 100) : null;
    }
    if (data.change !== undefined) {
      cacheData.change = (data.change !== null && data.change !== undefined) ? Math.round(data.change * 100) : null;
    }
    if (data.changePercent !== undefined) {
      cacheData.changePercent = (data.changePercent !== null && data.changePercent !== undefined) ? Math.round(data.changePercent * 100) : null;
    }
    if (data.dayHigh !== undefined) {
      cacheData.dayHigh = (data.dayHigh !== null && data.dayHigh !== undefined) ? Math.round(data.dayHigh * 100) : null;
    }
    if (data.dayLow !== undefined) {
      cacheData.dayLow = (data.dayLow !== null && data.dayLow !== undefined) ? Math.round(data.dayLow * 100) : null;
    }
    if (data.volume !== undefined) {
      cacheData.volume = data.volume || null;
    }
    if (data.currency !== undefined) {
      cacheData.currency = data.currency || "BRL";
    }
    if (data.market !== undefined) {
      cacheData.market = data.market || null;
    }
    if (data.sector !== undefined) {
      cacheData.sector = data.sector || null;
    }
    if (data.industry !== undefined) {
      cacheData.industry = data.industry || null;
    }
    if (data.marketCap !== undefined) {
      cacheData.marketCap = data.marketCap ? String(data.marketCap) : null;
    }
    if (data.historyData !== undefined) {
      cacheData.historyData = data.historyData || null;
    }

    if (existing) {
      // Se está atualizando e currentPrice não foi fornecido, mantém o valor existente
      if (data.currentPrice === undefined && existing.currentPrice !== null && existing.currentPrice !== undefined) {
        cacheData.currentPrice = existing.currentPrice;
      }
      // Se está atualizando e historyData não foi fornecido, mantém o valor existente
      if (data.historyData === undefined && existing.historyData) {
        cacheData.historyData = existing.historyData;
      }
      // Se está atualizando e name não foi fornecido, mantém o valor existente
      if (data.name === undefined && existing.name) {
        cacheData.name = existing.name;
      }
      
      await database.update(stockCache)
        .set(cacheData)
        .where(eq(stockCache.ticker, ticker));
    } else {
      // Para novo registro, precisa ter pelo menos currentPrice ou historyData
      if (cacheData.currentPrice === undefined && cacheData.historyData === undefined) {
        throw new Error(`Cannot create cache entry for ${ticker} without currentPrice or historyData`);
      }
      
      // Se não tem currentPrice mas tem historyData, tenta extrair do histórico
      if (cacheData.currentPrice === undefined && cacheData.historyData) {
        try {
          const history = typeof cacheData.historyData === 'string' 
            ? JSON.parse(cacheData.historyData) 
            : cacheData.historyData;
          if (history && history.history && Array.isArray(history.history) && history.history.length > 0) {
            const lastItem = history.history[history.history.length - 1];
            if (lastItem && lastItem.close) {
              cacheData.currentPrice = Math.round(lastItem.close * 100);
              console.log(`[Database] Extraído currentPrice do histórico para ${ticker}: ${lastItem.close}`);
            }
          }
        } catch (error) {
          console.error(`[Database] Erro ao extrair currentPrice do histórico para ${ticker}:`, error);
        }
      }
      
      await database.insert(stockCache).values({
        ...cacheData,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Error upserting stock cache:", error);
    throw error;
  }
}

export async function clearStockCache() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    await database.delete(stockCache);
    console.log("[Database] Cache de ações limpo com sucesso");
    return { success: true, message: "Cache limpo com sucesso" };
  } catch (error) {
    console.error("[Database] Erro ao limpar cache:", error);
    throw error;
  }
}

export async function deleteStockFromCache(ticker: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    await database.delete(stockCache)
      .where(eq(stockCache.ticker, ticker.toUpperCase()));
    console.log(`[Database] Cache de ${ticker} removido`);
    return { success: true, message: `Cache de ${ticker} removido com sucesso` };
  } catch (error) {
    console.error(`[Database] Erro ao remover cache de ${ticker}:`, error);
    throw error;
  }
}

export async function getAllCachedStocks() {
  const database = await getDb();
  if (!database) return [];
  
  try {
    return await database.select().from(stockCache)
      .orderBy(stockCache.ticker);
  } catch (error) {
    console.error("[Database] Error getting all cached stocks:", error);
    return [];
  }
}

export async function isStockCacheStale(ticker: string, maxAgeMinutes: number = 15) {
  const cached = await getStockFromCache(ticker);
  if (!cached || !cached.lastUpdated) return true;
  
  const ageMs = Date.now() - cached.lastUpdated.getTime();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  
  return ageMs > maxAgeMs;
}

// Monitored Stocks operations
export async function getUserMonitoredStocks(userId: number) {
  const database = await getDb();
  if (!database) return [];
  
  try {
    const results = await database.select()
      .from(monitoredStocks)
      .where(eq(monitoredStocks.userId, userId))
      .orderBy(monitoredStocks.displayOrder, monitoredStocks.createdAt);
    
    return results;
  } catch (error) {
    console.error("[Database] Error getting user monitored stocks:", error);
    return [];
  }
}

export async function addMonitoredStock(userId: number, ticker: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    // Verifica se já existe
    const existing = await database.select()
      .from(monitoredStocks)
      .where(and(
        eq(monitoredStocks.userId, userId),
        eq(monitoredStocks.ticker, ticker.toUpperCase())
      ))
      .limit(1);
    
    if (existing.length > 0) {
      throw new Error("Ação já está sendo monitorada");
    }
    
    // Verifica limite de 6 ações
    const currentStocks = await getUserMonitoredStocks(userId);
    if (currentStocks.length >= 6) {
      throw new Error("Limite de 6 ações monitoradas atingido");
    }
    
    // Pega o próximo displayOrder
    const maxOrder = currentStocks.reduce((max, stock) => 
      Math.max(max, stock.displayOrder || 0), 0);
    
    await database.insert(monitoredStocks).values({
      userId,
      ticker: ticker.toUpperCase(),
      displayOrder: maxOrder + 1,
    });
  } catch (error) {
    console.error("[Database] Error adding monitored stock:", error);
    throw error;
  }
}

export async function removeMonitoredStock(userId: number, ticker: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    await database.delete(monitoredStocks)
      .where(and(
        eq(monitoredStocks.userId, userId),
        eq(monitoredStocks.ticker, ticker.toUpperCase())
      ));
  } catch (error) {
    console.error("[Database] Error removing monitored stock:", error);
    throw error;
  }
}

export async function updateMonitoredStockOrder(userId: number, tickers: string[]) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  try {
    // Atualiza a ordem de exibição
    for (let i = 0; i < tickers.length; i++) {
      await database.update(monitoredStocks)
        .set({ displayOrder: i + 1, updatedAt: new Date() })
        .where(and(
          eq(monitoredStocks.userId, userId),
          eq(monitoredStocks.ticker, tickers[i].toUpperCase())
        ));
    }
  } catch (error) {
    console.error("[Database] Error updating monitored stock order:", error);
    throw error;
  }
}
