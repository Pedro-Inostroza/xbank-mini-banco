// Lectura en tiempo real del historial de movimientos.
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, } from "../firebase/config";
import { doc, runTransaction } from "firebase/firestore";

/**
 * Se suscribe a los movimientos donde el usuario participó (como emisor
 * o receptor), ordenados del más reciente al más antiguo.
 * Devuelve "unsubscribe" para el cleanup del useEffect.
 */
export function suscribirseAMovimientos(uid, callback, onError) {
  const q = query(
    collection(db, "movimientos"),
    where("participantes", "array-contains", uid),
    orderBy("fecha", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const movimientos = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(movimientos);
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Bonus: depósito o retiro simulado sobre el propio saldo.
 * "tipo" es "deposito" o "retiro".
 */
export async function depositarORetirar({ uid, monto, tipo }) {
  if (monto <= 0) {
    throw new Error("El monto debe ser mayor a 0.");
  }
  const refUsuario = doc(db, "users", uid);

  await runTransaction(db, async (transaccion) => {
    const snap = await transaccion.get(refUsuario);
    if (!snap.exists()) throw new Error("Usuario no encontrado.");

    const saldoActual = snap.data().saldo;
    if (tipo === "retiro" && saldoActual < monto) {
      throw new Error("Saldo insuficiente para retirar ese monto.");
    }

    const nuevoSaldo = tipo === "deposito" ? saldoActual + monto : saldoActual - monto;
    transaccion.update(refUsuario, { saldo: nuevoSaldo });
  });
}
