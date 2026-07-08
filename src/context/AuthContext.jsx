// Contexto global de sesión: quién está logueado, si está cargando,
// y si hubo un error. Usa useReducer (en vez de varios useState sueltos)
// porque estos tres campos cambian juntos y con reglas claras.
import { createContext, useContext, useEffect, useReducer } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext(null);

const estadoInicial = {
  usuario: null, // { uid, email } que entrega Firebase Auth
  cargando: true, // true mientras Firebase determina si hay sesión activa
  error: null,
};

function authReducer(estado, accion) {
  switch (accion.type) {
    case "SESION_DETECTADA":
      return { usuario: accion.payload, cargando: false, error: null };
    case "ERROR_AUTH":
      return { ...estado, cargando: false, error: accion.payload };
    default:
      return estado;
  }
}

export function AuthProvider({ children }) {
  const [estado, dispatch] = useReducer(authReducer, estadoInicial);

  useEffect(() => {
    // onAuthStateChanged es en sí mismo una suscripción en tiempo real:
    // se dispara al cargar la página y cada vez que cambia el login/logout.
    const unsubscribe = onAuthStateChanged(
      auth,
      (usuarioFirebase) => {
        dispatch({
          type: "SESION_DETECTADA",
          payload: usuarioFirebase
            ? { uid: usuarioFirebase.uid, email: usuarioFirebase.email }
            : null,
        });
      },
      (error) => dispatch({ type: "ERROR_AUTH", payload: error.message })
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={estado}>{children}</AuthContext.Provider>
  );
}

/** Hook de conveniencia para leer el contexto de sesión. */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return contexto;
}
