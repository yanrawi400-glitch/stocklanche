const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = require("./database/database");

const app = express();
const PORT = 3000;

// Permite comunicação entre front-end e API
app.use(cors());

// Permite receber dados em JSON
app.use(express.json());

// Disponibiliza os arquivos do front-end
app.use(express.static(path.join(__dirname, "..")));

// Abre a tela de login na rota principal
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});

// Rota para testar a API
app.get("/api/status", (req, res) => {
    res.json({
        mensagem: "API StockLanche funcionando!"
    });
});

// Rota de login
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

// Inicia o servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log("----------------------------------");
    console.log("StockLanche iniciado com sucesso!");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("----------------------------------");
});