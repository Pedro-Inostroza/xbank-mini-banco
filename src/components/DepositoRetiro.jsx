import { useState } from "react";
import { depositarORetirar } from "../services/movementsService";

/** Bonus: depósito y retiro simulado sobre el propio saldo. */
export function DepositoRetiro({ uid }) {
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleAmountChange = (e) => setMonto(e.target.value);

  const ejecutar = async (tipo) => {
    setError("");
    const montoNumerico = Number(monto);
    if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    setEnviando(true);
    try {
      await depositarORetirar({ uid, monto: montoNumerico, tipo });
      setMonto("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDepositoClick = () => ejecutar("deposito");
  const handleRetiroClick = () => ejecutar("retiro");

  return (
    <div className="card">
      <h2>Depósito / Retiro simulado</h2>
      <input
        type="number"
        min="1"
        value={monto}
        onChange={handleAmountChange}
        placeholder="Monto"
        disabled={enviando}
      />
      <div className="botonera">
        <button onClick={handleDepositoClick} disabled={enviando}>
          Depositar
        </button>
        <button className="btn-secundario" onClick={handleRetiroClick} disabled={enviando}>
          Retirar
        </button>
      </div>
      {error && <p className="mensaje-error">{error}</p>}
    </div>
  );
}
