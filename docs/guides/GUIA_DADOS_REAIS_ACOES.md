# 📊 Guia: Popular Cache com Dados Reais de Ações

## 🎯 Objetivo

Popular o cache de ações com dados **reais** do Yahoo Finance para exibir informações atualizadas no dashboard.

## ⚠️ Limitações do Yahoo Finance

O Yahoo Finance tem algumas limitações:
- **Rate Limiting**: Limite de requisições por minuto
- **Ações Brasileiras**: Podem estar temporariamente indisponíveis
- **Timeout**: Pode demorar para responder

## 🚀 Como Usar

### Opção 1: Script Melhorado (Recomendado)

```bash
pnpm populate-stocks-real
```

Este script:
- ✅ Tenta múltiplas estratégias para obter dados
- ✅ Implementa retry automático com delays progressivos
- ✅ Detecta rate limiting e aguarda automaticamente
- ✅ Mostra progresso detalhado
- ✅ Salva dados parciais mesmo se algumas ações falharem

### Opção 2: Script Original

```bash
pnpm populate-stocks
```

Script básico que tenta buscar dados uma vez.

### Opção 3: Dados Reais da Brapi API

O sistema agora usa a **Brapi API** como fonte principal (gratuita, brasileira) e Yahoo Finance como fallback para ações internacionais. **Não há mais dados mockup** - apenas dados reais das APIs.

**Importante:** O sistema **NUNCA mais usa dados mockup**. Se a API falhar, retorna erro e o usuário deve tentar novamente.

## 📝 Estratégias do Script Melhorado

O script `populate-stocks-real-improved.ts` usa:

1. **Retry com Delays Progressivos**: 
   - Tenta até 3 vezes por ação
   - Aumenta o delay após cada tentativa (10s, 20s, 30s)

2. **Detecção de Rate Limiting**:
   - Detecta erros 429 (Too Many Requests)
   - Aguarda automaticamente antes de retry
   - Continua com outras ações mesmo se algumas falharem

3. **Delays Entre Ações**:
   - 5 segundos entre cada ação
   - 10 segundos após rate limit
   - Reduz chances de bloqueio

4. **Múltiplas Estratégias no Backend**:
   - Tenta `history()` com diferentes períodos
   - Tenta `download()` com intervalo de datas
   - Tenta buscar apenas últimos dias úteis

## 🔧 Troubleshooting

### Problema: Rate Limiting (429)

**Solução:**
1. Aguarde 10-15 minutos
2. Execute o script novamente
3. O script detecta rate limiting e aguarda automaticamente

### Problema: "Ação não encontrada"

**Possíveis causas:**
1. Ticker incorreto
2. Ação temporariamente indisponível no Yahoo Finance
3. Problemas com a API do Yahoo Finance

**Solução:**
1. Verifique se o ticker está correto (ex: PETR4, não PETR)
2. Tente novamente em alguns minutos
3. Use dados mock temporariamente

### Problema: Timeout

**Solução:**
1. Verifique sua conexão com a internet
2. O script tem timeout de 30 segundos por requisição
3. Tente novamente

## 📊 Monitoramento

O script mostra:
- ✅ Ações processadas com sucesso
- ⚠️ Ações com rate limiting
- ❌ Ações que falharam
- 📈 Preços e variações obtidas

## 💡 Dicas

1. **Execute em horários de baixo tráfego**: Menos chance de rate limiting
2. **Use dados mock para desenvolvimento**: Mais rápido e confiável
3. **Configure cron job**: Para atualizar cache periodicamente
4. **Monitore logs**: Para identificar padrões de falha

## 🔄 Atualização Automática

Para atualizar o cache automaticamente:

### Linux/Mac (Cron)

```bash
# Atualiza a cada 15 minutos
*/15 * * * * cd /path/to/project && pnpm populate-stocks-real
```

### Windows (Task Scheduler)

1. Abra o Agendador de Tarefas
2. Crie uma nova tarefa
3. Configure para executar `pnpm populate-stocks-real` a cada 15 minutos

### Via API Endpoint

Você também pode usar o endpoint da API:

```bash
curl -X POST http://localhost:3000/api/trpc/stocks.updateCache
```

## 📈 Resultado Esperado

Após executar o script, você deve ver:

```
✅ Sucesso: 6/6 ações
   Ações processadas com sucesso:
   - PETR4 (Petrobras PN): R$ 38.50
   - VALE3 (Vale S.A.): R$ 68.90
   ...
```

Os dados estarão no cache e aparecerão no dashboard!

## 🎯 Próximos Passos

1. Execute o script: `pnpm populate-stocks-real`
2. Aguarde o processo concluir (pode levar alguns minutos)
3. Verifique o dashboard: Os dados devem aparecer
4. Configure atualização automática se necessário

