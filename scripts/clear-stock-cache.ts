#!/usr/bin/env node
/**
 * Script para limpar o cache de ações do banco de dados
 * Execute: pnpm tsx scripts/clear-stock-cache.ts
 */

import "dotenv/config";
import * as db from "../server/db";

async function main() {
  try {
    console.log("🔄 Limpando cache de ações...");
    
    const result = await db.clearStockCache();
    
    if (result.success) {
      console.log("✅ Cache limpo com sucesso!");
      console.log(`   ${result.message}`);
    } else {
      console.error("❌ Erro ao limpar cache:", result);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erro ao limpar cache:", error);
    process.exit(1);
  }
}

main();

