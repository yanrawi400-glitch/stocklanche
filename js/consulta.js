const campoPesquisa = document.getElementById("pesquisaProduto");
const tabelaConsulta = document.getElementById("tabelaConsulta");
const nenhumProduto = document.getElementById("nenhumProduto");

let produtos = [];


// ======================================================
// DEFINIR STATUS DO ESTOQUE
// ======================================================

function definirStatus(quantidade) {

    const quantidadeNumerica = Number(quantidade);

    if (quantidadeNumerica <= 10) {
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


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    // O SQLite retorna:
    // YYYY-MM-DD HH:MM:SS

    const parteData = data.split(" ")[0];

    const partes = parteData.split("-");

    if (partes.length !== 3) {
        return data;
    }

    const ano = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    return `${dia}/${mes}/${ano}`;
}


// ======================================================
// EXIBIR PRODUTOS NA TABELA
// ======================================================

function exibirConsulta(lista) {

    tabelaConsulta.innerHTML = "";

    if (lista.length === 0) {

        nenhumProduto.textContent =
            "Nenhum produto encontrado.";

        return;
    }

    nenhumProduto.textContent = "";

    lista.forEach(function (produto) {

        const status =
            definirStatus(produto.quantidade);

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome || ""}</td>

            <td>${produto.quantidade ?? 0}</td>

            <td>${produto.unidade || ""}</td>

            <td>
                ${formatarData(
                    produto.ultima_atualizacao
                )}
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


// ======================================================
// BUSCAR PRODUTOS NA API
// ======================================================

async function carregarProdutos() {

    nenhumProduto.textContent =
        "Carregando produtos...";

    try {

        const resposta = await fetch(
            "/api/produtos"
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            nenhumProduto.textContent =
                dados.mensagem ||
                "Erro ao carregar produtos.";

            return;
        }

        produtos = dados.produtos || [];

        exibirConsulta(produtos);

    } catch (erro) {

        console.error(
            "Erro ao consultar produtos:",
            erro
        );

        nenhumProduto.textContent =
            "Não foi possível conectar à API.";
    }
}


// ======================================================
// PESQUISA POR NOME
// ======================================================

campoPesquisa.addEventListener(
    "input",
    function () {

        const termo =
            campoPesquisa.value
                .toLowerCase()
                .trim();

        const resultados =
            produtos.filter(
                function (produto) {

                    return (
                        produto.nome || ""
                    )
                        .toLowerCase()
                        .includes(termo);
                }
            );

        exibirConsulta(resultados);
    }
);


// ======================================================
// CARREGAMENTO INICIAL
// ======================================================

carregarProdutos();