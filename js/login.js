const loginForm = document.getElementById("loginForm");
const mensagemErro = document.getElementById("mensagemErro");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const emailCorreto = "admin@stocklanche.com";
    const senhaCorreta = "123456";

    if (email === emailCorreto && senha === senhaCorreta) {

        sessionStorage.setItem("usuarioLogado", "true");

        window.location.href = "dashboard.html";

    } else {

        mensagemErro.textContent =
            "E-mail ou senha inválidos.";

    }

});git status