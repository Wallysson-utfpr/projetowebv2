const express = require("express");
const router = express.Router();
const Usuario = require("../models/User");
const Moeda = require("../models/Moeda");
const jwt = require("jsonwebtoken");
const rabbitmq = require("../services/rabbitmq");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const winston = require("winston");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const tokenBlacklist = require("../middleware/tokenBlacklist");
const sanitizeHtml = require("sanitize-html");

//Configuração do limite de taxa (Rate Limiting)
//controla solicitações de IP em uma rota específica por período de tempo,
//evitando ataques de força bruta e DDoS.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 solicitações por IP
});

//Configuração de desaceleração (Slow Down)
//atrasa respostas a solicitações de IP após um número definido,
//protegendo contra ataques automatizados.
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 100, // após 100 solicitações, começa a atrasar
  delayMs: 500, // cada solicitação atrasada em 500ms
});

// Configuração do logger para registro de segurança
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "security.log" })],
});

module.exports = (io) => {
  // Rota para autenticação
  let loginAttempts = {}; //quantidade de tentativas e o tempo da última tentativa

  router.post(
    "/authenticate",
    limiter,
    speedLimiter,
    [body("email").trim(), body("senha").trim()],
    async (req, res) => {
      let { email, senha } = req.body;

      email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
      senha = sanitizeHtml(senha, { allowedTags: [], allowedAttributes: {} });

      try {
        // Verifica se o usuário já tentou logar antes
        if (loginAttempts[email] && loginAttempts[email].attempts >= 3) {
          const now = Date.now();
          const diff = (now - loginAttempts[email].last) / 1000;

          // Se ainda não passou 5 segundos desde a última tentativa
          if (diff < 5) {
            return res.status(429).json({
              mensagem: "Tente novamente!",
            });
          }
        }

        const user = await Usuario.findOne({ email: email });

        if (user) {
          const match = await bcrypt.compare(senha, user.senha);
          if (match) {
            // Reseta as tentativas
            loginAttempts[email] = { attempts: 0, last: Date.now() };

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "1h",
            });

            // Armazenar token no Local Storage
            res.status(200).json({ token });
          } else {
            if (!loginAttempts[email]) {
              // Cria o controle para o usuário
              loginAttempts[email] = { attempts: 0, last: Date.now() };
            }

            // Incrementa as tentativas
            loginAttempts[email].attempts++;
            loginAttempts[email].last = Date.now();

            logger.error("Erro de autenticação: E-mail ou senha incorretos");
            res.status(401).json({ mensagem: "E-mail ou senha incorretos" });
          }
        } else {
          if (!loginAttempts[email]) {
            // Cria o controle para o usuário
            loginAttempts[email] = { attempts: 0, last: Date.now() };
          }

          // Incrementa as tentativas
          loginAttempts[email].attempts++;
          loginAttempts[email].last = Date.now();

          logger.error("Erro de autenticação: E-mail ou senha incorretos");
          res.status(401).json({ mensagem: "E-mail ou senha incorretos" });
        }
      } catch (error) {
        logger.error("Erro ao realizar a autenticação:", error);
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao realizar a autenticação!" });
      }
    }
  );

  // Rota para logout
  router.delete("/logout", authMiddleware, (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      //Adiciona tokens a uma lista negra
      tokenBlacklist.add(token);
      res.status(200).json({ message: "Logout realizado com sucesso!" });
      console.log("Token adicionado à black List: " + token);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao realizar logout!" });
    }
  });

  // Rota para listar todas as moedas com Redis cache
  router.get("/moedas", authMiddleware, async (req, res) => {
    try {
      const redisClient = req.redisClient;

      // Verifica se os dados estão no cache do Redis
      const reply = await redisClient.get("moedas");

      if (reply) {
        const moedas = JSON.parse(reply);
        res.json(moedas);
      } else {
        const moedas = await Moeda.find();
        redisClient.set("moedas", JSON.stringify(moedas), "EX", 60);
        res.json(moedas);

        // Registro da busca
        logger.info("Busca de moedas realizada");
      }
    } catch (error) {
      logger.error("Erro ao obter as moedas:", error);
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao obter as moedas" });
    }
  });

  // Rota para criar usuario
  router.post(
    "/users",
    limiter, // Aplicação do limite de taxa
    speedLimiter, // Aplicação da desaceleração
    [
      // Verifique se o e-mail é válido e normaliza
      body("email").isEmail().normalizeEmail(),

      // Verifique se a senha tem pelo menos 5 caracteres e escapa de caracteres HTML
      body("senha")
        .isLength({ min: 5 })
        .withMessage("A senha deve ter no mínimo 5 caracteres.")
        .escape(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Se houver erros de validação, retorna como resposta
        return res.status(400).json({ errors: errors.array() });
      }

      let { email, senha } = req.body;

      email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
      senha = sanitizeHtml(senha, { allowedTags: [], allowedAttributes: {} });

      try {
        // Gerar o hash da senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        const user = new Usuario({ email: email, senha: hashedSenha });

        await user.save();
        res.status(200).json({ mensagem: "Usuário cadastrado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: "Erro ao cadastrar o usuário" });
      }
    }
  );

  // Rota para atualizar uma moeda
  router.put("/moedas/:id", authMiddleware, async (req, res) => {
    try {
      let id = req.params.id;
      let { nome, alta, baixa } = req.body;

      id = sanitizeHtml(id, { allowedTags: [], allowedAttributes: {} });
      nome = sanitizeHtml(nome, { allowedTags: [], allowedAttributes: {} });
      alta = sanitizeHtml(alta, { allowedTags: [], allowedAttributes: {} });
      baixa = sanitizeHtml(baixa, { allowedTags: [], allowedAttributes: {} });

      const moeda = await Moeda.findByIdAndUpdate(
        id,
        { nome, alta, baixa },
        { new: true }
      );

      const redisClient = req.redisClient;
      redisClient.del("moedas");

      io.emit("atualizacao", "Moeda atualizada!");

      res.status(200).json({ mensagem: "Moeda editada com sucesso!", moeda });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao editar a moeda!" });
    }
  });

  // Rota para excluir uma moeda
  router.delete("/moedas/:id", authMiddleware, async (req, res) => {
    try {
      let id = req.params.id;

      id = sanitizeHtml(id, { allowedTags: [], allowedAttributes: {} });

      const moeda = await Moeda.findByIdAndDelete(id);

      if (!moeda) {
        return res.status(404).json({ mensagem: "Moeda não encontrada!" });
      }

      const redisClient = req.redisClient;
      redisClient.del("moedas");

      // Registro da exclusão da moeda
      logger.info("Moeda excluída:", { nome: moeda.nome });

      // Emitindo uma atualização para os clientes conectados
      io.emit("atualizacao", "Moeda excluída!");

      res.status(200).json({ mensagem: "Moeda excluída com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao excluir a moeda!" });
    }
  });

  // Rota para enviar moedas utilizando RabbitMQ
  router.post("/moedas", (req, res, next) => {
    let { nome, alta, baixa } = req.body;

    nome = sanitizeHtml(nome, { allowedTags: [], allowedAttributes: {} });
    alta = sanitizeHtml(alta, { allowedTags: [], allowedAttributes: {} });
    baixa = sanitizeHtml(baixa, { allowedTags: [], allowedAttributes: {} });

    const moedas = { nome, alta, baixa };

    rabbitmq
      .enviarTarefaParaFila(moedas)
      .then(() => {
        try {
          const redisClient = req.redisClient;
          redisClient.del("moedas");

          io.emit("novamoeda", moedas);

          io.emit("moedasuccess", "Moeda cadastrada com sucesso!");

          // Registro da postagem
          logger.info("Moeda cadastrada:", { nome });

          res.status(200).json({ mensagem: "Moeda cadastrada com sucesso!" });

          next(); // Chama o próximo middleware ou rota após a resposta ser enviada
        } catch (err) {
          logger.error("Erro ao cadastrar a moeda:", err);
          console.error(err);
          res.status(500).json({ mensagem: "Erro ao cadastrar a moeda!" });
        }
      })
      .catch((error) => {
        console.error("Erro ao enfileirar as moedas de envio :", error);
        res.status(500).json({ error: "Erro ao enfileirar as moedas!" });
      });
  });

  return router;
};
