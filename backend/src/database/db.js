const mongoose = require("mongoose");
const Usuario = require("../models/User");

const url_prod =
  "mongodb+srv://wallysson:barbosa@cluster1.cs8yfic.mongodb.net/projweb?maxPoolSize=10&wtimeoutMS=2500";

const conectDatabase = () => {
  mongoose
    .connect(url_prod, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout depois de 5s tentando estabelecer uma conexão
      socketTimeoutMS: 45000, // Fecha o socket após 45s de inatividade
    })
    .then(() => console.log("Conexão com MongoDB estabelecida com sucesso!"))
    .catch((error) => console.log("Erro ao conectar com MongoDB:", error));
};

module.exports = conectDatabase;
