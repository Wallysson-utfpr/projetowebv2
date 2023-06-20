import React from "react";
import axios from "axios"; // Não esqueça de importar o Axios
import { removeToken } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

function HomePage() {
  const handleLogout = () => {
    // Envia uma solicitação POST para a rota de logout no servidor
    const token = localStorage.getItem("token"); // Supondo que o token está armazenado no Local Storage

    axios
      .post(
        "http://localhost:3001/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Adiciona o token ao header da solicitação
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          toast.success("Logout realizado com sucesso!", {
            autoClose: 100,
            onClose: () => {
              removeToken(); // Remove o token
              localStorage.clear(); //limpa o localstor
              window.location.reload(); // Recarrega a página
            },
          });
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Erro ao fazer logout");
      });
  };

  const redirectCadastro = () => {
    window.location.href = "/cadastroMoeda";
  };

  const redirectLista = () => {
    window.location.href = "/listaMoeda";
  };

  return (
    <div className="container">
      <div className="menu">
        <button className="btn-padrao" onClick={redirectCadastro}>
          Cadastrar Moeda
        </button>
        <button className="btn-padrao" onClick={redirectLista}>
          Listar Moedas
        </button>
        <div className="logout-btn">
          <input
            type="button"
            className="logout"
            value="Logout"
            onClick={handleLogout}
          />
          <ToastContainer />
        </div>
      </div>
      <div className="content">
        <h1 className="txtHome">Bem vindo(a) a tela Home!</h1>
      </div>
    </div>
  );
}

export default HomePage;
