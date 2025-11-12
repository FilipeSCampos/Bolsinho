/**
 * Bridge para executar serviços Python a partir do Node.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PythonServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Executa um script Python e retorna o resultado
 */
export async function executePythonService(
  serviceName: string,
  method: string,
  args: any[] = []
): Promise<PythonServiceResponse> {
  return new Promise((resolve) => {
    // Usa o CLI wrapper para executar o serviço
    // O nome do arquivo CLI é diferente do nome do serviço
    const cliMap: Record<string, string> = {
      'groq': 'groq_cli',
      'groq_service': 'groq_cli',
      'ocr': 'ocr_cli',
      'ocr_service': 'ocr_cli',
      'news': 'news_cli',
      'news_service': 'news_cli',
      'stock': 'stock_cli',
      'stock_service': 'stock_cli',
      'calculator': 'calculator_cli',
      'calculator_service': 'calculator_cli',
    };
    const cliName = cliMap[serviceName] || `${serviceName}_cli`;
    const scriptPath = path.join(__dirname, 'services', `${cliName}.py`);
    
    // Prepara argumentos como JSON no formato esperado pelo CLI
    const request = JSON.stringify({ method, args });
    
    // Try to use venv Python first, then fallback to system Python
    const venvPythonPath = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe'); // Windows
    const venvPythonPathUnix = path.join(__dirname, '..', 'venv', 'bin', 'python3'); // Unix/Mac
    const venvPython = process.platform === 'win32' ? venvPythonPath : venvPythonPathUnix;
    
    // Check if venv exists synchronously, otherwise use system Python
    let pythonCmd: string;
    try {
      fs.accessSync(venvPython, fs.constants.F_OK);
      pythonCmd = venvPython;
    } catch {
      // Venv doesn't exist, use system Python
      pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    }
    
    const pythonProcess = spawn(pythonCmd, [scriptPath, request], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    
    let stdout = '';
    let stderr = '';
    
    // Configurar encoding UTF-8 explicitamente
    if (pythonProcess.stdout) {
      pythonProcess.stdout.setEncoding('utf8');
    }
    if (pythonProcess.stderr) {
      pythonProcess.stderr.setEncoding('utf8');
    }
    
    pythonProcess.stdout?.on('data', (data: Buffer | string) => {
      stdout += typeof data === 'string' ? data : data.toString('utf8');
    });
    
    pythonProcess.stderr?.on('data', (data: Buffer | string) => {
      stderr += typeof data === 'string' ? data : data.toString('utf8');
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[PythonBridge] Process exited with code ${code}`);
        console.error(`[PythonBridge] stderr:`, stderr);
        console.error(`[PythonBridge] stdout:`, stdout);
        resolve({
          success: false,
          error: stderr || `Process exited with code ${code}`
        });
        return;
      }
      
      // Verifica se stdout está vazio
      if (!stdout || stdout.trim().length === 0) {
        console.error(`[PythonBridge] Empty output from Python script`);
        console.error(`[PythonBridge] stderr:`, stderr);
        resolve({
          success: false,
          error: `Python script returned empty output. ${stderr ? `Error: ${stderr}` : ''}`
        });
        return;
      }
      
      try {
        // Tenta parsear o JSON
        const trimmedStdout = stdout.trim();
        const result = JSON.parse(trimmedStdout);
        resolve({
          success: true,
          data: result
        });
      } catch (e) {
        console.error(`[PythonBridge] Failed to parse JSON output`);
        console.error(`[PythonBridge] stdout (first 500 chars):`, stdout.substring(0, 500));
        console.error(`[PythonBridge] stderr:`, stderr);
        console.error(`[PythonBridge] Parse error:`, e);
        resolve({
          success: false,
          error: `Failed to parse Python output as JSON. Output: ${stdout.substring(0, 200)}...`
        });
      }
    });
  });
}

/**
 * Serviço Groq
 */
export const groqService = {
  async chatCompletion(messages: any[], options: any = {}) {
    return executePythonService('groq_service', 'chat_completion', [messages, options]);
  },
  
  async analyzeImage(imageUrl: string, prompt: string) {
    return executePythonService('groq_service', 'analyze_image', [imageUrl, prompt]);
  },
  
  async extractFinancialData(imageUrl: string, documentType: string) {
    return executePythonService('groq_service', 'extract_financial_data', [imageUrl, documentType]);
  },
  
  async categorizeTransaction(description: string, amount: number, context?: string) {
    return executePythonService('groq_service', 'categorize_transaction', [description, amount, context]);
  },
  
  async analyzeSpendingPattern(transactions: any[], budget?: any) {
    return executePythonService('groq_service', 'analyze_spending_pattern', [transactions, budget]);
  },
  
  async financialAssistant(userMessage: string, conversationHistory?: any[]) {
    const result = await executePythonService('groq', 'financial_assistant', [userMessage, conversationHistory]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao executar o Bolsinho');
    }
    // O resultado pode ser uma string ou objeto, retorna como está
    return typeof result.data === 'string' ? result.data : result.data;
  },
  
  async financialAssistantMultimodal(userContent: any, conversationHistory?: any[]) {
    const result = await executePythonService('groq', 'financial_assistant_multimodal', [userContent, conversationHistory]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao executar o Bolsinho (multimodal)');
    }
    return typeof result.data === 'string' ? result.data : result.data;
  }
};

/**
 * Serviço OCR
 */
export const ocrService = {
  async extractText(imagePath: string, preprocess: boolean = true) {
    return executePythonService('ocr_service', 'extract_text', [imagePath, preprocess]);
  },
  
  async extractBoletoData(imagePath: string) {
    return executePythonService('ocr_service', 'extract_boleto_data', [imagePath]);
  },
  
  async extractReceiptData(imagePath: string) {
    return executePythonService('ocr_service', 'extract_receipt_data', [imagePath]);
  },
  
  async extractInvoiceData(imagePath: string) {
    return executePythonService('ocr_service', 'extract_invoice_data', [imagePath]);
  },
  
  async extractTextFromPdf(pdfPath: string) {
    return executePythonService('ocr_service', 'extract_text_from_pdf', [pdfPath]);
  }
};

/**
 * Serviço de Notícias
 */
export const newsService = {
  async getTopHeadlines(category: string = 'business', country: string = 'br', pageSize: number = 20) {
    return executePythonService('news_service', 'get_top_headlines', [category, country, pageSize]);
  },
  
  async searchNews(query: string, options: any = {}) {
    return executePythonService('news_service', 'search_news', [query, options]);
  },
  
  async getInvestmentNews(assetType?: string, pageSize: number = 20) {
    return executePythonService('news_service', 'get_investment_news', [assetType, pageSize]);
  },
  
  async getSectorNews(sector: string, pageSize: number = 20) {
    return executePythonService('news_service', 'get_sector_news', [sector, pageSize]);
  },
  
  async getMarketIndicatorsNews(pageSize: number = 15) {
    return executePythonService('news_service', 'get_market_indicators_news', [pageSize]);
  },
  
  async analyzeNewsImpact(newsList: any[], portfolioSectors?: string[]) {
    return executePythonService('news_service', 'analyze_news_impact', [newsList, portfolioSectors]);
  }
};

/**
 * Serviço de Ações
 * 
 * Nota: O Yahoo Finance tem limites de rate limiting.
 * Para evitar 429 (Too Many Requests), adicionamos delays entre requisições.
 */

// Cache simples para rate limiting - armazena último tempo de requisição
let lastStockRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // 1 segundo entre requisições para evitar rate limiting

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastStockRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const delayMs = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    await delay(delayMs);
  }
  
  lastStockRequestTime = Date.now();
  return requestFn();
}

export const stockService = {
  async getStockInfo(ticker: string) {
    try {
      console.log(`[StockService] Buscando info para ${ticker}`);
      const result = await rateLimitedRequest(() => 
        executePythonService('stock_service', 'get_stock_info', [ticker])
      );
      if (!result.success) {
        console.error(`[StockService] Erro ao buscar info para ${ticker}:`, result.error);
        // Retorna objeto com success: false ao invés de throw
        return {
          success: false,
          error: result.error || 'Erro ao buscar informações da ação',
          ticker: ticker
        };
      }
      console.log(`[StockService] Info para ${ticker} retornada com sucesso`);
      return result.data;
    } catch (error) {
      console.error(`[StockService] Exceção ao buscar info para ${ticker}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar informações da ação',
        ticker: ticker
      };
    }
  },
  
  async getStockHistory(ticker: string, period: string = '1mo', interval: string = '1d') {
    try {
      console.log(`[StockService] Buscando histórico para ${ticker} (${period}, ${interval})`);
      const result = await rateLimitedRequest(() => 
        executePythonService('stock_service', 'get_stock_history', [ticker, period, interval])
      );
      if (!result.success) {
        console.error(`[StockService] Erro ao buscar histórico para ${ticker}:`, result.error);
        // Retorna objeto com success: false ao invés de throw
        return {
          success: false,
          error: result.error || 'Erro ao buscar histórico da ação',
          ticker: ticker
        };
      }
      console.log(`[StockService] Histórico para ${ticker} retornado com sucesso`);
      return result.data;
    } catch (error) {
      console.error(`[StockService] Exceção ao buscar histórico para ${ticker}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar histórico da ação',
        ticker: ticker
      };
    }
  },
  
  async getStockVariation(ticker: string, period: string = '1mo') {
    try {
      const result = await rateLimitedRequest(() => 
        executePythonService('stock_service', 'get_stock_variation', [ticker, period])
      );
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao calcular variação da ação',
          ticker: ticker
        };
      }
      return result.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao calcular variação da ação',
        ticker: ticker
      };
    }
  },
  
  async searchStocks(query: string, limit: number = 5) {
    try {
      // Busca não precisa de rate limiting pois é local (lista de ações conhecidas)
      const result = await executePythonService('stock_service', 'search_stocks', [query, limit]);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao buscar ações',
          query: query
        };
      }
      return result.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar ações',
        query: query
      };
    }
  }
};

/**
 * Serviço de Cálculos Financeiros
 */
export const calculatorService = {
  async calculateInvestmentDistribution(
    totalAmount: number,
    percentages?: number[],
    amounts?: number[],
    targets?: string[]
  ) {
    const result = await executePythonService('calculator_service', 'calculate_investment_distribution', [
      totalAmount,
      percentages || null,
      amounts || null,
      targets || null
    ]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao calcular distribuição de investimentos');
    }
    return result.data;
  },
  
  async calculatePercentage(value: number, total: number) {
    const result = await executePythonService('calculator_service', 'calculate_percentage', [value, total]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao calcular percentual');
    }
    return result.data;
  },
  
  async calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: number = 12
  ) {
    const result = await executePythonService('calculator_service', 'calculate_compound_interest', [
      principal,
      rate,
      time,
      compoundingFrequency
    ]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao calcular juros compostos');
    }
    return result.data;
  },
  
  async parseFinancialQuestion(question: string) {
    const result = await executePythonService('calculator_service', 'parse_financial_question', [question]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao analisar pergunta financeira');
    }
    return result.data;
  },
  
  async safeEval(expression: string) {
    const result = await executePythonService('calculator_service', 'safe_eval', [expression]);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao avaliar expressão');
    }
    return result.data;
  }
};
