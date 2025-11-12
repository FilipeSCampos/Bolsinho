# Como Expor o Servidor Local na Rede

Este guia explica como permitir que outras pessoas na sua **rede local** acessem o servidor que está rodando no `localhost:3000`.

> **💡 Para acesso de outras redes (internet)**, veja: [`docs/ACESSO_EXTERNO_INTERNET.md`](./ACESSO_EXTERNO_INTERNET.md)

## ✅ Verificação Inicial

O servidor já está configurado para aceitar conexões externas:
- **Backend**: Configurado para escutar em `0.0.0.0` (aceita conexões de qualquer IP)
- **Vite**: Configurado com `host: true` (aceita conexões externas)

## 📋 Passo a Passo

### 0. Script Automático (Recomendado)

Execute o script PowerShell como **Administrador**:

```powershell
# Execute como Administrador
.\scripts\abrir-porta-3000.ps1
```

Este script:
- ✅ Verifica se você tem permissões de administrador
- ✅ Cria a regra de firewall automaticamente
- ✅ Mostra seu IP local para acesso

### 1. Descobrir seu IP Local

#### No Windows (PowerShell):
```powershell
ipconfig
```

Procure por **"IPv4 Address"** na seção do seu adaptador de rede (Wi-Fi ou Ethernet). 

**Exemplo de saída:**
```
Endereço IPv4. . . . . . . . . . . . : 192.168.0.9    ← Use este IP
Endereço IPv4. . . . . . . . . . . . : 172.25.64.1   ← Ignore (WSL/Docker)
Endereço IPv4. . . . . . . . . . . . : 26.111.150.181 ← Ignore (VPN)
```

**Use o IP que começa com `192.168.x.x` ou `10.x.x.x`** - esse é o IP da sua rede local.

#### No Windows (CMD):
```cmd
ipconfig | findstr IPv4
```

#### Filtrar apenas IPs da rede local:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "172.25.*"
} | Select-Object IPAddress
```

### 2. Configurar o Firewall do Windows

O Windows Firewall pode estar bloqueando conexões na porta 3000. Você precisa permitir:

#### Opção A: Via Interface Gráfica

1. Abra o **Windows Defender Firewall**:
   - Pressione `Win + R`
   - Digite `wf.msc` e pressione Enter

2. Clique em **"Regras de Entrada"** (Inbound Rules) no painel esquerdo

3. Clique em **"Nova Regra..."** (New Rule...) no painel direito

4. Selecione **"Porta"** e clique em **Próximo**

5. Selecione **"TCP"** e digite **3000** na porta específica, clique em **Próximo**

6. Selecione **"Permitir a conexão"** e clique em **Próximo**

7. Marque todas as opções (Domínio, Privada, Pública) e clique em **Próximo**

8. Dê um nome (ex: "FinBot Port 3000") e clique em **Concluir**

#### Opção B: Via PowerShell (Administrador)

Abra o PowerShell como **Administrador** e execute:

```powershell
New-NetFirewallRule -DisplayName "FinBot Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 3. Testar o Acesso Local

1. **No seu computador**: Acesse `http://localhost:3000` (deve funcionar normalmente)

2. **De outro dispositivo na mesma rede**:
   - Use o IP que você descobriu no passo 1
   - Exemplo: `http://192.168.1.100:3000`
   - Deve abrir o site normalmente

### 4. Acesso pela Internet (Opcional)

Se você quiser que pessoas fora da sua rede local acessem o site, você precisa:

#### 4.1. Configurar Port Forwarding no Roteador

⚠️ **ATENÇÃO**: Isso expõe seu servidor para a internet. Certifique-se de ter segurança adequada (autenticação, HTTPS, etc.).

1. **Descubra seu IP Público**:
   - Acesse: https://whatismyipaddress.com/
   - Anote o IP mostrado

2. **Acesse o painel do roteador**:
   - Geralmente: `http://192.168.1.1` ou `http://192.168.0.1`
   - Verifique no manual do seu roteador

3. **Configure Port Forwarding**:
   - Procure por "Port Forwarding", "Virtual Server" ou "NAT"
   - Adicione uma regra:
     - **Nome**: FinBot
     - **Porta Externa**: 3000
     - **Porta Interna**: 3000
     - **IP Interno**: Seu IP local (ex: 192.168.1.100)
     - **Protocolo**: TCP

4. **Acesso externo**:
   - Use seu IP público: `http://SEU_IP_PUBLICO:3000`
   - Exemplo: `http://177.123.45.67:3000`

#### 4.2. Considerações de Segurança para Acesso Externo

⚠️ **IMPORTANTE**: Antes de expor para a internet, considere:

1. **Usar HTTPS**: Configure um certificado SSL (Let's Encrypt gratuito)
2. **Autenticação**: Certifique-se de que o sistema de login está funcionando
3. **Firewall**: Configure regras mais restritivas
4. **Atualizações**: Mantenha o sistema atualizado
5. **Backup**: Faça backup regular dos dados

## 🔧 Solução de Problemas

### Erro: "Não consigo acessar de outro dispositivo"

1. **Verifique o firewall**:
   ```powershell
   # Verificar se a regra existe
   Get-NetFirewallRule -DisplayName "FinBot Port 3000"
   ```

2. **Verifique se o servidor está rodando**:
   - Confirme que o servidor está ativo no terminal
   - Verifique se mostra: `Server running on http://0.0.0.0:3000/`

3. **Teste a conexão**:
   ```powershell
   # De outro dispositivo, teste se a porta está aberta
   Test-NetConnection -ComputerName SEU_IP_LOCAL -Port 3000
   ```

4. **Verifique o IP**:
   - Certifique-se de usar o IP correto
   - Se estiver usando Wi-Fi, use o IP do adaptador Wi-Fi
   - Se estiver usando cabo, use o IP do adaptador Ethernet

### Erro: "Conexão recusada"

- Verifique se o servidor está realmente rodando
- Verifique se não há outro processo usando a porta 3000
- Reinicie o servidor

### Erro: "Timeout" (apenas acesso externo)

- Verifique se o Port Forwarding está configurado corretamente
- Verifique se seu provedor de internet não bloqueia portas
- Alguns ISPs bloqueiam portas comuns (80, 443, 3000, etc.)

## 📝 Comandos Úteis

### Verificar se a porta está aberta (Windows)
```powershell
netstat -an | findstr :3000
```

### Verificar processos usando a porta 3000
```powershell
Get-NetTCPConnection -LocalPort 3000
```

### Verificar regras do firewall
```powershell
Get-NetFirewallRule -DisplayName "*3000*"
```

### Remover regra do firewall (se necessário)
```powershell
Remove-NetFirewallRule -DisplayName "FinBot Port 3000"
```

## 🎯 Resumo Rápido

1. ✅ Servidor já está configurado (`0.0.0.0`)
2. 🔍 Descubra seu IP local: `ipconfig`
3. 🔥 Configure firewall: Permitir porta 3000 TCP
4. 🌐 Teste localmente: `http://SEU_IP_LOCAL:3000`
5. 🌍 (Opcional) Configure Port Forwarding para acesso externo

## ⚠️ Avisos Importantes

- **Rede Local**: Geralmente seguro, mas certifique-se de que sua rede Wi-Fi tem senha
- **Internet**: Para acesso de outras redes, veja: [`docs/ACESSO_EXTERNO_INTERNET.md`](./ACESSO_EXTERNO_INTERNET.md)
- **Desenvolvimento**: Para desenvolvimento/teste, acesso local é suficiente
- **Produção**: Para produção, considere usar serviços como:
  - **Cloud Run** (Google Cloud)
  - **Railway**
  - **Render**
  - **Vercel**
  - **Heroku**

## 🌐 Acesso de Outras Redes

Se você precisa que pessoas **fora da sua rede local** acessem o servidor, consulte o guia completo:

👉 **[Guia de Acesso Externo](./ACESSO_EXTERNO_INTERNET.md)**

Este guia inclui:
- ✅ **ngrok** (mais fácil, recomendado para testes)
- ✅ **Port Forwarding** (acesso direto via IP público)
- ✅ **Serviços de túnel alternativos**
- ✅ **Deploy em cloud** (para produção)
- ✅ **Configurações de segurança**

---

**Dúvidas?** Consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

