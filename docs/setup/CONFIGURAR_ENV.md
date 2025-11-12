# ⚙️ Configuração do Arquivo .env

## 📝 Passo a Passo

### 1. Criar o arquivo .env

Na raiz do projeto, crie um arquivo chamado `.env` (ou copie do `.env.example`):

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Configurar as variáveis

Edite o arquivo `.env` e configure:

```env
# Database (Docker MySQL - porta 3307)
DATABASE_URL=mysql://bolsinho:bolsinho_password@localhost:3307/bolsinho

# JWT Secret (OBRIGATÓRIO)
# Gere uma chave aleatória segura
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_mude_em_producao

# Groq API (opcional - para chat com IA)
GROQ_API_KEY=sua_chave_groq_aqui

# News API (opcional - para notícias financeiras)
NEWS_API_KEY=sua_chave_news_api_aqui

# Brapi API (RECOMENDADO - para dados de ações brasileiras)
# Obtenha sua chave em: https://brapi.dev/
BRAPI_API_KEY=sua_chave_brapi_aqui

# Forge API (opcional - fallback para LLM)
BUILT_IN_FORGE_API_URL=https://api.forge.ai
BUILT_IN_FORGE_API_KEY=sua_chave_forge_aqui
```

### 3. Gerar JWT_SECRET

**IMPORTANTE**: Gere uma chave secreta aleatória para `JWT_SECRET`:

#### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

#### Linux/Mac:
```bash
openssl rand -base64 32
```

#### Ou use um gerador online:
- https://www.random.org/strings/
- Gere uma string de 32-64 caracteres aleatórios

### 4. Configurar APIs (Opcional)

#### Groq API
1. Acesse: https://console.groq.com/
2. Crie uma conta
3. Gere uma API Key
4. Cole no `.env`: `GROQ_API_KEY=sua_chave_aqui`

#### News API
1. Acesse: https://newsapi.org/
2. Crie uma conta gratuita
3. Gere uma API Key
4. Cole no `.env`: `NEWS_API_KEY=sua_chave_aqui`

#### Brapi API (RECOMENDADO para ações brasileiras)
1. Acesse: https://brapi.dev/
2. Crie uma conta gratuita
3. Gere uma API Key
4. Cole no `.env`: `BRAPI_API_KEY=sua_chave_aqui`
5. **Importante**: Sem a API key, algumas ações podem retornar erro 401 (rate limit)

### 5. Verificar configuração

Certifique-se de que:
- ✅ `DATABASE_URL` está correto (porta 3307)
- ✅ `JWT_SECRET` está configurado (não use o valor padrão em produção)
- ✅ Banco MySQL está rodando: `docker ps`

### 6. Testar conexão

Execute o servidor:

```bash
pnpm dev
```

Se tudo estiver correto, você verá:
- ✅ Servidor rodando em `http://localhost:3000`
- ✅ Sem erros de conexão com o banco
- ✅ Frontend carregando normalmente

---

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo `.env` no Git
- ⚠️ **NUNCA** compartilhe suas chaves de API
- ⚠️ Use `JWT_SECRET` diferente em desenvolvimento e produção
- ⚠️ Gere uma chave secreta forte (mínimo 32 caracteres)

---

## ✅ Checklist

- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] `DATABASE_URL` configurado (porta 3307)
- [ ] `JWT_SECRET` configurado (chave aleatória)
- [ ] `GROQ_API_KEY` configurado (opcional)
- [ ] `NEWS_API_KEY` configurado (opcional)
- [ ] Banco MySQL rodando: `docker ps`
- [ ] Servidor iniciando sem erros: `pnpm dev`

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL is not configured"

**Solução**: Verifique se o arquivo `.env` existe e tem a variável `DATABASE_URL`.

### Erro: "Access denied for user"

**Solução**: Verifique as credenciais no `.env`:
- User: `bolsinho`
- Password: `bolsinho_password`
- Port: `3307`

### Erro: "Cannot connect to MySQL"

**Solução**: 
1. Verifique se o banco está rodando: `docker ps`
2. Verifique a porta (deve ser 3307)
3. Aguarde alguns segundos (MySQL demora para inicializar)

### Erro: "JWT_SECRET is not configured"

**Solução**: Adicione `JWT_SECRET` no arquivo `.env` com uma chave aleatória.

