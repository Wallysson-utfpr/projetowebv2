// auth.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Função para gerar o token
const generateToken = (userId) => {
  const token = jwt.sign({ userId }, "abobrinha123", { expiresIn: "1h" });
  return token;
};

// Função para verificar o token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, "abobrinha123");
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Função para comparar a senha
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Função para gerar o hash da senha
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

module.exports = { generateToken, verifyToken, comparePassword, hashPassword };
