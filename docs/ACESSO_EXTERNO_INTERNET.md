# Como Permitir Acesso Externo (Outras Redes)

Este guia explica como permitir que pessoas **fora da sua rede local** acessem o servidor.

## ⚠️ Avisos Importantes de Segurança

Antes de expor seu servidor para a internet, considere:

1. **Autenticação**: Certifique-se de que o sistema de login está funcionando
2. **HTTPS**: Configure SSL/TLS para criptografar as conexões
3. **Firewall**: Configure regras restritivas
4. **Atualizações**: Mantenha o sistema atualizado
5. **Backup**: Faça backup regular dos dados
6. **Monitoramento**: Monitore logs de acesso

## 🚀 Opções Disponíveis

### Opção 1: ngrok (Mais Fácil e Rápido) ⭐ RECOMENDADO

**ngrok** cria um túnel seguro para seu servidor local sem precisar configurar o roteador.

#### Vantagens:
- ✅ Configuração em 2 minutos
- ✅ HTTPS automático
- ✅ Não precisa mexer no roteador
- ✅ URL pública temporária
- ✅ Gratuito (com limitações)

#### Passo a Passo:

1. **Baixar ngrok**:
   - Acesse: https://ngrok.com/download
   - Baixe para Windows
   - Extraia o arquivo `ngrok.exe`

2. **Criar conta (gratuita)**:
   - Acesse: https://dashboard.ngrok.com/signup
   - Crie uma conta gratuita
   - Copie seu **authtoken** do dashboard

3. **Configurar ngrok**:
   ```powershell
   # Execute no PowerShell (substitua SEU_TOKEN pelo token do dashboard)
   .\ngrok.exe config add-authtoken SEU_TOKEN
   ```

4. **Iniciar o túnel**:
   ```powershell
   # Com o servidor rodando na porta 3000
   .\ngrok.exe http 3000
   ```

5. **Obter a URL pública**:
   - ngrok mostrará algo como:
   ```
   Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
   ```
   - Use essa URL para acessar de qualquer lugar!

#### URLs do ngrok:
- **Gratuito**: URL muda a cada reinício (ex: `https://abc123.ngrok-free.app`)
- **Pago**: URL fixa personalizada (ex: `https://meusite.ngrok.app`)

#### Script Automático:

Crie um arquivo `scripts/iniciar-ngrok.ps1`:
```powershell
# Verifica se ngrok está instalado
if (-not (Test-Path ".\ngrok.exe")) {
    Write-Host "ngrok.exe não encontrado!" -ForegroundColor Red
    Write-Host "Baixe em: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Inicia o túnel
Write-Host "Iniciando túnel ngrok na porta 3000..." -ForegroundColor Green
.\ngrok.exe http 3000
```

---

### Opção 2: Port Forwarding no Roteador

Permite acesso direto usando seu IP público.

#### Passo a Passo:

1. **Descobrir seu IP Público**:
   - Acesse: https://whatismyipaddress.com/
   - Anote o IP mostrado (ex: `177.123.45.67`)

2. **Acessar o Painel do Roteador**:
   - Geralmente: `http://192.168.0.1` ou `http://192.168.1.1`
   - Verifique no manual do seu roteador
   - Login padrão geralmente: `admin` / `admin` ou `admin` / `password`

3. **Encontrar Port Forwarding**:
   - Procure por:
     - "Port Forwarding"
     - "Virtual Server"
     - "NAT"
     - "Aplicações e Jogos"
     - "Redirecionamento de Porta"

4. **Configurar a Regra**:
   - **Nome**: FinBot
   - **Porta Externa**: 3000
   - **Porta Interna**: 3000
   - **IP Interno**: Seu IP local (ex: `192.168.0.9`)
   - **Protocolo**: TCP
   - **Status**: Habilitado

5. **Salvar e Aplicar**

6. **Acesso Externo**:
   - Use: `http://SEU_IP_PUBLICO:3000`
   - Exemplo: `http://177.123.45.67:3000`

#### ⚠️ Problemas Comuns:

- **IP Público Dinâmico**: Seu IP pode mudar. Considere usar um serviço de DNS dinâmico (DuckDNS, No-IP)
- **ISP Bloqueia Portas**: Alguns provedores bloqueiam portas. Tente portas alternativas (8080, 8000)
- **Firewall do Roteador**: Verifique se o firewall do roteador não está bloqueando

---

### Opção 3: Serviços de Túnel Alternativos

#### Cloudflare Tunnel (Gratuito)
```powershell
# Instalar
winget install cloudflare.cloudflared

# Criar túnel
cloudflared tunnel --url http://localhost:3000
```

#### LocalTunnel (Gratuito, sem cadastro)
```powershell
# Instalar
npm install -g localtunnel

# Criar túnel
lt --port 3000
```

#### Serveo (Gratuito, sem instalação)
```powershell
# Via SSH (Windows 10+)
ssh -R 80:localhost:3000 serveo.net
```

---

### Opção 4: Deploy em Serviços Cloud (Recomendado para Produção)

Para uso permanente, considere deploy em:

- **Google Cloud Run** (Pay-as-you-go, gratuito até certo limite)
- **Railway** (Gratuito com limites)
- **Render** (Gratuito com limites)
- **Vercel** (Gratuito para frontend)
- **Heroku** (Pago)

Veja a documentação de deploy em: `docs/DEPLOY_*.md`

---

## 🔒 Segurança Adicional

### 1. Configurar HTTPS (SSL/TLS)

#### Com ngrok:
- ✅ HTTPS já está incluído automaticamente

#### Com Port Forwarding:
- Use **Let's Encrypt** (gratuito) com **Certbot**
- Ou use um proxy reverso como **Nginx** com SSL

### 2. Restringir Acesso por IP (Opcional)

No roteador, configure regras de firewall para permitir apenas IPs específicos.

### 3. Usar Autenticação Forte

- Certifique-se de que o sistema de login está ativo
- Considere usar 2FA (autenticação de dois fatores)

### 4. Monitorar Acessos

- Configure logs de acesso
- Monitore tentativas de login suspeitas

---

## 📋 Comparação Rápida

| Método | Dificuldade | Custo | URL Fixa | HTTPS | Recomendado Para |
|--------|------------|-------|----------|-------|------------------|
| **ngrok** | ⭐ Fácil | Gratuito | ❌ (pago) | ✅ | Testes, demos |
| **Port Forwarding** | ⭐⭐ Médio | Gratuito | ✅ | ❌* | Uso permanente |
| **Cloudflare Tunnel** | ⭐⭐ Médio | Gratuito | ✅ | ✅ | Produção |
| **Deploy Cloud** | ⭐⭐⭐ Difícil | Variável | ✅ | ✅ | Produção |

*HTTPS requer configuração adicional

---

## 🎯 Recomendação

### Para Testes/Demos Rápidos:
👉 **Use ngrok** - Mais rápido e fácil

### Para Uso Permanente:
👉 **Use Port Forwarding + DNS Dinâmico** ou **Deploy em Cloud**

---

## 🛠️ Scripts Úteis

### Verificar se a porta está acessível externamente:
```powershell
# Teste de fora da rede
Test-NetConnection -ComputerName SEU_IP_PUBLICO -Port 3000
```

### Verificar IP público atual:
```powershell
Invoke-RestMethod -Uri "https://api.ipify.org?format=json"
```

### Monitorar conexões na porta 3000:
```powershell
Get-NetTCPConnection -LocalPort 3000 | Format-Table
```

---

## ❓ Solução de Problemas

### "Não consigo acessar de fora"

1. **Verifique Port Forwarding**: Confirme que está configurado corretamente
2. **Verifique Firewall**: Tanto Windows quanto roteador
3. **Teste Localmente**: Primeiro teste com `http://localhost:3000`
4. **Verifique IP**: Confirme que está usando o IP público correto
5. **ISP Bloqueia**: Alguns ISPs bloqueiam portas. Tente outra porta (8080)

### "Conexão timeout"

- Verifique se o servidor está rodando
- Verifique se o Port Forwarding está ativo
- Teste de dentro da rede primeiro

### "Acesso negado"

- Verifique regras de firewall
- Verifique se o IP está correto
- Verifique se o servidor aceita conexões externas (`0.0.0.0`)

---

## 📝 Checklist Final

Antes de expor para a internet:

- [ ] Servidor configurado para `0.0.0.0` ✅ (já está)
- [ ] Firewall do Windows configurado ✅
- [ ] Port Forwarding configurado (se usar)
- [ ] Autenticação funcionando
- [ ] HTTPS configurado (recomendado)
- [ ] Backup dos dados
- [ ] Monitoramento ativo

---

**Dúvidas?** Consulte a documentação ou entre em contato com a equipe de desenvolvimento.

