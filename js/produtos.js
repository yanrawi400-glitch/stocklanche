const produtoForm =
    document.getElementById("produtoForm");

const listaProdutos =
    document.getElementById("listaProdutos");

const mensagemProduto =
    document.getElementById("mensagemProduto");

const campoNome =
    document.getElementById("nome");

const campoDescricao =
    document.getElementById("descricao");

const campoUnidade =
    document.getElementById("unidade");

const campoQuantidade =
    document.getElementById("quantidade");

const btnSalvar =
    document.getElementById("btnSalvar");

const btnCancelar =
    document.getElementById("btnCancelar");


let produtos = [];
let produtoEmEdicao = null;


// ======================================================
// MENSAGEM
// ======================================================

function mostrarMensagem(
    mensagem,
    tipo = "sucesso"
) {

    mensagemProduto.textContent =
        mensagem;

    mensagemProduto.style.color =
        tipo === "erro"
            ? "#c62828"
            : "#15803d";

    setTimeout(() => {

        mensagemProduto.textContent = "";

    }, 3000);
}


// ======================================================
// EXIBIR PRODUTOS
// ======================================================

function exibirProdutos() {

    listaProdutos.innerHTML = "";

    produtos.forEach(function (produto) {

        const linha =
            document.createElement("tr");

        linha.innerHTML = `

            <td>${produto.nome || ""}</td>

            <td>${produto.descricao || ""}</td>

            <td>${produto.unidade || ""}</td>

            <td>${produto.quantidade ?? 0}</td>

            <td>

                <button
                    type="button"
                    class="btn-editar"
                    data-id="${produto.id}"
                    style="
                        background:#2563eb;
                        color:white;
                        border:none;
                        padding:7px 10px;
                        border-radius:5px;
                        cursor:pointer;
                    "
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="btn-entrada"
                    data-id="${produto.id}"
                    style="
                        background:#16a34a;
                        color:white;
                        border:none;
                        padding:7px 10px;
                        border-radius:5px;
                        margin-left:4px;
                        cursor:pointer;
                    "
                >
                    Entrada
                </button>


                <button
                    type="button"
                    class="btn-saida"
                    data-id="${produto.id}"
                    style="
                        background:#f59e0b;
                        color:white;
                        border:none;
                        padding:7px 10px;
                        border-radius:5px;
                        margin-left:4px;
                        cursor:pointer;
                    "
                >
                    Saída
                </button>


                <button
                    type="button"
                    class="btn-excluir"
                    data-id="${produto.id}"
                    style="
                        background:#dc3545;
                        color:white;
                        border:none;
                        padding:7px 10px;
                        border-radius:5px;
                        margin-left:4px;
                        cursor:pointer;
                    "
                >
                    Excluir
                </button>

            </td>
        `;

        listaProdutos.appendChild(
            linha
        );
    });
}


// ======================================================
// CARREGAR PRODUTOS
// ======================================================

async function carregarProdutos() {

    try {

        const resposta =
            await fetch(
                "/api/produtos"
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            mostrarMensagem(
                dados.mensagem ||
                "Erro ao carregar produtos.",
                "erro"
            );

            return;
        }

        produtos =
            dados.produtos || [];

        exibirProdutos();

    } catch (erro) {

        console.error(erro);

        mostrarMensagem(
            "Não foi possível conectar à API.",
            "erro"
        );
    }
}


// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormulario() {

    produtoForm.reset();

    campoQuantidade.value = 0;

    produtoEmEdicao = null;

    btnSalvar.textContent =
        "+ Salvar Produto";

    btnCancelar.hidden = true;
}


// ======================================================
// EDITAR
// ======================================================

function iniciarEdicao(id) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!produto) {
        return;
    }

    produtoEmEdicao =
        produto.id;

    campoNome.value =
        produto.nome || "";

    campoDescricao.value =
        produto.descricao || "";

    campoUnidade.value =
        produto.unidade || "";

    campoQuantidade.value =
        produto.quantidade ?? 0;

    btnSalvar.textContent =
        "Salvar Alterações";

    btnCancelar.hidden =
        false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// MOVIMENTAÇÃO
// ======================================================

async function movimentarProduto(
    id,
    tipo
) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!produto) {

        mostrarMensagem(
            "Produto não encontrado.",
            "erro"
        );

        return;
    }


    const acao =
        tipo === "entrada"
            ? "entrada"
            : "saída";


    const valor =
        window.prompt(
            `Informe a quantidade de ${acao} para "${produto.nome}":`
        );


    if (valor === null) {
        return;
    }


    const quantidade =
        Number(valor);


    if (
        Number.isNaN(quantidade) ||
        quantidade <= 0
    ) {

        mostrarMensagem(
            "Informe uma quantidade válida maior que zero.",
            "erro"
        );

        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/produtos/${id}/${tipo}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            quantidade
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            mostrarMensagem(
                dados.mensagem ||
                "Erro ao movimentar estoque.",
                "erro"
            );

            return;
        }


        mostrarMensagem(
            dados.mensagem
        );


        await carregarProdutos();


    } catch (erro) {

        console.error(erro);

        mostrarMensagem(
            "Não foi possível conectar à API.",
            "erro"
        );
    }
}


// ======================================================
// EXCLUIR
// ======================================================

async function excluirProduto(id) {

    const produto =
        produtos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!produto) {
        return;
    }


    const confirmar =
        window.confirm(
            `Deseja realmente excluir "${produto.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/produtos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            mostrarMensagem(
                dados.mensagem ||
                "Erro ao excluir produto.",
                "erro"
            );

            return;
        }


        mostrarMensagem(
            dados.mensagem
        );


        await carregarProdutos();


    } catch (erro) {

        mostrarMensagem(
            "Não foi possível conectar à API.",
            "erro"
        );
    }
}


// ======================================================
// CADASTRO E EDIÇÃO
// ======================================================

produtoForm.addEventListener(
    "submit",

    async function (event) {

        event.preventDefault();


        const nome =
            campoNome.value.trim();

        const descricao =
            campoDescricao.value.trim();

        const unidade =
            campoUnidade.value;

        const quantidade =
            Number(
                campoQuantidade.value
            );


        if (
            !nome ||
            !descricao ||
            !unidade ||
            Number.isNaN(quantidade) ||
            quantidade < 0
        ) {

            mostrarMensagem(
                "Preencha corretamente todos os campos.",
                "erro"
            );

            return;
        }


        try {

            let resposta;


            // EDITAR
            if (
                produtoEmEdicao !== null
            ) {

                resposta =
                    await fetch(
                        `/api/produtos/${produtoEmEdicao}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    nome,
                                    descricao,
                                    unidade,
                                    quantidade
                                })
                        }
                    );

            } else {

                // CADASTRAR
                resposta =
                    await fetch(
                        "/api/produtos",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    nome,
                                    descricao,
                                    unidade,
                                    quantidade
                                })
                        }
                    );
            }


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                mostrarMensagem(
                    dados.mensagem ||
                    "Erro na operação.",
                    "erro"
                );

                return;
            }


            limparFormulario();

            mostrarMensagem(
                dados.mensagem
            );

            await carregarProdutos();


        } catch (erro) {

            console.error(erro);

            mostrarMensagem(
                "Não foi possível conectar à API.",
                "erro"
            );
        }
    }
);


// ======================================================
// BOTÕES
// ======================================================

listaProdutos.addEventListener(
    "click",

    function (event) {

        const id =
            Number(
                event.target.dataset.id
            );


        if (
            event.target.classList.contains(
                "btn-editar"
            )
        ) {

            iniciarEdicao(id);
        }


        if (
            event.target.classList.contains(
                "btn-entrada"
            )
        ) {

            movimentarProduto(
                id,
                "entrada"
            );
        }


        if (
            event.target.classList.contains(
                "btn-saida"
            )
        ) {

            movimentarProduto(
                id,
                "saida"
            );
        }


        if (
            event.target.classList.contains(
                "btn-excluir"
            )
        ) {

            excluirProduto(id);
        }
    }
);


// ======================================================
// CANCELAR
// ======================================================

btnCancelar.addEventListener(
    "click",
    limparFormulario
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

carregarProdutos();