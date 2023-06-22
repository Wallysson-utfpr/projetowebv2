import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRedirect = () => {
    window.location.href = "/";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (senha.length < 5) {
      const toastId = toast.error("A senha deve ter no mínimo 5 caracteres.");
      setTimeout(() => toast.dismiss(toastId), 3000);
      return;
    }
    try {
      const response = await axios.post("/users", {
        email,
        senha,
      });
      console.log(response.data);
      const toastId = toast.success("Cadastro realizado com sucesso!", {
        onClose: handleRedirect,
      });
      setTimeout(() => toast.dismiss(toastId), 3000);
    } catch (error) {
      console.error(error);
      if (error.response) {
        const toastId = toast.error(error.response.data.errors[0].msg);
        setTimeout(() => toast.dismiss(toastId), 3000);
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <main className="login">
          <div className="login-container">
            <h1 className="login-title">Cadastro</h1>
            <form onSubmit={handleSubmit} className="login-form">
              <input
                className="login-input"
                type="email"
                required
                name="iptEmail"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="login-input-border"></span>
              <input
                className="login-input"
                type="password"
                required
                name="iptSenha"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <span className="login-input-border"></span>
              <input
                type="submit"
                name="Cadastro"
                value="Cadastrar"
                className="bt-cadastrar"
              />
              <ToastContainer draggablePercent={0} />

              <Link className="bt-voltar-cadastro" to="/">
                Voltar
              </Link>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Cadastro;
