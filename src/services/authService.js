// Todo lo relacionado a Firebase Authentication vive aquí.
// Los componentes NUNCA llaman a Firebase directo: llaman a estas funciones.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { crearUsuarioEnFirestore } from "./userService";

const SALDO_INICIAL = 100000;

/**
 * Registra un usuario nuevo en Firebase Auth y crea su documento
 * en Firestore (colección "users") con saldo inicial de $100.000.
 */
export async function registrarUsuario(email, password, nombre) {
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  await crearUsuarioEnFirestore(credencial.user.uid, {
    nombre,
    email,
    saldo: SALDO_INICIAL,
  });
  return credencial.user;
}

/** Inicia sesión con email y contraseña. */
export async function iniciarSesion(email, password) {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  return credencial.user;
}

/** Cierra la sesión activa. */
export async function cerrarSesion() {
  await signOut(auth);
}
