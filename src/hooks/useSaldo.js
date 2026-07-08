// Hook que expone el documento del usuario (incluye "saldo") en tiempo real.
import { useEffect, useState } from "react";
import { suscribirseAUsuario } from "../services/userService";

export function useSaldo(uid) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    setCargando(true);
    const unsubscribe = suscribirseAUsuario(
      uid,
      (datos) => {
        setPerfil(datos);
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    // Cleanup: se cancela la suscripción al desmontar el componente
    // o si cambia el uid (por ejemplo, tras un logout).
    return () => unsubscribe();
  }, [uid]);

  return { perfil, cargando, error };
}
