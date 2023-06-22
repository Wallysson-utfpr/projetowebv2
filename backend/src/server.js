const express = require("express");
const app = express();
const conectDatabase = require("./database/db");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const usuarioRouter = require("./routes/rotasUser")(io);
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet"); //proteção contra XSS

const options = {
  key: fs.readFileSync("./chave_privada.key"),
  cert: fs.readFileSync("./certificado.crt"),
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar o CORS com opções específicas
app.use(
  cors({
    origin: "http://localhost:3000", // Defina a origem permitida do cliente
    credentials: true, // Permitir o envio de cookies de autenticação (se aplicável)
  })
);

app.use(helmet());

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("connect", () => console.log(`Redis Connected`));

  await redisClient.connect();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
})();

app.use((req, res, next) => {
  req.redisClient = redisClient; // Adiciona o cliente Redis ao objeto `req`
  next();
});

app.use("/", usuarioRouter);

conectDatabase();

https.createServer(options, app).listen(443, () => {
  console.log("Servidor HTTPS iniciado na porta 443");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { io };
