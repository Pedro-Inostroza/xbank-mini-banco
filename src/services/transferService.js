// Lógica de transferencias entre usuarios.
// Usamos runTransaction para que descontar-al-emisor + abonar-al-receptor +
// registrar-el-movimiento ocurra de forma atómica (todo o nada), evitando
// condiciones de carrera si dos transferencias llegan al mismo tiempo.
import {
  doc,
  runTransaction,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { buscarUsuarioPorEmail } from "./userService";

/**
 * Transfiere dinero del usuario emisor a un destinatario identificado
 * por email. Lanza un Error con un mensaje legible si alguna validación
 * falla, para que la UI lo muestre directo al usuario.
 */
export async function transferirDinero({ emisor, emailDestinatario, monto, descripcion }) {
  if (monto <= 0) {
    throw new Error("El monto debe ser mayor a 0.");
  }
  if (emailDestinatario.trim().toLowerCase() === emisor.email.toLowerCase()) {
    throw new Error("No puedes transferirte dinero a ti mismo.");
  }

  const destinatario = await buscarUsuarioPorEmail(emailDestinatario.trim().toLowerCase());
  if (!destinatario) {
    throw new Error("No existe ningún usuario con ese email.");
  }

  const refEmisor = doc(db, "users", emisor.uid);
  const refReceptor = doc(db, "users", destinatario.uid);
  const refMovimiento = doc(collection(db, "movimientos"));

  await runTransaction(db, async (transaccion) => {
    const snapEmisor = await transaccion.get(refEmisor);
    const snapReceptor = await transaccion.get(refReceptor);

    if (!snapEmisor.exists() || !snapReceptor.exists()) {
      throw new Error("Alguno de los usuarios ya no existe.");
    }

    const saldoEmisor = snapEmisor.data().saldo;
    if (saldoEmisor < monto) {
      throw new Error("Saldo insuficiente para esta transferencia.");
    }

    transaccion.update(refEmisor, { saldo: saldoEmisor - monto });
    transaccion.update(refReceptor, {
      saldo: snapReceptor.data().saldo + monto,
    });

    transaccion.set(refMovimiento, {
      emisorUid: emisor.uid,
      emisorEmail: emisor.email,
      receptorUid: destinatario.uid,
      receptorEmail: destinatario.email,
      monto,
      descripcion: descripcion?.trim() || "Transferencia",
      fecha: serverTimestamp(),
      // "participantes" permite consultar el historial de un usuario con
      // una sola query (array-contains), en vez de dos listeners separados.
      participantes: [emisor.uid, destinatario.uid],
    });
  });
}
