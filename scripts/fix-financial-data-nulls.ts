#!/usr/bin/env tsx
/**
 * Script para corrigir valores null nos dados financeiros
 * Atualiza investimentos com currentValue null para usar totalInvested
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";
import { investments } from "../drizzle/schema";

async function fixFinancialDataNulls() {
  console.log("============================================================");
  console.log("   Correcao de Valores Null nos Dados Financeiros         ");
  console.log("============================================================");
  console.log("");

  if (!process.env.DATABASE_URL) {
    console.error("[ERRO] DATABASE_URL nao configurada");
    process.exit(1);
  }

  try {
    const db = drizzle(process.env.DATABASE_URL);

    console.log("[PASSO 1] Buscando investimentos com valores null...");
    
    // Buscar todos os investimentos
    const allInvestments = await db.select()
      .from(investments);
    
    console.log(`[INFO] Total de investimentos encontrados: ${allInvestments.length}`);
    
    // Filtrar investimentos que precisam ser atualizados
    // (currentValue é 0 ou null, mas totalInvested > 0)
    const investmentsWithNulls = allInvestments.filter(inv => {
      const totalInvested = typeof inv.totalInvested === 'number' ? inv.totalInvested : 0;
      const currentValue = inv.currentValue;
      return totalInvested > 0 && (currentValue === null || currentValue === 0 || currentValue === undefined);
    });

    console.log(`[INFO] Investimentos que precisam ser atualizados: ${investmentsWithNulls.length}\n`);

    if (investmentsWithNulls.length === 0) {
      console.log("[OK] Nenhum investimento precisa ser atualizado!");
      console.log("");
      return;
    }

    console.log("[PASSO 2] Atualizando investimentos...\n");

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const inv of investmentsWithNulls) {
      try {
        const totalInvested = typeof inv.totalInvested === 'number' ? inv.totalInvested : 0;
        const currentValue = inv.currentValue;
        
        // Se currentValue é 0 ou null, mas totalInvested > 0, atualizar currentValue
        if (totalInvested > 0 && (currentValue === null || currentValue === 0 || currentValue === undefined)) {
          await db.update(investments)
            .set({
              currentValue: totalInvested, // Usar totalInvested como valor inicial
              updatedAt: new Date(),
            })
            .where(eq(investments.id, inv.id));

          console.log(`[OK] Atualizado investimento ${inv.id} (${inv.ticker}): currentValue = ${(totalInvested / 100).toFixed(2)} R$`);
          updated++;
        } else {
          console.log(`[SKIP] Pulando investimento ${inv.id} (${inv.ticker}): ja tem currentValue valido`);
          skipped++;
        }
      } catch (error) {
        console.error(`[ERRO] Erro ao atualizar investimento ${inv.id}:`, error);
        errors++;
      }
    }

    console.log("");
    console.log("============================================================");
    console.log("   [OK] Processo concluido!                                ");
    console.log("============================================================");
    console.log("");
    console.log(`   Atualizados: ${updated}`);
    console.log(`   Pulados: ${skipped}`);
    console.log(`   Erros: ${errors}`);
    console.log(`   Total: ${investmentsWithNulls.length}`);
    console.log("");
  } catch (error) {
    console.error("[ERRO] Erro ao corrigir dados financeiros:", error);
    process.exit(1);
  }
}

// Executar script
fixFinancialDataNulls()
  .then(() => {
    console.log("✨ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro ao executar script:", error);
    process.exit(1);
  });

