import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setToken } from "../../services/auth";

import "./styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handlePassword = (event) => {
    setSenha(event.target.value);
  };

  const handleRedirect = () => {
    window.location.href = "/homePage";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("/authenticate", {
        email,
        senha: senha,
      });

      if (response.status === 200) {
        const token = response.data.token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setToken(token);
        toast.success("Login realizado com sucesso!", {
          autoClose: 1000,
          onClose: handleRedirect,
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        setFeedbackMessage("E-mail ou senha incorretos");
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <main className="login">
          <div className="login-container">
            <h1 className="login-title">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                className="login-input"
                type="email"
                name="email"
                placeholder="Email..."
                value={email}
                onChange={handleEmail}
              />
              <span className="login-input-border"></span>
              <input
                className="login-input"
                type="password"
                name="senha"
                placeholder="Senha..."
                value={senha}
                onChange={handlePassword}
              />
              <span className="login-input-border"></span>
              {feedbackMessage && (
                <p className="feedback-message">{feedbackMessage}</p>
              )}
              <input
                type="submit"
                name="Login"
                value="Login"
                className="bt-login"
              />
              <ToastContainer />
              <Link className="bt-cadastro" to="/cadastro">
                Cadastrar
              </Link>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;
