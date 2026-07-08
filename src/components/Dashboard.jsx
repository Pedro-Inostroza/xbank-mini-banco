import { useSaldo } from "../hooks/useSaldo";
import { Navbar } from "./Navbar";
import { TransferForm } from "./TransferForm";
import { History } from "./History";
import { DepositoRetiro } from "./DepositoRetiro";

/**
 * Pantalla principal tras el login (RF2). El saldo se lee con onSnapshot
 * a través del hook useSaldo: si cambia en Firestore, este componente
 * se re-renderiza solo, sin que nadie tenga que refrescar la página.
 */
export function Dashboard({ usuarioAuth, modoOscuro, onCambiarModo }) {
  const { perfil, cargando, error } = useSaldo(usuarioAuth.uid);

  return (
    <div className="dashboard">
      <Navbar perfil={perfil} modoOscuro={modoOscuro} onCambiarModo={onCambiarModo} />

      <main className="dashboard-contenido">
        <section className="card saldo-card">
          <p className="muted">Saldo disponible</p>
          {cargando && <p className="muted">Cargando saldo...</p>}
          {error && <p className="mensaje-error">{error}</p>}
          {perfil && (
            <h1 className="saldo">${perfil.saldo.toLocaleString("es-CL")}</h1>
          )}
        </section>

        <div className="dashboard-grid">
          <TransferForm emisor={{ uid: usuarioAuth.uid, email: usuarioAuth.email }} />
          <DepositoRetiro uid={usuarioAuth.uid} />
        </div>

        <History uid={usuarioAuth.uid} />
      </main>
    </div>
  );
}
