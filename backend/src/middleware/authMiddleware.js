const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../middleware/tokenBlacklist"); // assegure-se de que o caminho esteja correto

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(400)
        .json({ mensagem: "Token de autenticação não fornecido" });
    }

    const [bearer, token] = req.headers.authorization.split(" ");
    if (bearer !== "Bearer") {
      return res
        .status(401)
        .json({ mensagem: "Token de autenticação inválido" });
    }

    // Verifica se o token está na lista negra
    if (tokenBlacklist.contains(token)) {
      return res
        .status(401)
        .json({ mensagem: "Token na lista negra, faça login novamente" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ mensagem: "Token expirou, faça login novamente" });
        } else if (err.name === "JsonWebTokenError") {
          return res
            .status(401)
            .json({ mensagem: "Token de autenticação inválido" });
        } else {
          return res
            .status(401)
            .json({ mensagem: "Token de autenticação inválido" });
        }
      }
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = authMiddleware;
