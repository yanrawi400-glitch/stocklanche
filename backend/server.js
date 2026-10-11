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

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// ======================================================
// PÁGINA INICIAL
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );
});


// ======================================================
// STATUS
// ======================================================

app.get("/api/status", (req, res) => {

    res.json({
        mensagem:
            "API StockLanche funcionando!"
    });
});


// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {

        return res.status(400).json({
            mensagem:
                "E-mail e senha são obrigatórios."
        });
    }

    db.get(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],

        (erro, usuario) => {

            if (erro) {

                return res.status(500).json({
                    mensagem:
                        "Erro interno do servidor."
                });
            }

            if (!usuario) {

                return res.status(401).json({
                    mensagem:
                        "E-mail ou senha inválidos."
                });
            }

            const senhaCorreta =
                bcrypt.compareSync(
                    senha,
                    usuario.senha
                );

            if (!senhaCorreta) {

                return res.status(401).json({
                    mensagem:
                        "E-mail ou senha inválidos."
                });
            }

            return res.json({

                mensagem:
                    "Login realizado com sucesso!",

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
// CADASTRO DE PRODUTO - API04
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

    const quantidadeNumerica =
        Number(quantidade);

    if (
        Number.isNaN(quantidadeNumerica) ||
        quantidadeNumerica < 0
    ) {

        return res.status(400).json({
            mensagem:
                "A quantidade deve ser maior ou igual a zero."
        });
    }

    db.run(
        `
        INSERT INTO produtos
        (
            nome,
            descricao,
            unidade,
            quantidade,
            ultima_atualizacao
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,

        [
            nome.trim(),
            descricao
                ? descricao.trim()
                : "",
            unidade.trim(),
            quantidadeNumerica
        ],

        function (erro) {

            if (erro) {

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
                    unidade:
                        unidade.trim(),
                    quantidade:
                        quantidadeNumerica
                }
            });
        }
    );
});


// ======================================================
// LISTAGEM - API05
// ======================================================

app.get("/api/produtos", (req, res) => {

    db.all(
        `
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
        `,

        [],

        (erro, produtos) => {

            if (erro) {

                return res.status(500).json({
                    mensagem:
                        "Erro ao consultar produtos."
                });
            }

            return res.json({
                quantidade:
                    produtos.length,
                produtos
            });
        }
    );
});


// ======================================================
// EDIÇÃO - API06
// ======================================================

app.put("/api/produtos/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        nome,
        descricao,
        unidade,
        quantidade
    } = req.body;

    if (
        Number.isNaN(id) ||
        id <= 0
    ) {

        return res.status(400).json({
            mensagem:
                "ID do produto inválido."
        });
    }

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

    const quantidadeNumerica =
        Number(quantidade);

    if (
        Number.isNaN(quantidadeNumerica) ||
        quantidadeNumerica < 0
    ) {

        return res.status(400).json({
            mensagem:
                "Quantidade inválida."
        });
    }

    db.get(
        `
        SELECT *
        FROM produtos
        WHERE id = ?
        `,
        [id],

        (erro, produto) => {

            if (erro) {

                return res.status(500).json({
                    mensagem:
                        "Erro ao buscar produto."
                });
            }

            if (!produto) {

                return res.status(404).json({
                    mensagem:
                        "Produto não encontrado."
                });
            }

            db.run(
                `
                UPDATE produtos
                SET
                    nome = ?,
                    descricao = ?,
                    unidade = ?,
                    quantidade = ?,
                    ultima_atualizacao =
                        CURRENT_TIMESTAMP
                WHERE id = ?
                `,

                [
                    nome.trim(),

                    descricao
                        ? descricao.trim()
                        : "",

                    unidade.trim(),
                    quantidadeNumerica,
                    id
                ],

                function (erroAtualizacao) {

                    if (erroAtualizacao) {

                        return res.status(500).json({
                            mensagem:
                                "Erro ao atualizar produto."
                        });
                    }

                    return res.json({
                        mensagem:
                            "Produto atualizado com sucesso!"
                    });
                }
            );
        }
    );
});


// ======================================================
// EXCLUSÃO - API07
// ======================================================

app.delete(
    "/api/produtos/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                mensagem:
                    "ID do produto inválido."
            });
        }

        db.get(
            `
            SELECT *
            FROM produtos
            WHERE id = ?
            `,
            [id],

            (erro, produto) => {

                if (erro) {

                    return res.status(500).json({
                        mensagem:
                            "Erro ao buscar produto."
                    });
                }

                if (!produto) {

                    return res.status(404).json({
                        mensagem:
                            "Produto não encontrado."
                    });
                }

                db.run(
                    `
                    DELETE FROM produtos
                    WHERE id = ?
                    `,
                    [id],

                    function (erroExclusao) {

                        if (erroExclusao) {

                            return res.status(500).json({
                                mensagem:
                                    "Erro ao excluir produto."
                            });
                        }

                        return res.json({
                            mensagem:
                                "Produto excluído com sucesso!"
                        });
                    }
                );
            }
        );
    }
);


// ======================================================
// MOVIMENTAÇÃO DE ESTOQUE - API08
// ======================================================

function movimentarEstoque(tipo) {

    return function (req, res) {

        const id =
            Number(req.params.id);

        const quantidade =
            Number(req.body.quantidade);


        if (
            Number.isNaN(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                mensagem:
                    "ID do produto inválido."
            });
        }


        if (
            Number.isNaN(quantidade) ||
            quantidade <= 0
        ) {

            return res.status(400).json({
                mensagem:
                    "Informe uma quantidade maior que zero."
            });
        }


        db.get(
            `
            SELECT *
            FROM produtos
            WHERE id = ?
            `,
            [id],

            (erro, produto) => {

                if (erro) {

                    return res.status(500).json({
                        mensagem:
                            "Erro ao buscar produto."
                    });
                }


                if (!produto) {

                    return res.status(404).json({
                        mensagem:
                            "Produto não encontrado."
                    });
                }


                const estoqueAtual =
                    Number(
                        produto.quantidade
                    );


                if (
                    tipo === "saida" &&
                    quantidade > estoqueAtual
                ) {

                    return res.status(400).json({
                        mensagem:
                            "A quantidade de saída é maior que o estoque disponível."
                    });
                }


                let novoEstoque;


                if (tipo === "entrada") {

                    novoEstoque =
                        estoqueAtual +
                        quantidade;

                } else {

                    novoEstoque =
                        estoqueAtual -
                        quantidade;
                }


                db.run(
                    `
                    UPDATE produtos
                    SET
                        quantidade = ?,
                        ultima_atualizacao =
                            CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,

                    [
                        novoEstoque,
                        id
                    ],

                    function (erroAtualizacao) {

                        if (erroAtualizacao) {

                            return res.status(500).json({
                                mensagem:
                                    "Erro ao atualizar estoque."
                            });
                        }


                        db.run(
                            `
                            INSERT INTO movimentacoes
                            (
                                produto_id,
                                tipo,
                                quantidade
                            )
                            VALUES (?, ?, ?)
                            `,

                            [
                                id,
                                tipo,
                                quantidade
                            ],

                            function (erroMovimentacao) {

                                if (erroMovimentacao) {

                                    return res.status(500).json({
                                        mensagem:
                                            "Erro ao registrar movimentação."
                                    });
                                }


                                const descricaoTipo =
                                    tipo === "entrada"
                                        ? "Entrada"
                                        : "Saída";


                                return res.json({

                                    mensagem:
                                        `${descricaoTipo} registrada com sucesso!`,

                                    produto: {

                                        id:
                                            produto.id,

                                        nome:
                                            produto.nome,

                                        quantidade:
                                            novoEstoque
                                    },

                                    movimentacao: {

                                        id:
                                            this.lastID,

                                        tipo:
                                            tipo,

                                        quantidade:
                                            quantidade
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    };
}


// Entrada
app.post(
    "/api/produtos/:id/entrada",
    movimentarEstoque("entrada")
);


// Saída
app.post(
    "/api/produtos/:id/saida",
    movimentarEstoque("saida")
);


// ======================================================
// CONSULTAR MOVIMENTAÇÕES
// ======================================================

app.get(
    "/api/movimentacoes",
    (req, res) => {

        db.all(
            `
            SELECT
                movimentacoes.id,
                produtos.nome AS produto,
                movimentacoes.tipo,
                movimentacoes.quantidade,
                movimentacoes.data_movimentacao
            FROM movimentacoes

            INNER JOIN produtos
                ON produtos.id =
                   movimentacoes.produto_id

            ORDER BY
                movimentacoes.id DESC
            `,

            [],

            (erro, movimentacoes) => {

                if (erro) {

                    return res.status(500).json({
                        mensagem:
                            "Erro ao consultar movimentações."
                    });
                }

                return res.json({
                    quantidade:
                        movimentacoes.length,

                    movimentacoes
                });
            }
        );
    }
);


// ======================================================
// SERVIDOR
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

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
    }
);