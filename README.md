# API REST - Gerenciamento de Livros e Autores

Uma API REST completa e profissional para gerenciamento de livros e autores, desenvolvida com Node.js, Express e SQLite. Inclui autenticação JWT, relacionamentos entre entidades, validações robustas e documentação completa.

## Objetivo

Esta API permite gerenciar um catálogo de livros e autores com funcionalidades completas de CRUD (Create, Read, Update, Delete), filtros avançados, paginação, ordenação e autenticação segura com JWT.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite (better-sqlite3)** - Banco de dados
- **JWT (jsonwebtoken)** - Autenticação segura
- **bcryptjs** - Hash de senhas
- **dotenv** - Variáveis de ambiente

## Pré-requisitos

- Node.js versão 14 ou superior
- npm ou yarn
- Git (opcional)

## Instalação e Configuração

### 1. Clonar ou Extrair o Projeto

```bash
# Se estiver em um arquivo compactado, extraia
# Se estiver usando Git:
git clone <url-do-repositorio>
cd projeto-api-livros
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado, mas você pode personalizar se quiser:

```bash
# Abra o arquivo .env e verifique:
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_mude_em_producao
```

### 4. Iniciar o Servidor

```bash
node index.js
(ou tente) npm start
```

Você verá uma mensagem como:
```
Servidor rodando na porta 3000
Acesse: http://localhost:3000
API de Livros pronta para uso!
```

## Documentação das Rotas

### Autenticação

#### 1. Registrar Novo Usuário

**Endpoint:** `POST /api/auth/register`

**Descrição:** Cria uma nova conta de usuário e retorna um token JWT.

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Resposta (201 Created):**
```json
{
  "mensagem": "Usuário registrado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Tiago Galvão",
    "email": "tiago@example.com",
    "role": "user"
  }
}
```

**Erros Possíveis:**
- `400 Bad Request` - Campos obrigatórios faltando ou inválidos
- `409 Conflict` - Email já cadastrado

---

#### 2. Fazer Login

**Endpoint:** `POST /api/auth/login`

**Descrição:** Autentica um usuário existente e retorna um token JWT.

**Body (JSON):**
```json
{
  "email": "tiago@example.com",
  "senha": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Login bem-sucedido!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Tiago Galvão",
    "email": "tiago@example.com",
    "role": "user"
  }
}
```

**Erros Possíveis:**
- `400 Bad Request` - Email e senha são obrigatórios
- `401 Unauthorized` - Email ou senha incorretos

---

### Livros

#### 1. Listar Todos os Livros (Com Filtros, Ordenação e Paginação)

**Endpoint:** `GET /api/livros`

**Descrição:** Retorna uma lista de livros com informações do autor.

**Query Parameters (Opcionais):**
- `search` - Busca por título, gênero ou nome do autor
- `genero` - Filtrar por gênero específico
- `autor_id` - Filtrar por ID do autor
- `sort_by` - Campo para ordenação (titulo, preco, ano_publicacao, estoque, autorNome)
- `order` - Ordem (asc ou desc)
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10)

**Exemplos de Requisição:**

```bash
# Listar todos os livros (padrão)
GET http://localhost:3000/api/livros

# Buscar livros de Sarah J. Maas
GET http://localhost:3000/api/livros?search=Sarah

# Filtrar por gênero e ordenar por preço
GET http://localhost:3000/api/livros?genero=Romance&sort_by=preco&order=asc

# Paginação
GET http://localhost:3000/api/livros?page=2&limit=5
```

**Resposta (200 OK):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 32,
  "data": [
    {
      "id": 1,
      "titulo": "The Love Hypothesis",
      "genero": "Romance",
      "ano_publicacao": 2021,
      "preco": 45.90,
      "estoque": 15,
      "autorId": 1,
      "autorNome": "Ali Hazelwood",
      "autorNacionalidade": "Americana"
    },
    ...
  ]
}
```

---

#### 2. Buscar Livro por ID

**Endpoint:** `GET /api/livros/:id`

**Descrição:** Retorna os detalhes de um livro específico.

**Exemplo:**
```bash
GET http://localhost:3000/api/livros/1
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "titulo": "The Love Hypothesis",
  "genero": "Romance",
  "ano_publicacao": 2021,
  "preco": 45.90,
  "estoque": 15,
  "autorId": 1,
  "autorNome": "Ali Hazelwood",
  "autorNacionalidade": "Americana"
}
```

**Erros Possíveis:**
- `404 Not Found` - Livro não encontrado

---

#### 3. Criar Novo Livro (Requer Autenticação)

**Endpoint:** `POST /api/livros`

**Descrição:** Cria um novo livro no banco de dados.

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "titulo": "Novo Livro",
  "autor_id": 1,
  "genero": "Romance",
  "ano_publicacao": 2024,
  "preco": 50.00,
  "estoque": 20
}
```

**Resposta (201 Created):**
```json
{
  "id": 33,
  "titulo": "Novo Livro",
  "genero": "Romance",
  "ano_publicacao": 2024,
  "preco": 50.00,
  "estoque": 20,
  "autorId": 1,
  "autorNome": "Ali Hazelwood",
  "autorNacionalidade": "Americana"
}
```

**Erros Possíveis:**
- `400 Bad Request` - Validação falhou
- `401 Unauthorized` - Token não fornecido
- `403 Forbidden` - Token inválido ou expirado
- `404 Not Found` - Autor não encontrado

---

#### 4. Atualizar Livro (Requer Autenticação)

**Endpoint:** `PUT /api/livros/:id`

**Descrição:** Atualiza os dados de um livro existente.

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

**Body (JSON - Todos os campos são opcionais):**
```json
{
  "titulo": "Título Atualizado",
  "preco": 55.00,
  "estoque": 25
}
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "titulo": "Título Atualizado",
  "genero": "Romance",
  "ano_publicacao": 2021,
  "preco": 55.00,
  "estoque": 25,
  "autorId": 1,
  "autorNome": "Ali Hazelwood",
  "autorNacionalidade": "Americana"
}
```

**Erros Possíveis:**
- `400 Bad Request` - Validação falhou
- `401 Unauthorized` - Token não fornecido
- `403 Forbidden` - Token inválido ou expirado
- `404 Not Found` - Livro não encontrado

---

#### 5. Deletar Livro ️ (Requer Autenticação)

**Endpoint:** `DELETE /api/livros/:id`

**Descrição:** Remove um livro do banco de dados.

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
```

**Exemplo:**
```bash
DELETE http://localhost:3000/api/livros/1
```

**Resposta (204 No Content):**
```
(Sem corpo de resposta)
```

**Erros Possíveis:**
- `401 Unauthorized` - Token não fornecido
- `403 Forbidden` - Token inválido ou expirado
- `404 Not Found` - Livro não encontrado

---

### 👥 Autores

#### 1. Listar Todos os Autores

**Endpoint:** `GET /api/autores`

**Descrição:** Retorna uma lista de todos os autores.

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Ali Hazelwood",
    "nacionalidade": "Americana",
    "data_nascimento": "1990-01-01",
    "created_at": "2024-04-16 10:00:00"
  },
  ...
]
```

---

#### 2. Buscar Autor por ID

**Endpoint:** `GET /api/autores/:id`

**Descrição:** Retorna os detalhes de um autor específico.

**Resposta (200 OK):**
```json
{
  "id": 1,
  "nome": "Ali Hazelwood",
  "nacionalidade": "Americana",
  "data_nascimento": "1990-01-01",
  "created_at": "2024-04-16 10:00:00"
}
```

---

#### 3. Criar Novo Autor (Requer Autenticação)

**Endpoint:** `POST /api/autores`

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
```

**Body (JSON):**
```json
{
  "nome": "Novo Autor",
  "nacionalidade": "Brasileira",
  "data_nascimento": "1985-05-15"
}
```

**Resposta (201 Created):**
```json
{
  "id": 11,
  "nome": "Novo Autor",
  "nacionalidade": "Brasileira",
  "data_nascimento": "1985-05-15",
  "created_at": "2024-04-16 10:30:00"
}
```

---

#### 4. Atualizar Autor (Requer Autenticação)

**Endpoint:** `PUT /api/autores/:id`

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
```

**Body (JSON - Todos os campos são opcionais):**
```json
{
  "nacionalidade": "Britânica"
}
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "nome": "Ali Hazelwood",
  "nacionalidade": "Britânica",
  "data_nascimento": "1990-01-01",
  "created_at": "2024-04-16 10:00:00"
}
```

---

#### 5. Deletar Autor (Requer Autenticação)

**Endpoint:** `DELETE /api/autores/:id`

**Headers Obrigatórios:**
```
Authorization: Bearer <seu_token_jwt>
```

**Resposta (204 No Content):**
```
(Sem corpo de resposta)
```

**Erros Possíveis:**
- `409 Conflict` - Não é possível deletar autor com livros associados

---

## Como Usar a Autenticação JWT

### 1. Registre-se ou Faça Login

Primeiro, você precisa obter um token JWT:

```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Seu Nome",
    "email": "seu@email.com",
    "senha": "senha123"
  }'

# Ou fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "senha": "senha123"
  }'
```

### 2. Use o Token em Requisições Protegidas

Copie o token retornado e use-o no header `Authorization`:

```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "titulo": "Novo Livro",
    "autor_id": 1,
    "genero": "Romance",
    "ano_publicacao": 2024,
    "preco": 50.00,
    "estoque": 20
  }'
```

## Diferenciais Implementados

 **Autenticação JWT** - Segurança com tokens JWT  
 **Relacionamentos com JOINs** - Livros com dados do autor  
 **Filtros Avançados** - Busca por título, gênero, autor  
 **Ordenação** - Ordenar por diferentes campos  
 **Paginação** - Suporte a páginas e limite de itens  
 **Validações Robustas** - Validação de todos os dados  
 **Status Codes Corretos** - HTTP status codes apropriados  
 **Tratamento de Erros** - Try-catch em todas as rotas  
 **Banco de Dados Pronto** - 32+ livros de autoras   
 **Documentação Completa** - README e exemplos detalhados  

---

## Estrutura do Projeto

```
projeto-api-livros/
├── src/
│   ├── config/
│   │   └── database.js           # Configuração do SQLite
│   ├── controllers/
│   │   ├── authController.js     # Lógica de autenticação
│   │   ├── livrosController.js   # Lógica de livros
│   │   └── autoresController.js  # Lógica de autores
│   ├── middleware/
│   │   └── auth.js               # Middleware de JWT
│   └── routes/
│       ├── auth.js               # Rotas de autenticação
│       ├── livros.js             # Rotas de livros
│       └── autores.js            # Rotas de autores
├── index.js                       # Ponto de entrada
├── package.json                   # Dependências
├── .env                          # Variáveis de ambiente
├── .env.example                  # Exemplo de .env
├── .gitignore                    # Arquivos ignorados pelo Git
├── database.db                   # Banco de dados SQLite
└── README.md                     # Este arquivo
```

---

## Testando a API

### Com Postman

1. Importe a coleção Postman (arquivo `postman_collection.json`)
2. Configure a variável `token` após fazer login
3. Teste todos os endpoints

### Com cURL

Veja os exemplos na seção de documentação das rotas acima.

---

## Deploy (Render ou Railway)

Para fazer deploy da sua API:

1. Crie uma conta no Render
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Faça o deploy

---

## Notas Importantes

- Mude o `JWT_SECRET` em produção para uma chave segura
- Nunca comite o arquivo `.env` com dados sensíveis
- Use HTTPS em produção
- Implemente rate limiting em produção

---

## Suporte

Se tiver dúvidas ou encontrar problemas, teste:

1. Se o Node.js está instalado (`node --version`)
2. Se as dependências foram instaladas (`npm install`)
3. Se o servidor está rodando (`npm start`)
4. Se o banco de dados foi criado (arquivo `database.db`)
