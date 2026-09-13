const produtoForm = document.getElementById("produtoForm");
const listaProdutos = document.getElementById("listaProdutos");
const mensagemProduto = document.getElementById("mensagemProduto");

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

let produtoEmEdicaoId = null;

function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function exibirProdutos() {

    listaProdutos.innerHTML = "";

    produtos.forEach(function (produto) {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td>${produto.unidade}</td>
            <td>${produto.quantidade}</td>

            <td>
                <button
                    type="button"
                    class="btn-editar"
                    data-id="${produto.id}">
                    Editar
                </button>
            </td>
        `;

        listaProdutos.appendChild(linha);
    });
}

function iniciarEdicao(id) {

    const produto = produtos.find(function (item) {
        return item.id === id;
    });

    if (!produto) {
        return;
    }

    produtoEmEdicaoId = id;

    document.getElementById("nome").value = produto.nome;
    document.getElementById("descricao").value = produto.descricao;
    document.getElementById("unidade").value = produto.unidade;
    document.getElementById("quantidade").value = produto.quantidade;

    btnSalvar.textContent = "Salvar Alterações";
    btnCancelar.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cancelarEdicao() {

    produtoEmEdicaoId = null;

    produtoForm.reset();

    document.getElementById("quantidade").value = 0;

    btnSalvar.textContent = "+ Salvar Produto";
    btnCancelar.hidden = true;

    mensagemProduto.textContent = "";
}

produtoForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const unidade = document.getElementById("unidade").value;
    const quantidade = Number(document.getElementById("quantidade").value);

    if (!nome || !descricao || !unidade || quantidade < 0) {

        mensagemProduto.textContent =
            "Preencha corretamente todos os campos.";

        return;
    }

    if (produtoEmEdicaoId !== null) {

        const indice = produtos.findIndex(function (produto) {
            return produto.id === produtoEmEdicaoId;
        });

        if (indice !== -1) {

            produtos[indice].nome = nome;
            produtos[indice].descricao = descricao;
            produtos[indice].unidade = unidade;
            produtos[indice].quantidade = quantidade;
            produtos[indice].ultimaAtualizacao =
                new Date().toLocaleDateString("pt-BR");
        }

        mensagemProduto.textContent =
            "Produto atualizado com sucesso!";

    } else {

        let novoId = Date.now();

        while (produtos.some(function (produto) {
            return produto.id === novoId;
        })) {
            novoId += 1;
        }

        const novoProduto = {

            id: novoId,
            nome: nome,
            descricao: descricao,
            unidade: unidade,
            quantidade: quantidade,

            ultimaAtualizacao:
                new Date().toLocaleDateString("pt-BR")
        };

        produtos.push(novoProduto);

        mensagemProduto.textContent =
            "Produto cadastrado com sucesso!";
    }

    salvarProdutos();

    exibirProdutos();

    produtoForm.reset();

    document.getElementById("quantidade").value = 0;

    produtoEmEdicaoId = null;

    btnSalvar.textContent = "+ Salvar Produto";
    btnCancelar.hidden = true;

    setTimeout(function () {
        mensagemProduto.textContent = "";
    }, 3000);
});

listaProdutos.addEventListener("click", function (event) {

    if (event.target.classList.contains("btn-editar")) {

        const id = Number(event.target.dataset.id);

        iniciarEdicao(id);
    }
});

btnCancelar.addEventListener("click", cancelarEdicao);

exibirProdutos();