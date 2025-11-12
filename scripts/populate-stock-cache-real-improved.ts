/**
 * Script MELHORADO para popular o cache de ações com dados REAIS
 * Tenta múltiplas fontes e estratégias para obter dados reais
 * Execute: pnpm tsx scripts/populate-stock-cache-real-improved.ts
 */

import "dotenv/config";
import * as db from "../server/db";
import { stockService } from "../server/python-bridge";

const POPULAR_STOCKS = [
  "PETR4",
  "VALE3",
  "ITUB4",
  "BBDC4",
  "ABEV3",
  "WEGE3",
];

// Delays configuráveis
const DELAY_BETWEEN_STOCKS = 5000; // 5 segundos entre ações
const DELAY_AFTER_RATE_LIMIT = 10000; // 10 segundos após rate limit
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchStockWithRetry(ticker: string, retries: number = MAX_RETRIES): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`   → Tentativa ${attempt}/${retries}...`);
      
      const info = await stockService.getStockInfo(ticker);
      
      if (info && info.success) {
        return info;
      }
      
      // Se for rate limit, aguarda mais tempo
      if (info?.rate_limited) {
        if (attempt < retries) {
          const delay = DELAY_AFTER_RATE_LIMIT * attempt; // Delay progressivo
          console.log(`   ⏳ Rate limit detectado. Aguardando ${delay / 1000}s antes de tentar novamente...`);
          await sleep(delay);
          continue;
        }
      }
      
      // Se não for rate limit mas falhou, retorna o erro
      return info;
      
    } catch (error) {
      console.error(`   ❌ Erro na tentativa ${attempt}:`, error instanceof Error ? error.message : error);
      if (attempt < retries) {
        await sleep(DELAY_AFTER_RATE_LIMIT);
      }
    }
  }
  
  return null;
}

async function populateCacheWithRealData() {
  console.log("🚀 Iniciando popularização do cache com dados REAIS");
  console.log("=".repeat(60));
  console.log("⏳ Este processo pode levar vários minutos devido aos delays.");
  console.log("💡 O script tenta múltiplas estratégias para obter dados reais.\n");

  const results = {
    success: [] as Array<{ ticker: string; name: string; price: number }>,
    failed: [] as Array<{ ticker: string; error: string }>,
    rateLimited: [] as string[],
  };

  for (let i = 0; i < POPULAR_STOCKS.length; i++) {
    const ticker = POPULAR_STOCKS[i];
    
    console.log(`\n[${i + 1}/${POPULAR_STOCKS.length}] 📊 Processando ${ticker}...`);
    console.log("-".repeat(60));
    
    try {
      // Busca informações da ação com retry
      const info = await fetchStockWithRetry(ticker);
      
      if (!info || !info.success) {
        const errorMsg = info?.error || "Erro desconhecido";
        const isRateLimited = info?.rate_limited;
        
        if (isRateLimited) {
          console.error(`   ❌ ${ticker}: Rate limit após ${MAX_RETRIES} tentativas`);
          results.rateLimited.push(ticker);
          console.log(`   💡 Aguarde alguns minutos e tente novamente para ${ticker}`);
        } else {
          console.error(`   ❌ ${ticker}: ${errorMsg}`);
          results.failed.push({ ticker, error: errorMsg });
        }
        
        // Aguarda antes da próxima ação
        if (i < POPULAR_STOCKS.length - 1) {
          console.log(`   ⏳ Aguardando ${DELAY_BETWEEN_STOCKS / 1000}s antes da próxima ação...`);
          await sleep(DELAY_BETWEEN_STOCKS);
        }
        continue;
      }

      console.log(`   ✅ Informações obtidas:`);
      console.log(`      Nome: ${info.name || ticker}`);
      console.log(`      Preço: R$ ${info.current_price?.toFixed(2) || 'N/A'}`);
      console.log(`      Variação: ${info.change_percent >= 0 ? '+' : ''}${info.change_percent?.toFixed(2) || '0.00'}%`);

      // Aguarda antes de buscar histórico
      await sleep(2000);

      // Busca histórico
      console.log(`   → Buscando histórico de preços...`);
      let history = null;
      try {
        history = await stockService.getStockHistory(ticker, "1mo", "1d");
        if (history && history.success) {
          console.log(`   ✅ Histórico obtido: ${history.data_points || 0} pontos de dados`);
        } else {
          console.warn(`   ⚠️  Histórico não disponível, mas salvando informações básicas`);
        }
      } catch (histError) {
        console.warn(`   ⚠️  Erro ao buscar histórico: ${histError instanceof Error ? histError.message : histError}`);
      }
      
      // Salva no cache
      console.log(`   → Salvando no cache...`);
      await db.upsertStockCache({
        ticker: info.ticker,
        normalizedTicker: info.normalized_ticker,
        name: info.name,
        currentPrice: info.current_price,
        previousClose: info.previous_close,
        change: info.change,
        changePercent: info.change_percent,
        dayHigh: info.day_high,
        dayLow: info.day_low,
        volume: info.volume,
        currency: info.currency,
        market: info.market,
        sector: info.sector,
        industry: info.industry,
        marketCap: info.market_cap,
        historyData: history && history.success ? JSON.stringify(history) : null,
      });

      console.log(`   ✅ ${ticker} salvo no cache com sucesso!`);
      results.success.push({
        ticker,
        name: info.name || ticker,
        price: info.current_price || 0,
      });
      
      // Delay entre ações
      if (i < POPULAR_STOCKS.length - 1) {
        console.log(`   ⏳ Aguardando ${DELAY_BETWEEN_STOCKS / 1000}s antes da próxima ação...`);
        await sleep(DELAY_BETWEEN_STOCKS);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Erro inesperado ao processar ${ticker}: ${errorMsg}`);
      results.failed.push({ ticker, error: errorMsg });
      await sleep(DELAY_BETWEEN_STOCKS);
    }
  }

  // Resumo final
  console.log("\n" + "=".repeat(60));
  console.log("✨ Popularização concluída!");
  console.log("=".repeat(60));
  
  console.log(`\n✅ Sucesso: ${results.success.length}/${POPULAR_STOCKS.length} ações`);
  if (results.success.length > 0) {
    console.log("   Ações processadas com sucesso:");
    results.success.forEach(({ ticker, name, price }) => {
      console.log(`   - ${ticker} (${name}): R$ ${price.toFixed(2)}`);
    });
  }
  
  if (results.rateLimited.length > 0) {
    console.log(`\n⚠️  Rate Limited: ${results.rateLimited.length} ações`);
    console.log("   Ações afetadas por rate limiting do Yahoo Finance:");
    results.rateLimited.forEach(ticker => {
      console.log(`   - ${ticker}`);
    });
    console.log("\n💡 Dica: Aguarde 10-15 minutos e execute o script novamente.");
    console.log("   O Yahoo Finance tem limites de requisições por minuto.");
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Falhas: ${results.failed.length} ações`);
    results.failed.forEach(({ ticker, error }) => {
      console.log(`   - ${ticker}: ${error}`);
    });
  }
  
  if (results.success.length === 0 && results.failed.length > 0) {
    console.log("\n⚠️  Nenhuma ação foi processada com sucesso.");
    console.log("💡 Possíveis causas:");
    console.log("   1. Rate limiting do Yahoo Finance (aguarde alguns minutos)");
    console.log("   2. Problemas temporários com a API do Yahoo Finance");
    console.log("   3. Ações brasileiras podem estar temporariamente indisponíveis");
    console.log("\n🔄 Tente executar o script novamente em alguns minutos.");
    console.log("   O sistema agora usa apenas dados reais das APIs (Brapi API).");
  } else if (results.success.length > 0) {
    console.log("\n📝 Os dados estão agora no cache e serão usados pelo frontend.");
    console.log("   O cache é válido por 15 minutos antes de tentar atualizar da API.");
  }
  
  console.log("");
  
  // Exit code baseado no resultado
  const hasAnySuccess = results.success.length > 0;
  const allRateLimited = results.failed.length === 0 && results.rateLimited.length === POPULAR_STOCKS.length;
  
  process.exit(hasAnySuccess || allRateLimited ? 0 : 1);
}

populateCacheWithRealData().catch((error) => {
  console.error("\n❌ Erro fatal:", error);
  process.exit(1);
});

