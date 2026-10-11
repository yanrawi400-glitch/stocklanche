const loginForm = document.getElementById("loginForm");
const mensagemErro = document.getElementById("mensagemErro");

function mostrarErro(mensagem) {
    if (mensagemErro) {
        mensagemErro.textContent = mensagem;
    } else {
        alert(mensagem);
    }
}

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const senha = document
        .getElementById("senha")
        .value;

    if (mensagemErro) {
        mensagemErro.textContent = "";
    }

    try {

        const resposta = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(
                dados.mensagem ||
                "E-mail ou senha inválidos."
            );

            return;
        }

        // Guarda a informação de que o usuário está autenticado
        sessionStorage.setItem(
            "usuarioLogado",
            "true"
        );

        // Guarda os dados retornados pela API
        sessionStorage.setItem(
            "usuario",
            JSON.stringify(dados.usuario)
        );

        // Envia o usuário para o dashboard
        window.location.href = "dashboard.html";

    } catch (erro) {

        console.error(
            "Erro ao conectar com a API:",
            erro
        );

        mostrarErro(
            "Não foi possível conectar ao servidor."
        );
    }
});