# Cálculo do Rendimento Mensal Esperado

## Visão Geral

O **Rendimento Mensal Esperado** é uma estimativa baseada na variação histórica das ações no portfólio. Ele projeta quanto o portfólio pode render no próximo mês com base no desempenho histórico de cada ação nos últimos 30 dias.

## Como Funciona

### 1. Para Cada Investimento Individual

Para cada ação/FII no portfólio, o sistema:

1. **Busca o histórico de preços** dos últimos 30 dias (1 mês) através da API Brapi
2. **Calcula a variação percentual** do período:
   ```
   Variação Percentual = ((Preço Final - Preço Inicial) / Preço Inicial) × 100
   ```
3. **Aplica essa variação** ao valor investido:
   ```
   Rendimento Esperado (R$) = (Valor Investido × Variação Percentual) / 100
   Valor Esperado = Valor Investido + Rendimento Esperado
   ```

### 2. Para o Portfólio Total

O sistema agrega os resultados de todos os investimentos:

1. **Soma todos os valores investidos**:
   ```
   Total Investido = Σ(Valor Investido de cada ação)
   ```

2. **Soma todos os rendimentos esperados**:
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

## Exemplo Prático

### Cenário

Suponha que você tenha:

- **100 cotas de PETR4** a R$ 30,00 = **R$ 3.000,00 investidos**
- **50 cotas de VALE3** a R$ 60,00 = **R$ 3.000,00 investidos**
- **Total investido: R$ 6.000,00**

### Cálculo Individual

#### PETR4
- **Histórico (últimos 30 dias)**: Preço inicial R$ 28,00 → Preço final R$ 30,00
- **Variação percentual**: ((30 - 28) / 28) × 100 = **+7,14%**
- **Rendimento esperado**: (3.000 × 7,14) / 100 = **R$ 214,20**
- **Valor esperado**: 3.000 + 214,20 = **R$ 3.214,20**

#### VALE3
- **Histórico (últimos 30 dias)**: Preço inicial R$ 62,00 → Preço final R$ 60,00
- **Variação percentual**: ((60 - 62) / 62) × 100 = **-3,23%**
- **Rendimento esperado**: (3.000 × -3,23) / 100 = **-R$ 96,90**
- **Valor esperado**: 3.000 - 96,90 = **R$ 2.903,10**

### Cálculo do Portfólio

- **Total investido**: R$ 6.000,00
- **Total rendimento esperado**: 214,20 - 96,90 = **R$ 117,30**
- **Rendimento esperado do portfólio**: (117,30 / 6.000) × 100 = **+1,96%**
- **Valor esperado do portfólio**: 6.000 + 117,30 = **R$ 6.117,30**

## Limitações e Considerações Importantes

### ⚠️ Avisos

1. **Não é uma garantia**: O rendimento esperado é uma projeção baseada em dados históricos, não uma garantia de retorno futuro.

2. **Baseado apenas no último mês**: O cálculo usa apenas os últimos 30 dias de histórico. Ações voláteis podem ter variações muito diferentes no futuro.

3. **Não considera dividendos**: O cálculo considera apenas a variação do preço da ação, não inclui dividendos ou proventos.

4. **Para CDB e Tesouro Direto**: Investimentos de renda fixa (CDB, Tesouro Direto) não têm cálculo automático de rendimento esperado, pois não há histórico de preços negociados. O valor atual permanece igual ao valor investido até que seja atualizado manualmente ou através de uma API específica.

5. **Dados podem não estar disponíveis**: Se a API não conseguir obter o histórico de uma ação, o rendimento esperado será considerado como 0% para aquela ação.

### ✅ Quando é Útil

- **Análise de tendência**: Ver como o portfólio se comportou no último mês
- **Comparação**: Comparar o desempenho esperado de diferentes ações
- **Planejamento**: Ter uma estimativa para planejamento financeiro (com ressalvas)

## Implementação Técnica

### Endpoint

```
GET /api/trpc/investments.getExpectedMonthlyReturn
```

### Fluxo de Cálculo

1. **Busca todos os investimentos** do usuário
2. **Para cada investimento**:
   - Verifica se é ação ou FII (tipos que têm histórico de preços)
   - Chama `stockService.getStockVariation(ticker, "1mo")` para obter a variação mensal
   - Extrai `change_percent` do resultado
   - Calcula rendimento esperado e valor esperado
3. **Agrega os resultados**:
   - Soma todos os valores investidos
   - Soma todos os rendimentos esperados
   - Calcula percentual e valor esperado do portfólio
4. **Retorna os dados** formatados

### Código de Referência

O cálculo é implementado em:
- **Backend**: `server/routers.ts` - endpoint `investments.getExpectedMonthlyReturn`
- **Serviço de Ações**: `server/services/stock_service.py` - método `get_stock_variation`

## Fórmulas Resumidas

### Investimento Individual

```
Variação Percentual = ((Preço Final - Preço Inicial) / Preço Inicial) × 100
Rendimento Esperado (R$) = (Valor Investido × Variação Percentual) / 100
Valor Esperado = Valor Investido + Rendimento Esperado
Rendimento Esperado (%) = Variação Percentual
```

### Portfólio Total

```
Total Investido = Σ(Valor Investido de cada ação)
Total Rendimento Esperado = Σ(Rendimento Esperado de cada ação)
Rendimento Esperado do Portfólio (%) = (Total Rendimento Esperado / Total Investido) × 100
Valor Esperado do Portfólio = Total Investido + Total Rendimento Esperado
```

## Atualização dos Dados

O rendimento mensal esperado é calculado em tempo real sempre que:

- O usuário acessa o dashboard
- O usuário visualiza a aba "Portfólio"
- O chatbot é consultado sobre o portfólio

Os dados históricos são buscados diretamente da API Brapi, garantindo informações atualizadas.

---

**Nota**: Este documento descreve a implementação atual do sistema. Para dúvidas ou sugestões de melhoria, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

