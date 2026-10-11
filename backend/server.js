const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./database/database");

const app = express();
const PORT = 3000;

// ======================================================
// CONFIGURAÇÕES
// ======================================================

app.use(cors());
app.use(express.json());

// Disponibiliza os arquivos do front-end
app.use(express.static(path.join(__dirname, "..")));

// Abre a tela de login
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});

// ======================================================
// TESTE DA API
// ======================================================

app.get("/api/status", (req, res) => {
    res.json({
        mensagem: "API StockLanche funcionando!"
    });
});

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "E-mail e senha são obrigatórios."
        });
    }

    db.get(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        (erro, usuario) => {

            if (erro) {
                console.error("Erro no banco:", erro);

                return res.status(500).json({
                    mensagem: "Erro interno do servidor."
                });
            }

            if (!usuario) {
                return res.status(401).json({
                    mensagem: "E-mail ou senha inválidos."
                });
            }

            const senhaCorreta = bcrypt.compareSync(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    mensagem: "E-mail ou senha inválidos."
                });
            }

            return res.json({
                mensagem: "Login realizado com sucesso!",
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                }
            });
        }
    );
});

// ======================================================
// CADASTRO DE PRODUTOS
// ======================================================

app.post("/api/produtos", (req, res) => {

    const {
        nome,
        descricao,
        unidade,
        quantidade
    } = req.body;

    if (
        !nome ||
        !unidade ||
        quantidade === undefined ||
        quantidade === null
    ) {
        return res.status(400).json({
            mensagem:
                "Nome, unidade e quantidade são obrigatórios."
        });
    }

    const quantidadeNumerica = Number(quantidade);

    if (
        Number.isNaN(quantidadeNumerica) ||
        quantidadeNumerica < 0
    ) {
        return res.status(400).json({
            mensagem:
                "A quantidade deve ser um número maior ou igual a zero."
        });
    }

    const sql = `
        INSERT INTO produtos
        (
            nome,
            descricao,
            unidade,
            quantidade,
            ultima_atualizacao
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    db.run(
        sql,
        [
            nome.trim(),
            descricao ? descricao.trim() : "",
            unidade.trim(),
            quantidadeNumerica
        ],
        function (erro) {

            if (erro) {
                console.error(
                    "Erro ao cadastrar produto:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao cadastrar produto."
                });
            }

            return res.status(201).json({
                mensagem:
                    "Produto cadastrado com sucesso!",

                produto: {
                    id: this.lastID,
                    nome: nome.trim(),
                    descricao:
                        descricao
                            ? descricao.trim()
                            : "",
                    unidade: unidade.trim(),
                    quantidade: quantidadeNumerica
                }
            });
        }
    );
});

// ======================================================
// LISTAGEM DE PRODUTOS
// API05
// ======================================================

app.get("/api/produtos", (req, res) => {

    const sql = `
        SELECT
            id,
            nome,
            descricao,
            unidade,
            quantidade,
            data_cadastro,
            ultima_atualizacao
        FROM produtos
        ORDER BY id DESC
    `;

    db.all(
        sql,
        [],
        (erro, produtos) => {

            if (erro) {

                console.error(
                    "Erro ao listar produtos:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao consultar produtos."
                });
            }

            return res.json({
                quantidade: produtos.length,
                produtos: produtos
            });
        }
    );
});

// ======================================================
// INICIA O SERVIDOR
// ======================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        "----------------------------------"
    );

    console.log(
        "StockLanche iniciado com sucesso!"
    );

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

    console.log(
        "----------------------------------"
    );
});