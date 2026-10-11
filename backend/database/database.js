const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const caminhoBanco = path.join(__dirname, "stocklanche.db");

const db = new sqlite3.Database(caminhoBanco, (erro) => {
    if (erro) {
        console.error("Erro ao conectar ao banco:", erro.message);
    } else {
        console.log("Banco de dados StockLanche conectado com sucesso!");
    }
});

db.serialize(() => {

    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            perfil TEXT DEFAULT 'usuario'
        )
    `);

    // Tabela de produtos
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            unidade TEXT NOT NULL,
            quantidade INTEGER NOT NULL DEFAULT 0,
            data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
            ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Usuário administrador inicial
    const senhaCriptografada = bcrypt.hashSync("123456", 10);

    db.run(
        `
        INSERT OR IGNORE INTO usuarios
        (nome, email, senha, perfil)
        VALUES (?, ?, ?, ?)
        `,
        [
            "Administrador",
            "admin@stocklanche.com",
            senhaCriptografada,
            "admin"
        ]
    );

    console.log("Tabelas verificadas/criadas com sucesso!");
});

module.exports = db;