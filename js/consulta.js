const campoPesquisa = document.getElementById("pesquisaProduto");
const tabelaConsulta = document.getElementById("tabelaConsulta");
const nenhumProduto = document.getElementById("nenhumProduto");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function definirStatus(quantidade) {

    if (quantidade <= 10) {
        return {
            texto: "Baixo",
            classe: "status-baixo"
        };
    }

    return {
        texto: "Normal",
        classe: "status-normal"
    };
}

function exibirConsulta(lista) {

    tabelaConsulta.innerHTML = "";

    if (lista.length === 0) {

        nenhumProduto.textContent =
            "Nenhum produto encontrado.";

        return;
    }

    nenhumProduto.textContent = "";

    lista.forEach(function (produto) {

        const status = definirStatus(produto.quantidade);

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>

            <td>${produto.quantidade}</td>

            <td>${produto.unidade}</td>

            <td>
                ${produto.ultimaAtualizacao || "-"}
            </td>

            <td>
                <span class="${status.classe}">
                    ${status.texto}
                </span>
            </td>
        `;

        tabelaConsulta.appendChild(linha);
    });
}

campoPesquisa.addEventListener("input", function () {

    const termo = campoPesquisa.value
        .toLowerCase()
        .trim();

    const resultados = produtos.filter(function (produto) {

        return produto.nome
            .toLowerCase()
            .includes(termo);
    });

    exibirConsulta(resultados);
});

exibirConsulta(produtos);