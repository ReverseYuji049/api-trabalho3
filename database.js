
// Importa o SQLite
const sqlite3 = require('sqlite3').verbose();

// Cria/abre o banco de dados
const db = new sqlite3.Database('./livros.db');

// Executa comandos em sequência
db.serialize(() => {

  // Cria a tabela de usuários se não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);

  // Cria a tabela de livros se não existir
  // Se relaciona com a tabela usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      genero TEXT NOT NULL,
      paginas INTEGER NOT NULL,
      usuario_id INTEGER,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
  db.run('ALTER TABLE livros ADD COLUMN usuario_id INTEGER;')
});   

// Mensagem para confirmar que o banco de dados foi aberto/carregado
console.log('Banco de dados criado!')

// Exporta o banco para uso externo
module.exports = db;
