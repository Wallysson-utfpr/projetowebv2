const jwt = require("jsonwebtoken");

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

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token de autenticação inválido" });
  }
};

module.exports = authMiddleware;
