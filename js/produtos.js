const produtoForm = document.getElementById("produtoForm");
const listaProdutos = document.getElementById("listaProdutos");
const mensagemProduto = document.getElementById("mensagemProduto");

const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const campoUnidade = document.getElementById("unidade");
const campoQuantidade = document.getElementById("quantidade");

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");

// Mantém os produtos antigos funcionando durante a migração para a API
let produtos = JSON.parse(
    localStorage.getItem("produtos")
) || [];

let produtoEmEdicao = null;


// ======================================================
// SALVAR PRODUTOS NO LOCALSTORAGE
// ======================================================

function salvarProdutosLocalmente() {
    localStorage.setItem(
        "produtos",
        JSON.stringify(produtos)
    );
}


// ======================================================
// MOSTRAR MENSAGEM
// ======================================================

function mostrarMensagem(mensagem, tipo = "sucesso") {

    mensagemProduto.textContent = mensagem;

    if (tipo === "erro") {
        mensagemProduto.style.color = "#c62828";
    } else {
        mensagemProduto.style.color = "#15803d";
    }

    setTimeout(() => {
        mensagemProduto.textContent = "";
    }, 3000);
}


// ======================================================
// EXIBIR PRODUTOS NA TABELA
// ======================================================

function exibirProdutos() {

    listaProdutos.innerHTML = "";

    produtos.forEach((produto, index) => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome || ""}</td>
            <td>${produto.descricao || ""}</td>
            <td>${produto.unidade || ""}</td>
            <td>${produto.quantidade ?? 0}</td>

            <td>
                <button
                    type="button"
                    class="btn-editar"
                    data-index="${index}"
                >
                    Editar
                </button>
            </td>
        `;

        listaProdutos.appendChild(linha);
    });
}


// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormulario() {

    produtoForm.reset();

    campoQuantidade.value = 0;

    produtoEmEdicao = null;

    btnSalvar.textContent = "+ Salvar Produto";

    btnCancelar.hidden = true;
}


// ======================================================
// INICIAR EDIÇÃO
// ======================================================

function iniciarEdicao(index) {

    const produto = produtos[index];

    if (!produto) {
        return;
    }

    produtoEmEdicao = index;

    campoNome.value = produto.nome || "";
    campoDescricao.value = produto.descricao || "";
    campoUnidade.value = produto.unidade || "";
    campoQuantidade.value = produto.quantidade ?? 0;

    btnSalvar.textContent = "Salvar Alterações";

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
// CADASTRO / EDIÇÃO
// ======================================================

produtoForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const nome = campoNome.value.trim();
        const descricao = campoDescricao.value.trim();
        const unidade = campoUnidade.value;
        const quantidade = Number(
            campoQuantidade.value
        );

        // Validação básica
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


        // ==================================================
        // EDIÇÃO LOCAL
        // A integração da edição com a API será feita no API06
        // ==================================================

        if (produtoEmEdicao !== null) {

            produtos[produtoEmEdicao] = {
                ...produtos[produtoEmEdicao],
                nome,
                descricao,
                unidade,
                quantidade
            };

            salvarProdutosLocalmente();

            exibirProdutos();

            limparFormulario();

            mostrarMensagem(
                "Produto atualizado com sucesso!"
            );

            return;
        }


        // ==================================================
        // NOVO PRODUTO - SALVA PELA API
        // ==================================================

        try {

            btnSalvar.disabled = true;
            btnSalvar.textContent = "Salvando...";

            const resposta = await fetch(
                "/api/produtos",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        nome,
                        descricao,
                        unidade,
                        quantidade
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                mostrarMensagem(
                    dados.mensagem ||
                    "Erro ao cadastrar produto.",
                    "erro"
                );

                return;
            }


            // Produto retornado pelo banco/API
            const novoProduto = {
                id: dados.produto.id,
                nome: dados.produto.nome,
                descricao:
                    dados.produto.descricao,
                unidade:
                    dados.produto.unidade,
                quantidade:
                    dados.produto.quantidade
            };


            // Mantém a interface atual funcionando
            // até a implementação do API05
            produtos.push(novoProduto);

            salvarProdutosLocalmente();

            exibirProdutos();

            limparFormulario();

            mostrarMensagem(
                dados.mensagem ||
                "Produto cadastrado com sucesso!"
            );

        } catch (erro) {

            console.error(
                "Erro ao cadastrar produto:",
                erro
            );

            mostrarMensagem(
                "Não foi possível conectar à API.",
                "erro"
            );

        } finally {

            btnSalvar.disabled = false;

            if (produtoEmEdicao === null) {
                btnSalvar.textContent =
                    "+ Salvar Produto";
            }
        }
    }
);


// ======================================================
// CLIQUE NO BOTÃO EDITAR
// ======================================================

listaProdutos.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "btn-editar"
            )
        ) {

            const index = Number(
                event.target.dataset.index
            );

            iniciarEdicao(index);
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

exibirProdutos();