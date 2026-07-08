import { useState } from "react";
import { iniciarSesion } from "../services/authService";

/**
 * Formulario de inicio de sesión.
 * Controlado: email y password viven en el estado, no en el DOM.
 */
export function Login({ onCambiarARegistro }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completa email y contraseña.");
      return;
    }

    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
      // No hace falta hacer nada más: AuthContext detecta el login solo
      // gracias a onAuthStateChanged.
    } catch (err) {
      setError(traducirErrorAuth(err.code));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>XBank</h1>
      <p className="muted">Inicia sesión en tu cuenta</p>

      <form onSubmit={handleLoginSubmit} className="auth-form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="muted">
        ¿No tienes cuenta?{" "}
        <button className="link-btn" onClick={onCambiarARegistro}>
          Regístrate
        </button>
      </p>
    </div>
  );
}

/** Traduce los códigos de error de Firebase Auth a mensajes legibles. */
function traducirErrorAuth(codigo) {
  const mensajes = {
    "auth/invalid-email": "El email no tiene un formato válido.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return mensajes[codigo] || "Ocurrió un error al iniciar sesión.";
}
