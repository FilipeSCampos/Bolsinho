import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }), // Hash da senha (bcrypt)
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categorias de gastos
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["expense", "income"]).default("expense").notNull(),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  userId: int("userId").references(() => users.id),
  isDefault: int("isDefault").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Transacoes financeiras
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  categoryId: int("categoryId").references(() => categories.id),
  amount: int("amount").notNull(), // Valor em centavos
  description: text("description").notNull(),
  type: mysqlEnum("type", ["expense", "income"]).notNull(),
  date: timestamp("date").notNull(),
  documentUrl: varchar("documentUrl", { length: 500 }),
  documentType: mysqlEnum("documentType", ["recibo", "nota_fiscal", "extrato", "boleto"]),
  extractedData: text("extractedData"), // JSON com dados extraidos
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Orcamentos
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  categoryId: int("categoryId").references(() => categories.id),
  amount: int("amount").notNull(), // Valor em centavos
  period: mysqlEnum("period", ["monthly", "weekly", "yearly"]).default("monthly").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  alertThreshold: int("alertThreshold").default(80), // Porcentagem para alerta
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// Metas financeiras
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  targetAmount: int("targetAmount").notNull(), // Valor em centavos
  currentAmount: int("currentAmount").default(0).notNull(),
  deadline: timestamp("deadline"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// Historico de conversas do chat
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  metadata: text("metadata"), // JSON com metadados adicionais
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Alertas e notificacoes
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["budget_exceeded", "goal_milestone", "unusual_spending", "bill_reminder"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  isRead: int("isRead").default(0).notNull(),
  relatedEntityId: int("relatedEntityId"), // ID da entidade relacionada (budget, goal, etc)
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Documentos processados
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  transactionId: int("transactionId").references(() => transactions.id),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileSize: int("fileSize").notNull(),
  documentType: mysqlEnum("documentType", ["recibo", "nota_fiscal", "extrato", "boleto", "outro"]).notNull(),
  ocrText: text("ocrText"),
  extractedData: text("extractedData"), // JSON
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Portfólio de investimentos
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  name: varchar("name", { length: 200 }),
  type: mysqlEnum("type", ["stock", "fii", "cdb", "tesouro_direto", "fundo_imobiliario", "outro"]).default("stock").notNull(), // Tipo de investimento
  quantity: int("quantity").notNull().default(0), // Quantidade de ações/cotas
  averagePrice: int("averagePrice").notNull(), // Preço médio em centavos
  totalInvested: int("totalInvested").notNull().default(0), // Total investido em centavos
  currentValue: int("currentValue").default(0).notNull(), // Valor atual em centavos (notNull para evitar null)
  currency: varchar("currency", { length: 10 }).default("BRL"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// Cache de dados de ações
export const stockCache = mysqlTable("stockCache", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull().unique(),
  normalizedTicker: varchar("normalizedTicker", { length: 50 }),
  name: varchar("name", { length: 200 }),
  currentPrice: int("currentPrice"), // Preço em centavos
  previousClose: int("previousClose"), // Preço anterior em centavos
  change: int("change"), // Variação em centavos
  changePercent: int("changePercent"), // Variação percentual (ex: 250 = 2.50%)
  dayHigh: int("dayHigh"), // Máxima do dia em centavos
  dayLow: int("dayLow"), // Mínima do dia em centavos
  volume: int("volume"), // Volume de negociação
  currency: varchar("currency", { length: 10 }).default("BRL"),
  market: varchar("market", { length: 50 }),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 200 }),
  marketCap: varchar("marketCap", { length: 50 }), // Market cap como string para valores grandes
  historyData: text("historyData"), // JSON com histórico de preços
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockCache = typeof stockCache.$inferSelect;
export type InsertStockCache = typeof stockCache.$inferInsert;

// Ações monitoradas por usuário
export const monitoredStocks = mysqlTable("monitoredStocks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(), // Ordem de exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonitoredStock = typeof monitoredStocks.$inferSelect;
export type InsertMonitoredStock = typeof monitoredStocks.$inferInsert;
