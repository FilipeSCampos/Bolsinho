# Solução: Erro DNS_PROBE_FINISHED_NXDOMAIN no ngrok

## 🔍 Diagnóstico

O erro `DNS_PROBE_FINISHED_NXDOMAIN` significa que o DNS não consegue resolver o domínio do ngrok. Isso pode acontecer por vários motivos.

## ⚠️ Problema Mais Comum

**Authtoken não configurado**: Se você não configurou o authtoken do ngrok, ele pode não funcionar corretamente e gerar esse erro DNS.

**Solução rápida**:
1. Acesse: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copie seu authtoken
3. Execute: `.\ngrok.exe config add-authtoken SEU_TOKEN`
4. Reinicie o ngrok: `.\ngrok.exe http 3000`

## ✅ Soluções

### 1. Verificar se o ngrok está rodando

Abra um novo terminal e verifique:

```powershell
# Verificar se o processo ngrok está ativo
Get-Process -Name ngrok -ErrorAction SilentlyContinue
```

Se não aparecer nada, o ngrok não está rodando. Reinicie:

```powershell
.\ngrok.exe http 3000
```

### 2. Verificar se o servidor está rodando

O ngrok precisa que seu servidor esteja ativo na porta 3000:

```powershell
# Verificar se algo está rodando na porta 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

Se não aparecer nada, inicie o servidor primeiro:

```powershell
pnpm dev
```

### 3. Verificar a URL do ngrok

Quando você inicia o ngrok, ele mostra algo como:

```
Session Status                online
Account                       seu-email@exemplo.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Importante**: 
- Use a URL que aparece em **"Forwarding"**
- Certifique-se de usar **HTTPS** (não HTTP)
- A URL muda a cada reinício do ngrok (versão gratuita)

### 4. Página de Warning do ngrok (Versão Gratuita)

A versão gratuita do ngrok mostra uma página de aviso na primeira vez que alguém acessa. Você precisa:

1. **Clicar em "Visit Site"** ou **"Continue"** na página de warning
2. Isso é normal e acontece apenas na primeira vez por sessão

### 5. Verificar Authtoken

Se você ainda não configurou o authtoken, o ngrok pode não funcionar corretamente:

```powershell
# Verificar se está configurado
.\ngrok.exe config check

# Se não estiver, configure:
.\ngrok.exe config add-authtoken SEU_TOKEN
```

### 6. Verificar Firewall

O firewall pode estar bloqueando o ngrok:

```powershell
# Verificar regras do firewall
Get-NetFirewallRule -DisplayName "*ngrok*"
```

Se necessário, permita o ngrok no firewall.

### 7. Limpar Cache DNS

Às vezes o problema é cache DNS:

```powershell
# Limpar cache DNS do Windows
ipconfig /flushdns
```

### 8. Testar a Interface Web do ngrok

O ngrok tem uma interface web local para verificar o status:

1. Inicie o ngrok: `.\ngrok.exe http 3000`
2. Abra no navegador: `http://localhost:4040`
3. Veja o status das requisições e a URL correta

### 9. Verificar Região do ngrok

Se você está em uma região diferente, pode especificar:

```powershell
# Para região mais próxima (ex: South America)
.\ngrok.exe http 3000 --region sa
```

Regiões disponíveis:
- `us` - United States
- `eu` - Europe
- `ap` - Asia Pacific
- `au` - Australia
- `sa` - South America
- `jp` - Japan
- `in` - India

### 10. Usar ngrok com domínio personalizado (Pago)

Se você tem plano pago do ngrok, pode usar domínio fixo:

```powershell
.\ngrok.exe http 3000 --domain=seu-dominio.ngrok.app
```

## 🔧 Script de Diagnóstico

Execute este script para verificar tudo:

```powershell
Write-Host "=== Diagnóstico ngrok ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se ngrok está rodando
Write-Host "1. Verificando processo ngrok..." -ForegroundColor Yellow
$ngrok = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrok) {
    Write-Host "   ✅ ngrok está rodando (PID: $($ngrok.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ ngrok NÃO está rodando" -ForegroundColor Red
}

# 2. Verificar se servidor está na porta 3000
Write-Host "2. Verificando servidor na porta 3000..." -ForegroundColor Yellow
$server = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($server) {
    Write-Host "   ✅ Servidor está rodando na porta 3000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Nenhum servidor na porta 3000" -ForegroundColor Red
}

# 3. Verificar configuração do ngrok
Write-Host "3. Verificando configuração do ngrok..." -ForegroundColor Yellow
if (Test-Path "$env:USERPROFILE\.ngrok2\ngrok.yml") {
    Write-Host "   ✅ Arquivo de configuração encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Arquivo de configuração não encontrado" -ForegroundColor Yellow
    Write-Host "      Execute: .\ngrok.exe config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
}

# 4. Verificar interface web
Write-Host "4. Interface web do ngrok:" -ForegroundColor Yellow
Write-Host "   http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Fim do Diagnóstico ===" -ForegroundColor Cyan
```

## 📋 Checklist de Troubleshooting

- [ ] ngrok está rodando? (`Get-Process ngrok`)
- [ ] Servidor está rodando na porta 3000? (`Get-NetTCPConnection -LocalPort 3000`)
- [ ] Authtoken configurado? (`.\ngrok.exe config check`)
- [ ] URL está correta? (verifique em `http://localhost:4040`)
- [ ] Está usando HTTPS? (não HTTP)
- [ ] Passou pela página de warning? (versão gratuita)
- [ ] Cache DNS limpo? (`ipconfig /flushdns`)
- [ ] Firewall permitindo ngrok?

## 🎯 Solução Rápida

1. **Pare o ngrok** (Ctrl+C no terminal onde está rodando)

2. **Certifique-se que o servidor está rodando**:
   ```powershell
   pnpm dev
   ```

3. **Inicie o ngrok novamente**:
   ```powershell
   .\ngrok.exe http 3000
   ```

4. **Copie a URL exata** que aparece em "Forwarding"

5. **Acesse a URL** e clique em "Visit Site" se aparecer a página de warning

6. **Teste novamente**

## 🔄 Alternativas se ngrok não funcionar

### Cloudflare Tunnel (Gratuito)
```powershell
# Instalar
winget install cloudflare.cloudflared

# Criar túnel
cloudflared tunnel --url http://localhost:3000
```

### LocalTunnel (Gratuito, sem cadastro)
```powershell
# Instalar
npm install -g localtunnel

# Criar túnel
lt --port 3000
```

### Port Forwarding no Roteador
Veja: `docs/ACESSO_EXTERNO_INTERNET.md`

---

**Ainda com problemas?** Verifique os logs do ngrok e a interface web em `http://localhost:4040`

