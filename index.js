
// Importa o framework Express/dependências (criação do API)
const express = require('express');

// Importa o banco de dados
const db = require('./database');

// Importa a autenticação JWT
const jwt = require('jsonwebtoken');

// Cria a aplicação Express
const app = express();

// Permite que o API compreenda o JSON no body das requisições
app.use(express.json());

// Chave secreta para a assinatura do token
const SECRET = "escudo_do_segredo"

// POST: Login do Usuário (gera um token)
app.post('/login', (req, res) => {

  // Pega o email enviado no body
  const { email } = req.body;

  // Verifica se o email foi enviado
  if (!email) {
    return res.status(400).json({ erro: "Email obrigatório" });
  }

  // Cria o token com o email
  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' }); // expireIn define o tempo de validade (1 hora)
  
  res.json({ token }); // Retorna o token para o cliente
});

// Middleware de autenticação (protege as rotas)
function autenticarToken(req, res, next) {

  // Pega o header Authorization
  const authHeader = req.headers['authorization'];

  // Retorna erro se o token não for enviado
  if (!authHeader) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  // "Bearer TOKEN"
  // Pega o token (após o espaço)
  const token = authHeader.split(' ')[1];

  // Verifica se o token é válido
  jwt.verify(token, SECRET, (err, user) => {

    // Se inválido ou expirado
    if (err) {
      return res.status(403).json({ erro: "Token inválido" });
    }

    // Salva os dados do usuário dentro da requisição
    req.user = user;

    // Continua para a próxima função/rota
    next();
  });
}
// ================================= USUÁRIOS =================================

// POST: Cria um novo usuário
app.post('/api/usuarios', (req, res) => {

  // Pega os dados do body
  const { nome, email } = req.body;

  // Verificação de campos obrigatórios
  if (!nome || !email) {
    return res.status(400).json({ erro: "Dados obrigatórios" });
  }

  // SQL de inserção
  const sql = `INSERT INTO usuarios (nome, email) VALUES (?, ?)`;

  // Executa o INSERT no banco
  db.run(sql, [nome, email], function(err) {

    // Em caso de erro no banco de dados
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    // Retorna o usuário criado com status code 201 Created
    res.status(201).json({ id: 
      this.lastID, // ID do registro criado
      nome,
      email });
  });
});



// ================================== LIVROS ==================================

// GET: Filtro e Paginação
app.get('/api/livros', (req, res) => { // req = requisição do cliente, res = resposta da API
  // Pega as query params da URL (? g enero =...&page=...)
  const { genero, page = 1 } = req.query;

  // Define o limite de registros por página
  const limit = 5;

  // Calcula quantos registros pular (offset)
  const offset = (page - 1) * limit;

  // Query base
  let sql = "SELECT * FROM livros";

  // Parâmetros da query (evita SQL Injection)
  let params = [];

  // Se o usuário enviar filtração por gênero
  if (genero) {
    // Condição WHERE
    sql += " WHERE genero = ?"

    // Adiciona o valor no array de parâmetros
    params.push(genero)
  }
  // Adiciona paginação
  sql += " LIMIT ? OFFSET ?";

  // Adiciona os valores no params
  params.push(limit, offset);

  // Executa a consulta
  db.all(sql, params, (err, rows) => {

  // Caso de erro
  if (err) {
    return res.status(500).json({ erro: err.message });
  }

  // Retorna os resultados
  res.json(rows);
  });
});

// Rota que junta livros + usuários
app.get('/api/livros-com-usuario', (req, res) => {

  // JOIN: conecta as tabelas livros e usuarios
  const sql = `
    SELECT livros.*, usuarios.nome AS usuario_nome
    FROM livros

    LEFT JOIN usuarios ON livros.usuario_id = usuarios.id
  `;

  // Executa a query
  db.all(sql, [], (err, rows) => {

    // Tratamento de erro
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    // Retorna os dados combinados
    res.json(rows);
  });
});

// GET: Listar livros
// app.get('/api/livros', (req, res) => { // req = requisição do cliente, res = resposta da API

    // Consulta SQL para buscar todos os livros
  //  db.all("SELECT * FROM livros", [], (err, rows) => { // err = erro, rows = linhas retornadas do db
   //     if (err) { // Erro no banco de dados
    //        return res.status(500).json({ erro: err.message}); // Erro genérico do servidor
     //   }
      //  res.json(rows); // Retorna todos os livros encontrados
    //});
//});

// GET: Busca por ID
app.get('/api/livros/:id', (req, res) => {
    db.get("SELECT * FROM livros WHERE id = ?", [req.params.id], (err, row) => {
    
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    // Se não encontrou o livro, retorna o erro 404 Not Found  
    if (!row) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    res.json(row); // Retorna o livro encontrado
  });
});

// POST: Criar um novo livro + JWT
app.post('/api/livros', autenticarToken, (req, res) => {

    // Pega os dados enviados no body na requisição
    const { titulo, autor, genero, paginas, usuario_id } = req.body;

    // Verificação de campos obrigatórios
    if (
        titulo === undefined ||
        autor === undefined ||
        genero === undefined ||
        paginas === undefined
    ) {

    // Retorna o erro 400 Bad Request
    return res.status(400).json({ erro: "Campos obrigatórios" });
    }

    // Verificação de tipos inválidos
    if (
        typeof titulo !== "string" || titulo.trim() === "" ||
        typeof autor !== "string" || autor.trim() === "" ||
        typeof genero !== "string" || genero.trim() === "" ||
        typeof paginas !== "number" || paginas <= 0
    ) {
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    // Query SQL para inserir no banco de dados
    const sql = `
        INSERT INTO livros (titulo, autor, genero, paginas, usuario_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    // Executa o INSERT
    db.run(sql, [titulo, autor, genero, paginas, usuario_id], function(err) {
        
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        // Retorna o livro criado com status code 201 Created
        res.status(201).json({
            id: this.lastID, // ID do registro criado
            titulo,
            autor,
            genero,
            paginas,
            usuario_id
        });
    });
});

// PUT:
app.put('/api/livros/:id', (req, res) => {
    const { titulo, autor, genero, paginas } = req.body;

    const sql = `
    UPDATE livros
    SET titulo = ?, autor = ?, genero = ?, paginas = ?
    WHERE id = ?
  `;

  db.run(sql, [titulo, autor, genero, paginas, req.params.id], function(err) {
    if (err) {
        return res.status(500).json({ erro: err.message });
    }
    // 'this.changes' = números de registros afetados/alterados

    // Se nenhum registro foi alterado
    if (this.changes === 0) {
        return res.status(404).json({ erro: "Livro não encontrado "});
    }
    // Retorna o livro atualizado
    res.json({ mensagem: "Livro atualizado" })
  });
});
app.delete('/api/livros/:id', (req, res) => {
  
  // 'WHERE id = ?' evita SQL Injection (invasão/manipulação do db) por segurança 
  db.run("DELETE FROM livros WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    // Se não encontrou o livro
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }

    res.json({ mensagem: "Livro removido" });
  });
});

const PORT = process.env.PORT || 3001;

// Inicializa o servidor
app.listen(PORT, () => {
  console.log("🚀 API com banco rodando em http://localhost:3001'!");
});
