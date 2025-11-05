# FinBot - Assistente Financeiro Multimodal Open-Source

**FinBot** é um assistente financeiro pessoal inteligente e open-source que combina processamento de linguagem natural, visão computacional e análise de dados para ajudar você a gerenciar suas finanças de forma eficiente. O sistema processa documentos financeiros através de OCR, categoriza gastos automaticamente, fornece insights personalizados e mantém você informado sobre notícias do mercado financeiro.

## 🌟 Funcionalidades Principais

### Chatbot Multimodal Inteligente

O FinBot utiliza modelos de IA avançados via **Groq API** para fornecer assistência financeira conversacional. O chatbot é capaz de processar tanto texto quanto imagens, permitindo que você envie fotos de recibos, notas fiscais, extratos bancários e boletos para análise automática.

**Capacidades do Chat:**
- Processamento de texto e imagens em tempo real
- Reconhecimento de documentos financeiros via OCR
- Análise de gráficos e tabelas em imagens
- Respostas contextualizadas sobre educação financeira
- Recomendações personalizadas de orçamento e investimentos

### Gestão Financeira Completa

O sistema oferece ferramentas abrangentes para controle financeiro pessoal, incluindo categorização automática de gastos, definição de orçamentos personalizados, acompanhamento de metas de investimento e alertas inteligentes sobre gastos excessivos.

**Recursos de Gestão:**
- Categorização automática de transações usando IA
- Orçamentos personalizados por categoria
- Metas financeiras com acompanhamento de progresso
- Alertas proativos sobre gastos fora do padrão
- Projeções financeiras baseadas em histórico

### Integração com Notícias Financeiras

Mantenha-se atualizado com as últimas notícias do mercado financeiro através da integração com **NewsAPI**. O sistema busca notícias relevantes sobre investimentos, analisa o impacto potencial no seu portfólio e filtra informações por setor e tipo de ativo.

**Funcionalidades de Notícias:**
- Busca em tempo real de notícias sobre investimentos
- Análise de sentimento e impacto no portfólio
- Filtros por setor econômico (tecnologia, energia, saúde, etc.)
- Notícias sobre indicadores de mercado (Ibovespa, dólar, SELIC)
- Recomendações baseadas em tendências do mercado

### Visualização de Dados Interativa

Acompanhe suas finanças através de gráficos interativos e dashboards personalizados. O sistema gera visualizações claras de gastos por categoria, tendências ao longo do tempo, comparativos com orçamento e projeções futuras.

**Visualizações Disponíveis:**
- Gráficos de gastos e receitas por categoria
- Evolução temporal de despesas e economia
- Comparativo: orçamento planejado vs. realizado
- Projeções financeiras baseadas em tendências
- Dashboard personalizado com métricas-chave

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

O FinBot foi desenvolvido com tecnologias modernas e open-source, garantindo performance, escalabilidade e facilidade de manutenção.

#### Frontend Web
- **Framework:** React 19 com TypeScript
- **Estilização:** Tailwind CSS 4
- **Componentes:** shadcn/ui para interface consistente
- **Gráficos:** Recharts para visualizações interativas
- **Comunicação:** tRPC para type-safe API calls

#### Backend
- **Runtime:** Node.js com Express 4
- **API:** tRPC 11 para endpoints type-safe
- **Banco de Dados:** MySQL/TiDB com Drizzle ORM
- **Processamento Python:** Serviços de IA e OCR

#### Inteligência Artificial
- **LLM:** Groq API com modelos Llama 3.2 e Llama 3.3
- **Visão Computacional:** Llama 3.2 90B Vision Preview
- **OCR:** Tesseract com suporte a português e inglês
- **Processamento de Imagens:** OpenCV

#### Integrações
- **Notícias:** NewsAPI para notícias financeiras
- **Armazenamento:** S3 para documentos e imagens
- **Autenticação:** OAuth2 com Manus Auth

### Estrutura do Projeto

```
finbot/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários e configurações
│   │   └── App.tsx           # Rotas e layout principal
│   └── public/               # Assets estáticos
├── server/                    # Backend Node.js
│   ├── services/             # Serviços Python (IA, OCR, News)
│   │   ├── groq_service.py   # Integração com Groq API
│   │   ├── ocr_service.py    # Processamento OCR
│   │   └── news_service.py   # Busca de notícias
│   ├── routers.ts            # Endpoints tRPC
│   ├── db.ts                 # Funções de banco de dados
│   └── python-bridge.ts      # Bridge Node.js ↔ Python
├── drizzle/                   # Schemas e migrações
│   └── schema.ts             # Definição de tabelas
├── docs/                      # Documentação
└── docker/                    # Configurações Docker
```

## 🚀 Instalação e Configuração

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js** 22.x ou superior
- **Python** 3.11 ou superior
- **MySQL** 8.0 ou superior (ou TiDB Cloud)
- **Tesseract OCR** 4.x ou superior

### Instalação do Tesseract

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-por
```

**macOS:**
```bash
brew install tesseract tesseract-lang
```

**Windows:**
Baixe o instalador em: https://github.com/UB-Mannheim/tesseract/wiki

### Configuração do Projeto

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/finbot.git
cd finbot
```

2. **Instale as dependências Node.js:**
```bash
pnpm install
```

3. **Instale as dependências Python:**
```bash
pip3 install groq pytesseract opencv-python-headless Pillow pdf2image newsapi-python python-multipart aiofiles
```

4. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/finbot

# Groq API (obtenha em: https://console.groq.com/keys)
GROQ_API_KEY=sua_chave_groq_aqui

# NewsAPI (obtenha em: https://newsapi.org/register)
NEWS_API_KEY=sua_chave_newsapi_aqui

# JWT para autenticação
JWT_SECRET=sua_chave_secreta_aleatoria

# OAuth (se usar Manus Auth)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

5. **Execute as migrações do banco de dados:**
```bash
pnpm db:push
```

6. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📊 Schemas do Banco de Dados

O FinBot utiliza um schema relacional bem estruturado para armazenar dados financeiros de forma segura e eficiente.

### Tabelas Principais

#### users
Armazena informações dos usuários autenticados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| openId | VARCHAR(64) | ID OAuth do usuário |
| name | TEXT | Nome completo |
| email | VARCHAR(320) | Email |
| role | ENUM | Papel (user, admin) |
| createdAt | TIMESTAMP | Data de criação |

#### categories
Categorias de gastos e receitas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| name | VARCHAR(100) | Nome da categoria |
| type | ENUM | Tipo (expense, income) |
| icon | VARCHAR(50) | Ícone da categoria |
| color | VARCHAR(20) | Cor para visualização |
| userId | INT (FK) | Dono da categoria |
| isDefault | INT | Se é categoria padrão |

#### transactions
Transações financeiras (gastos e receitas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Dono da transação |
| categoryId | INT (FK) | Categoria associada |
| amount | INT | Valor em centavos |
| description | TEXT | Descrição da transação |
| type | ENUM | Tipo (expense, income) |
| date | TIMESTAMP | Data da transação |
| documentUrl | VARCHAR(500) | URL do documento |
| extractedData | TEXT | Dados extraídos (JSON) |

#### budgets
Orçamentos definidos por categoria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Dono do orçamento |
| categoryId | INT (FK) | Categoria associada |
| amount | INT | Valor limite em centavos |
| period | ENUM | Período (monthly, weekly, yearly) |
| alertThreshold | INT | % para alerta |
| isActive | INT | Se está ativo |

#### goals
Metas financeiras dos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Dono da meta |
| name | VARCHAR(200) | Nome da meta |
| targetAmount | INT | Valor alvo em centavos |
| currentAmount | INT | Valor atual em centavos |
| deadline | TIMESTAMP | Prazo da meta |
| priority | ENUM | Prioridade (low, medium, high) |
| status | ENUM | Status (active, completed, cancelled) |

#### documents
Documentos financeiros processados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Dono do documento |
| fileUrl | VARCHAR(500) | URL do arquivo |
| fileName | VARCHAR(255) | Nome do arquivo |
| documentType | ENUM | Tipo (recibo, nota_fiscal, extrato, boleto) |
| ocrText | TEXT | Texto extraído via OCR |
| extractedData | TEXT | Dados estruturados (JSON) |
| processingStatus | ENUM | Status (pending, processing, completed, failed) |

## 🔧 API e Exemplos de Uso

### Serviço Groq (IA)

#### Análise de Imagem de Documento

```python
from server.services.groq_service import groq_service

# Extrair dados de um recibo
resultado = groq_service.extract_financial_data(
    image_url="https://exemplo.com/recibo.jpg",
    document_type="recibo"
)

print(resultado)
# {
#   "valor_total": 45.90,
#   "data": "15/01/2025",
#   "estabelecimento": "Supermercado ABC",
#   "categoria_sugerida": "alimentacao",
#   "itens": [...]
# }
```

#### Categorização Automática de Transação

```python
# Categorizar uma transação
categoria = groq_service.categorize_transaction(
    description="Uber para o trabalho",
    amount=25.50,
    context="Deslocamento diário"
)

print(categoria)
# {
#   "categoria": "transporte",
#   "confianca": 0.95,
#   "subcategoria": "transporte_app",
#   "sugestao_orcamento": true
# }
```

#### Assistente Financeiro Conversacional

```python
# Conversar com o assistente
resposta = groq_service.financial_assistant(
    user_message="Como posso economizar R$ 1000 por mês?",
    conversation_history=[
        {"role": "user", "content": "Ganho R$ 5000 por mês"},
        {"role": "assistant", "content": "Entendo. Vamos analisar..."}
    ]
)

print(resposta)
# "Para economizar R$ 1000 mensais com sua renda de R$ 5000, 
#  recomendo a regra 50-30-20: destine 50% para necessidades..."
```

### Serviço OCR

#### Extrair Dados de Boleto

```python
from server.services.ocr_service import ocr_service

# Processar boleto
dados_boleto = ocr_service.extract_boleto_data(
    image_path="/caminho/para/boleto.jpg"
)

print(dados_boleto)
# {
#   "linha_digitavel": "34191.79001 01043.510047 91020.150008 1 96610000015000",
#   "valor": 150.00,
#   "vencimento": "15/02/2025",
#   "beneficiario": "Empresa XYZ Ltda"
# }
```

#### Extrair Dados de Nota Fiscal

```python
# Processar nota fiscal
dados_nf = ocr_service.extract_invoice_data(
    image_path="/caminho/para/nota_fiscal.jpg"
)

print(dados_nf)
# {
#   "numero_nf": "123456",
#   "serie": "1",
#   "data_emissao": "10/01/2025",
#   "cnpj_emitente": "12.345.678/0001-90",
#   "valor_total": 350.00,
#   "chave_acesso": "35250112345678000190550010001234561234567890"
# }
```

### Serviço de Notícias

#### Buscar Notícias sobre Investimentos

```python
from server.services.news_service import news_service

# Buscar notícias sobre ações
noticias = news_service.get_investment_news(
    asset_type="acoes",
    page_size=10
)

for noticia in noticias:
    print(f"{noticia['title']} - {noticia['source']}")
```

#### Analisar Impacto de Notícias

```python
# Analisar impacto no portfólio
analise = news_service.analyze_news_impact(
    news_list=noticias,
    portfolio_sectors=["tecnologia", "energia"]
)

print(f"Sentimento geral: {analise['sentiment_score']}")
print(f"Notícias relevantes: {len(analise['relevant_to_portfolio'])}")
```

## 🐳 Deploy com Docker

### Dockerfile

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:22-slim

# Instalar Python e dependências do sistema
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    tesseract-ocr \
    tesseract-ocr-por \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY requirements.txt ./

# Instalar dependências Node.js
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Instalar dependências Python
RUN pip3 install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY . .

# Build do frontend
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/finbot
      - GROQ_API_KEY=${GROQ_API_KEY}
      - NEWS_API_KEY=${NEWS_API_KEY}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=finbot
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Executar com Docker

```bash
# Build e iniciar containers
docker-compose up -d

# Executar migrações
docker-compose exec app pnpm db:push

# Ver logs
docker-compose logs -f app
```

## 🤝 Contribuindo

Contribuições são bem-vindas! O FinBot é um projeto open-source e sua ajuda é fundamental para torná-lo ainda melhor.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature** (`git checkout -b feature/MinhaFeature`)
3. **Commit suas mudanças** (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push para a branch** (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes (ESLint, Prettier)
- Escreva testes para novas funcionalidades
- Atualize a documentação quando necessário
- Descreva claramente as mudanças no Pull Request
- Mantenha commits pequenos e focados

### Reportando Bugs

Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Informações do ambiente (OS, versões)

### Sugestões de Melhorias

Tem uma ideia para melhorar o FinBot? Abra uma issue com:
- Descrição detalhada da sugestão
- Casos de uso
- Benefícios esperados
- Possíveis implementações

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2025 FinBot Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Agradecimentos

O FinBot foi construído com tecnologias open-source incríveis:

- **Groq** - Por fornecer acesso a modelos de IA de alta performance
- **Tesseract OCR** - Por possibilitar o reconhecimento de texto em imagens
- **NewsAPI** - Por disponibilizar notícias financeiras em tempo real
- **React** e **Node.js** - Pela base sólida do framework
- **Drizzle ORM** - Pela excelente experiência com banco de dados
- **shadcn/ui** - Pelos componentes UI elegantes e acessíveis

## 📞 Suporte e Contato

- **Documentação:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/finbot/issues)
- **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/finbot/discussions)

---

**Desenvolvido com ❤️ pela comunidade open-source**

*FinBot - Seu assistente financeiro inteligente e open-source*
