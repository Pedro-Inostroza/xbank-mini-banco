import { useMemo, useState } from "react";
import { useMovimientos } from "../hooks/useMovimientos";

/** Historial de movimientos en tiempo real (RF4), con filtro por tipo (bonus). */
export function History({ uid }) {
  const { movimientos, cargando, error } = useMovimientos(uid);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const handleFiltroChange = (e) => setFiltroTipo(e.target.value);

  const movimientosFiltrados = useMemo(() => {
    return movimientos
      .map((mov) => ({
        ...mov,
        tipo: mov.emisorUid === uid ? "envio" : "recepcion",
      }))
      .filter((mov) => filtroTipo === "todos" || mov.tipo === filtroTipo);
  }, [movimientos, filtroTipo, uid]);

  return (
    <div className="card">
      <div className="history-header">
        <h2>Historial de movimientos</h2>
        <select value={filtroTipo} onChange={handleFiltroChange}>
          <option value="todos">Todos</option>
          <option value="envio">Enviados</option>
          <option value="recepcion">Recibidos</option>
        </select>
      </div>

      {cargando && <p className="muted">Cargando movimientos...</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && !error && movimientosFiltrados.length === 0 && (
        <p className="muted">Todavía no hay movimientos que mostrar.</p>
      )}

      <ul className="lista-movimientos">
        {movimientosFiltrados.map((mov) => (
          <li key={mov.id} className={`movimiento movimiento-${mov.tipo}`}>
            <div>
              <strong>
                {mov.tipo === "envio"
                  ? `Enviado a ${mov.receptorEmail}`
                  : `Recibido de ${mov.emisorEmail}`}
              </strong>
              <p className="muted">{mov.descripcion}</p>
              <p className="muted fecha">{formatearFecha(mov.fecha)}</p>
            </div>
            <span className={mov.tipo === "envio" ? "monto-negativo" : "monto-positivo"}>
              {mov.tipo === "envio" ? "-" : "+"}${mov.monto.toLocaleString("es-CL")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Formatea el Timestamp de Firestore a una fecha legible. */
function formatearFecha(timestamp) {
  if (!timestamp?.toDate) return "Procesando...";
  return timestamp.toDate().toLocaleString("es-CL");
}
