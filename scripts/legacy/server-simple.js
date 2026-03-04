const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

// Middleware para parsing JSON
app.use(express.json());

// Serve os arquivos da pasta dist
app.use(express.static(path.join(__dirname, "dist")));

// Todas as rotas SPA redirecionam para index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos de: ${path.join(__dirname, "dist")}`);
});