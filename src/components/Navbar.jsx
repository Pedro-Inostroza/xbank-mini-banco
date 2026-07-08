import { cerrarSesion } from "../services/authService";

/** Barra superior con el nombre del usuario y el botón de logout (RF5). */
export function Navbar({ perfil, modoOscuro, onCambiarModo }) {
  const handleLogoutClick = async () => {
    // No es necesario cancelar manualmente las suscripciones de saldo/movimientos
    // aquí: viven en useEffect dentro de sus propios componentes, y esos
    // componentes se desmontan solos cuando App.jsx deja de renderizar el
    // Dashboard al detectar el logout. Al desmontarse, React ejecuta el
    // cleanup (unsubscribe) automáticamente.
    await cerrarSesion();
  };

  return (
    <nav className="navbar">
      <div>
        <strong>XBank</strong>
        {perfil && <span className="muted"> · Hola, {perfil.nombre}</span>}
      </div>
      <div className="navbar-acciones">
        <button className="btn-icono" onClick={onCambiarModo} title="Cambiar tema">
          {modoOscuro ? "☀️" : "🌙"}
        </button>
        <button className="btn-secundario" onClick={handleLogoutClick}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
