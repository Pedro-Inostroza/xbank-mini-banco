import { useState } from "react";
import { registrarUsuario } from "../services/authService";

/** Formulario de registro. Crea la cuenta en Auth + el documento en Firestore. */
export function Register({ onCambiarALogin }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleNombreChange = (e) => setNombre(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const validarFormulario = () => {
    if (!nombre.trim()) return "Ingresa tu nombre.";
    if (!email.trim()) return "Ingresa tu email.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true);
    try {
      await registrarUsuario(email.trim().toLowerCase(), password, nombre.trim());
    } catch (err) {
      setError(traducirErrorAuth(err.code));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>XBank</h1>
      <p className="muted">Crea tu cuenta · saldo inicial $100.000</p>

      <form onSubmit={handleRegisterSubmit} className="auth-form">
        <label htmlFor="reg-nombre">Nombre</label>
        <input
          id="reg-nombre"
          type="text"
          value={nombre}
          onChange={handleNombreChange}
          placeholder="Tu nombre completo"
        />

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
        />

        <label htmlFor="reg-password">Contraseña</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <p className="muted">
        ¿Ya tienes cuenta?{" "}
        <button className="link-btn" onClick={onCambiarALogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}

function traducirErrorAuth(codigo) {
  const mensajes = {
    "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
    "auth/invalid-email": "El email no tiene un formato válido.",
    "auth/weak-password": "La contraseña es muy débil (mínimo 6 caracteres).",
  };
  return mensajes[codigo] || "Ocurrió un error al crear la cuenta.";
}
