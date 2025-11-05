/**
 * Bridge para executar serviços Python a partir do Node.js
 */

import { spawn } from 'child_process';
import path from 'path';

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
    const scriptPath = path.join(__dirname, 'services', `${serviceName}.py`);
    
    // Prepara argumentos como JSON
    const argsJson = JSON.stringify({ method, args });
    
    const pythonProcess = spawn('python3.11', [scriptPath, argsJson]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr || `Process exited with code ${code}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve({
          success: true,
          data: result
        });
      } catch (e) {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${stdout}`
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
    return executePythonService('groq_service', 'financial_assistant', [userMessage, conversationHistory]);
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
