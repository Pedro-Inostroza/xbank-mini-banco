import { useState } from "react";
import { transferirDinero } from "../services/transferService";

/**
 * Formulario de transferencias (RF3).
 * - Controlado, con preventDefault.
 * - Valida ANTES de tocar Firestore.
 * - Deshabilita el botón mientras la operación está en curso (anti doble-submit).
 */
export function TransferForm({ emisor }) {
  const [emailDestinatario, setEmailDestinatario] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleEmailChange = (e) => setEmailDestinatario(e.target.value);
  const handleAmountChange = (e) => setMonto(e.target.value);
  const handleDescripcionChange = (e) => setDescripcion(e.target.value);

  /** Validación local, antes de tocar Firestore. */
  const validar = () => {
    if (!emailDestinatario.trim()) return "Ingresa el email del destinatario.";
    const montoNumerico = Number(monto);
    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
      return "El monto debe ser un número mayor a 0.";
    }
    return null;
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true); // deshabilita el botón mientras corre la transacción
    try {
      await transferirDinero({
        emisor,
        emailDestinatario,
        monto: Number(monto),
        descripcion,
      });
      setExito(`Transferencia de $${Number(monto).toLocaleString("es-CL")} enviada.`);
      setEmailDestinatario("");
      setMonto("");
      setDescripcion("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h2>Transferir dinero</h2>
      <form onSubmit={handleTransferSubmit} className="transfer-form">
        <label htmlFor="destinatario">Email del destinatario</label>
        <input
          id="destinatario"
          type="email"
          value={emailDestinatario}
          onChange={handleEmailChange}
          placeholder="amigo@ejemplo.com"
          disabled={enviando}
        />

        <label htmlFor="monto">Monto</label>
        <input
          id="monto"
          type="number"
          min="1"
          value={monto}
          onChange={handleAmountChange}
          placeholder="10000"
          disabled={enviando}
        />

        <label htmlFor="descripcion">Descripción (opcional)</label>
        <input
          id="descripcion"
          type="text"
          value={descripcion}
          onChange={handleDescripcionChange}
          placeholder="Ej: arriendo, almuerzo..."
          disabled={enviando}
        />

        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Procesando..." : "Transferir"}
        </button>
      </form>
    </div>
  );
}
