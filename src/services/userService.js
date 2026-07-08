// Operaciones sobre la colección "users" de Firestore.
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

/** Crea el documento de un usuario nuevo en users/{uid}. */
export async function crearUsuarioEnFirestore(uid, datos) {
  await setDoc(doc(db, "users", uid), datos);
}

/**
 * Se suscribe en tiempo real al documento del usuario (para leer su saldo).
 * Devuelve la función "unsubscribe" para cancelar la suscripción en el
 * cleanup de useEffect.
 */
export function suscribirseAUsuario(uid, callback, onError) {
  const refUsuario = doc(db, "users", uid);
  const unsubscribe = onSnapshot(
    refUsuario,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ uid: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
  return unsubscribe;
}

/**
 * Busca un usuario por email (para validar el destinatario de una
 * transferencia). Retorna null si no existe.
 */
export async function buscarUsuarioPorEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docEncontrado = snapshot.docs[0];
  return { uid: docEncontrado.id, ...docEncontrado.data() };
}
