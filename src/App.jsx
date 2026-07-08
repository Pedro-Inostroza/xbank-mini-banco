import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import "./App.css";

/**
 * Componente interno: decide qué pantalla mostrar según el estado de sesión.
 * Está separado de <App> porque necesita leer useAuth(), y useAuth()
 * solo funciona DENTRO de <AuthProvider>.
 */
function Contenido() {
  const { usuario, cargando } = useAuth();
  const [vista, setVista] = useState("login"); // "login" | "registro"
  const [modoOscuro, setModoOscuro] = useState(
    () => localStorage.getItem("xbank-tema") === "oscuro"
  );

  useEffect(() => {
    document.body.classList.toggle("tema-oscuro", modoOscuro);
    localStorage.setItem("xbank-tema", modoOscuro ? "oscuro" : "claro");
  }, [modoOscuro]);

  const handleCambiarModo = () => setModoOscuro((actual) => !actual);
  const handleCambiarARegistro = () => setVista("registro");
  const handleCambiarALogin = () => setVista("login");

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <p>Cargando XBank...</p>
      </div>
    );
  }

  // Un usuario no autenticado no puede ver nada más que login/registro (RF1).
  if (!usuario) {
    return vista === "login" ? (
      <Login onCambiarARegistro={handleCambiarARegistro} />
    ) : (
      <Register onCambiarALogin={handleCambiarALogin} />
    );
  }

  return (
    <Dashboard
      usuarioAuth={usuario}
      modoOscuro={modoOscuro}
      onCambiarModo={handleCambiarModo}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <Contenido />
    </AuthProvider>
  );
}

export default App;
