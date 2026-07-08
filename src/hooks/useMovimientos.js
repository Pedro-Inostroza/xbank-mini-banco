// Hook que expone el historial de movimientos del usuario en tiempo real.
import { useEffect, useState } from "react";
import { suscribirseAMovimientos } from "../services/movementsService";

export function useMovimientos(uid) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    setCargando(true);
    const unsubscribe = suscribirseAMovimientos(
      uid,
      (datos) => {
        setMovimientos(datos);
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { movimientos, cargando, error };
}
