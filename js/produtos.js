const produtoForm =
    document.getElementById(
        "produtoForm"
    );

const listaProdutos =
    document.getElementById(
        "listaProdutos"
    );

const mensagemProduto =
    document.getElementById(
        "mensagemProduto"
    );

const campoNome =
    document.getElementById(
        "nome"
    );

const campoDescricao =
    document.getElementById(
        "descricao"
    );

const campoUnidade =
    document.getElementById(
        "unidade"
    );

const campoQuantidade =
    document.getElementById(
        "quantidade"
    );

const btnSalvar =
    document.getElementById(
        "btnSalvar"
    );

const btnCancelar =
    document.getElementById(
        "btnCancelar"
    );


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

    if (tipo === "erro") {

        mensagemProduto.style.color =
            "#c62828";

    } else {

        mensagemProduto.style.color =
            "#15803d";
    }


    setTimeout(
        () => {

            mensagemProduto.textContent =
                "";

        },
        3000
    );
}


// ======================================================
// EXIBIR PRODUTOS
// ======================================================

function exibirProdutos() {

    listaProdutos.innerHTML = "";


    produtos.forEach(
        function (produto) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${produto.nome || ""}
                </td>

                <td>
                    ${produto.descricao || ""}
                </td>

                <td>
                    ${produto.unidade || ""}
                </td>

                <td>
                    ${produto.quantidade ?? 0}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn-editar"
                        data-id="${produto.id}"
                    >
                        Editar
                    </button>

                </td>
            `;


            listaProdutos.appendChild(
                linha
            );
        }
    );
}


// ======================================================
// CARREGAR PRODUTOS DA API
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

        console.error(
            "Erro ao carregar produtos:",
            erro
        );


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
// INICIAR EDIÇÃO
// ======================================================

function iniciarEdicao(id) {

    const produto =
        produtos.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);
            }
        );


    if (!produto) {

        mostrarMensagem(
            "Produto não encontrado.",
            "erro"
        );

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


    btnCancelar.hidden = false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// CANCELAR EDIÇÃO
// ======================================================

function cancelarEdicao() {

    limparFormulario();

    mensagemProduto.textContent = "";
}


// ======================================================
// SUBMIT
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


        btnSalvar.disabled = true;


        try {

            // =============================================
            // EDITAR PRODUTO
            // =============================================

            if (
                produtoEmEdicao !== null
            ) {

                btnSalvar.textContent =
                    "Atualizando...";


                const resposta =
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


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    mostrarMensagem(
                        dados.mensagem ||
                        "Erro ao atualizar produto.",
                        "erro"
                    );

                    return;
                }


                mostrarMensagem(
                    dados.mensagem ||
                    "Produto atualizado com sucesso!"
                );


                limparFormulario();


                await carregarProdutos();


                return;
            }


            // =============================================
            // CADASTRAR NOVO PRODUTO
            // =============================================

            btnSalvar.textContent =
                "Salvando...";


            const resposta =
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


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                mostrarMensagem(
                    dados.mensagem ||
                    "Erro ao cadastrar produto.",
                    "erro"
                );

                return;
            }


            mostrarMensagem(
                dados.mensagem ||
                "Produto cadastrado com sucesso!"
            );


            limparFormulario();


            await carregarProdutos();


        } catch (erro) {

            console.error(
                "Erro na operação:",
                erro
            );


            mostrarMensagem(
                "Não foi possível conectar à API.",
                "erro"
            );


        } finally {

            btnSalvar.disabled =
                false;


            if (
                produtoEmEdicao === null
            ) {

                btnSalvar.textContent =
                    "+ Salvar Produto";

            } else {

                btnSalvar.textContent =
                    "Salvar Alterações";
            }
        }
    }
);


// ======================================================
// BOTÃO EDITAR
// ======================================================

listaProdutos.addEventListener(
    "click",

    function (event) {

        if (
            event.target
                .classList
                .contains(
                    "btn-editar"
                )
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );


            iniciarEdicao(id);
        }
    }
);


// ======================================================
// BOTÃO CANCELAR
// ======================================================

btnCancelar.addEventListener(
    "click",
    cancelarEdicao
);


// ======================================================
// CARREGAMENTO INICIAL
// ======================================================

carregarProdutos();