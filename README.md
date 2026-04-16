# API REST de Livros

## Descrição

API REST desenvolvida com Node.js e Express para gerenciamento de livros, incluindo autenticação com JWT, relacionamento entre entidades e consultas com filtro e paginação.

---

## Tecnologias utilizadas

* Node.js
* Express
* SQLite
* JSON Web Token (JWT)

---

## Funcionalidades

### Autenticação

* Login com geração de token JWT
* Proteção de rotas com middleware

### Usuários

* Criar usuário

### Livros

* Criar livro (protegido por JWT)
* Listar livros
* Buscar livro por ID
* Atualizar livro
* Deletar livro

### Relacionamentos

* Associação entre livros e usuários
* Consulta com JOIN (`livros + usuarios`)

### Extras

* Filtro por gênero
* Paginação de resultados

---

## Estrutura do Projeto

```
/projeto
│
├── database.js
├── index.js
├── livros.db
├── package.json
├── README.md
└── postman/
```

---

## Como executar

1. Instalar dependências:

```
npm install
```

2. Rodar o servidor:

```
node index.js
```

3. Acessar:

```
http://localhost:3001
```

---

## Autenticação JWT

### Login

POST `/login`

Body:

```json
{
  "email": "teste@email.com"
}
```

Resposta:

```json
{
  "token": "..."
}
```

---

### Uso do token

Enviar no header:

```
Authorization: Bearer TOKEN
```

---

## Exemplos de Rotas

### Criar usuário

POST `/api/usuarios`

### Criar livro (protegido)

POST `/api/livros`

### Listar livros (paginação)

GET `/api/livros?page=1`

### Filtrar por gênero

GET `/api/livros?genero=Ação`

### JOIN (livros + usuários)

GET `/api/livros-com-usuario`

---

## Testes

Os testes foram realizados utilizando o Postman, incluindo:

* Validação de status HTTP
* Autenticação JWT
* Persistência de dados
* Testes de CRUD completos

---

## Autor

Projeto desenvolvido por Yuji para fins acadêmicos.
