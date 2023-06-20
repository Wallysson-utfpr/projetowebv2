import React from "react";
import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Moeda from "./pages/Moeda";
import ListaMoeda from "./pages/ListaMoeda";
import { getToken } from "./services/auth";
import HomePage from "./pages/HomePage";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? <Navigate to="/homePage" /> : children;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {<Route path="/cadastro" element={<Cadastro />} />}
      <Route
        path="/homePage"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastroMoeda"
        element={
          <PrivateRoute>
            <Moeda />
          </PrivateRoute>
        }
      />
      <Route
        path="/listaMoeda"
        element={
          <PrivateRoute>
            <ListaMoeda />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default PrivateRoute;
