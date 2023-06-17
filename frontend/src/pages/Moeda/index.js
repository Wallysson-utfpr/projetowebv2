import React, { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";
import { io } from "socket.io-client"; // Importe a função `io` do `socket.io-client`

function FormularioMoeda() {
  const [nome, setNome] = useState("");
  const [alta, setAlta] = useState("");
  const [baixa, setBaixa] = useState("");

  const limpaForm = () => {
    setNome("");
    setAlta("");
    setBaixa("");
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("novamoeda", (moeda) => {
      console.log("Nova moeda cadastrada:", moeda);
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      axios.defaults.headers.authorization = `Bearer ${token}`;
      const response = await axios.post("/moedas", {
        nome,
        alta,
        baixa,
      });

      console.log(response.data);

      toast.success("Moeda cadastrada com sucesso!", {
        autoClose: 1000,
      });

      limpaForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="formulario-moeda">
        <input
          className="formulario-moeda-input"
          type="text"
          required
          name="setNome"
          placeholder="Inserir código/nome da moeda?"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <span className="formulario-moeda-input-border"></span>
        <input
          className="formulario-moeda-input"
          type="text"
          required
          name="setAlta"
          placeholder="Valor Máximo?"
          value={alta}
          onChange={(e) => setAlta(e.target.value)}
        />
        <span className="formulario-moeda-input-border"></span>
        <input
          className="formulario-moeda-input"
          type="text"
          required
          name="setBaixa"
          placeholder="Valor Mínimo?"
          value={baixa}
          onChange={(e) => setBaixa(e.target.value)}
        />
        <span className="formulario-moeda-input-border"></span>
        <input
          type="submit"
          name="Cadastro"
          value="Cadastrar"
          className="bt-padrao"
        />
        <Link className="bt-link" to="/homePage">
          Voltar
        </Link>
      </form>
      <ToastContainer />
    </div>
  );
}

export default FormularioMoeda;
