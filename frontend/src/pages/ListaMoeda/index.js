import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { Link } from "react-router-dom";
import "./styles.css";

function ListaMoeda() {
  const [moedas, setMoedas] = useState([]);
  const [busca, setBusca] = useState("");
  const [moedasEditadas, setMoedasEditadas] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        axios.defaults.headers.authorization = `Bearer ${token}`;
        const response = await axios.get("/moedas", {
          withCredentials: true,
        });
        console.log(response);
        setMoedas(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const buscarMoedas = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`/moedas?nome=${busca}`);
      setMoedas(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuscaChange = (event) => {
    setBusca(event.target.value);
  };

  const handleExcluirMoeda = async (id) => {
    try {
      await axios.delete(`/moedas/${id}`);
      const updatedMoedas = moedas.filter((moeda) => moeda._id !== id);
      setMoedas(updatedMoedas);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditarMoeda = (moeda) => {
    setMoedasEditadas((prevMoedasEditadas) => ({
      ...prevMoedasEditadas,
      [moeda._id]: { ...moeda },
    }));
  };

  const handleSalvarEdicao = async (moedaId) => {
    try {
      await axios.put(`/moedas/${moedaId}`, moedasEditadas[moedaId]);
      setMoedasEditadas((prevMoedasEditadas) => {
        const updatedMoedasEditadas = { ...prevMoedasEditadas };
        delete updatedMoedasEditadas[moedaId];
        return updatedMoedasEditadas;
      });
      window.location.reload(); // Recarrega a página
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event, moedaId) => {
    const { name, value } = event.target;
    setMoedasEditadas((prevMoedasEditadas) => ({
      ...prevMoedasEditadas,
      [moedaId]: {
        ...prevMoedasEditadas[moedaId],
        [name]: value,
      },
    }));
  };

  return (
    <div className="lista-moeda">
      <h1>Lista de moedas:</h1>
      <form onSubmit={buscarMoedas}>
        <input type="text" value={busca} onChange={handleBuscaChange} />
        <button type="submit">Buscar</button>
      </form>
      <ul>
        <table border="2">
          <thead>
            <tr>
              <th width="200">Moeda:</th>
              <th width="200">Valor Máximo</th>
              <th width="200">Valor Mínimo</th>
              <th width="100">Ações</th>
            </tr>
          </thead>
          <tbody>
            {moedas.map((moeda) =>
              busca !== "" &&
              moeda.nome.toLowerCase().indexOf(busca.toLowerCase()) ===
                -1 ? null : (
                <tr key={moeda._id}>
                  <td width="200">
                    {moedasEditadas[moeda._id] ? (
                      <input
                        type="text"
                        name="nome"
                        value={moedasEditadas[moeda._id].nome}
                        onChange={(e) => handleInputChange(e, moeda._id)}
                      />
                    ) : (
                      moeda.nome
                    )}
                  </td>
                  <td width="200">
                    {moedasEditadas[moeda._id] ? (
                      <input
                        type="number"
                        name="alta"
                        value={moedasEditadas[moeda._id].alta}
                        onChange={(e) => handleInputChange(e, moeda._id)}
                      />
                    ) : (
                      moeda.alta
                    )}
                  </td>
                  <td width="200">
                    {moedasEditadas[moeda._id] ? (
                      <input
                        type="number"
                        name="baixa"
                        value={moedasEditadas[moeda._id].baixa}
                        onChange={(e) => handleInputChange(e, moeda._id)}
                      />
                    ) : (
                      moeda.baixa
                    )}
                  </td>
                  <td width="100">
                    {moedasEditadas[moeda._id] ? (
                      <>
                        <button
                          onClick={() => handleSalvarEdicao(moeda._id)}
                          className="bt-salvar"
                        >
                          Salvar
                        </button>
                        <button
                          className="bt-cancelar"
                          onClick={() => (window.location.href = "/listaMoeda")}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditarMoeda(moeda)}
                          className="bt-editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluirMoeda(moeda._id)}
                          className="bt-excluir"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </ul>
      <Link className="bt-voltar" to="/homePage">
        Voltar
      </Link>
    </div>
  );
}

export default ListaMoeda;
