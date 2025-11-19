# Cálculo da Média dos Últimos 30 Dias

## Visão Geral

O **Rendimento Esperado** (anteriormente chamado de "Rendimento Mensal Esperado") não é mais uma previsão ou projeção futura. Agora, ele é uma **suposição baseada na média dos últimos 30 dias** de cada ação no portfólio. O sistema compara o preço atual de cada ação com a média dos preços de fechamento dos últimos 30 dias, mostrando se o preço atual está acima ou abaixo dessa média.

## Como Funciona

### 1. Para Cada Investimento Individual

Para cada ação/FII no portfólio, o sistema:

1. **Busca o histórico de preços** dos últimos 30 dias através da API Brapi
2. **Calcula a média dos preços de fechamento** dos últimos 30 dias:
   ```
   Média dos Últimos 30 Dias = Soma de todos os preços de fechamento / Número de dias
   ```
3. **Compara o preço atual com a média**:
   ```
   Diferença Percentual = ((Preço Atual - Média dos 30 Dias) / Média dos 30 Dias) × 100
   ```
4. **Aplica essa diferença** ao valor investido:
   ```
   Rendimento Esperado (R$) = (Valor Investido × Diferença Percentual) / 100
   Valor Esperado = Valor Investido + Rendimento Esperado
   ```

**Importante**: Este cálculo mostra se o preço atual está acima (positivo) ou abaixo (negativo) da média dos últimos 30 dias, não é uma previsão de rendimento futuro.

### 2. Para o Portfólio Total

O sistema agrega os resultados de todos os investimentos:

1. **Soma todos os valores investidos**:
   ```
   Total Investido = Σ(Valor Investido de cada ação)
   ```

2. **Soma todos os rendimentos esperados** (baseados na diferença entre preço atual e média):
   ```
   Total Rendimento Esperado = Σ(Rendimento Esperado de cada ação)
   ```

3. **Calcula o percentual do portfólio**:
   ```
   Rendimento Esperado do Portfólio (%) = (Total Rendimento Esperado / Total Investido) × 100
   ```

4. **Calcula o valor esperado total**:
   ```
   Valor Esperado do Portfólio = Total Investido + Total Rendimento Esperado
   ```

**Nota**: O percentual do portfólio mostra a média ponderada de quanto cada ação está acima ou abaixo da sua média dos últimos 30 dias.

## Exemplo Prático

### Cenário

Suponha que você tenha:

- **100 cotas de PETR4** a R$ 30,00 = **R$ 3.000,00 investidos**
- **50 cotas de VALE3** a R$ 60,00 = **R$ 3.000,00 investidos**
- **Total investido: R$ 6.000,00**

### Cálculo Individual

#### PETR4
- **Média dos últimos 30 dias**: R$ 29,00 (calculada a partir dos preços de fechamento dos últimos 30 dias)
- **Preço atual**: R$ 30,00
- **Diferença percentual**: ((30 - 29) / 29) × 100 = **+3,45%**
  - *O preço atual está 3,45% acima da média dos últimos 30 dias*
- **Rendimento esperado**: (3.000 × 3,45) / 100 = **R$ 103,50**
- **Valor esperado**: 3.000 + 103,50 = **R$ 3.103,50**

#### VALE3
- **Média dos últimos 30 dias**: R$ 61,00 (calculada a partir dos preços de fechamento dos últimos 30 dias)
- **Preço atual**: R$ 60,00
- **Diferença percentual**: ((60 - 61) / 61) × 100 = **-1,64%**
  - *O preço atual está 1,64% abaixo da média dos últimos 30 dias*
- **Rendimento esperado**: (3.000 × -1,64) / 100 = **-R$ 49,20**
- **Valor esperado**: 3.000 - 49,20 = **R$ 2.950,80**

### Cálculo do Portfólio

- **Total investido**: R$ 6.000,00
- **Total rendimento esperado**: 103,50 - 49,20 = **R$ 54,30**
- **Rendimento esperado do portfólio**: (54,30 / 6.000) × 100 = **+0,91%**
- **Valor esperado do portfólio**: 6.000 + 54,30 = **R$ 6.054,30**

**Interpretação**: O portfólio está, em média, 0,91% acima da média dos últimos 30 dias de cada ação individual.

## Limitações e Considerações Importantes

### ⚠️ Avisos Importantes

1. **NÃO é uma previsão**: O cálculo não prevê rendimentos futuros. Ele apenas compara o preço atual com a média dos últimos 30 dias.

2. **Não é uma garantia**: O valor mostrado não garante retorno futuro. É apenas uma comparação histórica.

3. **Baseado apenas nos últimos 30 dias**: O cálculo usa apenas a média dos últimos 30 dias. Ações voláteis podem ter comportamentos muito diferentes no futuro.

4. **Não considera dividendos**: O cálculo considera apenas a variação do preço da ação, não inclui dividendos ou proventos.

5. **Para CDB e Tesouro Direto**: Investimentos de renda fixa (CDB, Tesouro Direto) não têm cálculo automático, pois não há histórico de preços negociados. O valor atual permanece igual ao valor investido até que seja atualizado manualmente ou através de uma API específica.

6. **Dados podem não estar disponíveis**: Se a API não conseguir obter o histórico de uma ação, o rendimento esperado será considerado como 0% para aquela ação.

7. **Interpretação**: 
   - **Valor positivo**: O preço atual está acima da média dos últimos 30 dias
   - **Valor negativo**: O preço atual está abaixo da média dos últimos 30 dias
   - **Isso não significa que a ação vai continuar subindo ou descendo**

### ✅ Quando é Útil

- **Análise de posição atual**: Ver se o preço atual está acima ou abaixo da média recente
- **Comparação**: Comparar como diferentes ações estão posicionadas em relação às suas médias
- **Contexto histórico**: Entender se uma ação está em um momento de alta ou baixa em relação ao seu histórico recente
- **Não use para**: Prever rendimentos futuros, tomar decisões de investimento sem consultar um profissional

## Implementação Técnica

### Endpoint

```
GET /api/trpc/investments.getExpectedMonthlyReturn
```

### Fluxo de Cálculo

1. **Busca todos os investimentos** do usuário
2. **Para cada investimento**:
   - Verifica se é ação ou FII (tipos que têm histórico de preços)
   - Chama `stockService.getStockVariation(ticker, "1mo")` para obter o histórico dos últimos 30 dias
   - Extrai `avg_price` (média dos preços de fechamento dos últimos 30 dias) do resultado
   - Busca o preço atual da ação através de `stockService.getStockInfo(ticker)`
   - Calcula a diferença percentual: `((preço_atual - média_30dias) / média_30dias) × 100`
   - Aplica essa diferença ao valor investido para calcular o rendimento esperado
3. **Agrega os resultados**:
   - Soma todos os valores investidos
   - Soma todos os rendimentos esperados (baseados na diferença percentual)
   - Calcula percentual e valor esperado do portfólio
4. **Retorna os dados** formatados

### Código de Referência

O cálculo é implementado em:
- **Backend**: `server/routers.ts` - endpoint `investments.getExpectedMonthlyReturn`
- **Serviço de Ações**: `server/services/stock_service.py` - método `get_stock_variation`

## Fórmulas Resumidas

### Investimento Individual

```
Média dos Últimos 30 Dias = Soma de todos os preços de fechamento / Número de dias
Diferença Percentual = ((Preço Atual - Média dos 30 Dias) / Média dos 30 Dias) × 100
Rendimento Esperado (R$) = (Valor Investido × Diferença Percentual) / 100
Valor Esperado = Valor Investido + Rendimento Esperado
Rendimento Esperado (%) = Diferença Percentual
```

### Portfólio Total

```
Total Investido = Σ(Valor Investido de cada ação)
Total Rendimento Esperado = Σ(Rendimento Esperado de cada ação)
Rendimento Esperado do Portfólio (%) = (Total Rendimento Esperado / Total Investido) × 100
Valor Esperado do Portfólio = Total Investido + Total Rendimento Esperado
```

## Atualização dos Dados

A média dos últimos 30 dias é calculada em tempo real sempre que:

- O usuário acessa o dashboard
- O usuário visualiza a aba "Portfólio"
- O chatbot é consultado sobre o portfólio

Os dados históricos são buscados diretamente da API Brapi, garantindo informações atualizadas.

## Mudança de Metodologia

**Importante**: Este cálculo foi alterado de uma **previsão baseada em variação percentual** para uma **suposição baseada na média dos últimos 30 dias**. 

- **Antes**: O sistema calculava a variação percentual do período (preço inicial vs preço final) e projetava esse rendimento para o futuro.
- **Agora**: O sistema calcula a média dos preços dos últimos 30 dias e compara com o preço atual, mostrando se a ação está acima ou abaixo dessa média.

Esta mudança torna o cálculo mais transparente e menos sujeito a interpretações como "previsão de rendimento futuro", focando em mostrar a posição atual da ação em relação ao seu histórico recente.

---

**Nota**: Este documento descreve a implementação atual do sistema. Para dúvidas ou sugestões de melhoria, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

