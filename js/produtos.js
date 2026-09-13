const produtoForm = document.getElementById("produtoForm");
const listaProdutos = document.getElementById("listaProdutos");
const mensagemProduto = document.getElementById("mensagemProduto");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

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
        `;

        listaProdutos.appendChild(linha);

    });
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

    const novoProduto = {
        id: Date.now(),
        nome: nome,
        descricao: descricao,
        unidade: unidade,
        quantidade: quantidade,
        ultimaAtualizacao: new Date().toLocaleDateString("pt-BR")
    };

    produtos.push(novoProduto);

    salvarProdutos();

    exibirProdutos();

    produtoForm.reset();

    document.getElementById("quantidade").value = 0;

    mensagemProduto.textContent =
        "Produto cadastrado com sucesso!";

    setTimeout(function () {
        mensagemProduto.textContent = "";
    }, 3000);

});

exibirProdutos();