const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/status", (req, res) => {
    res.json({
        mensagem: "API StockLanche funcionando!"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor StockLanche rodando na porta ${PORT}`);
});
