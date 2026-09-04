/**
 * Formatea un monto numérico a formato de moneda en Bolivianos (Bs).
 * Maneja valores `undefined`, `null`, `NaN` o cadenas de texto no válidas de forma segura.
 */
export function formatBs(monto?: number | null): string {
  if (monto === undefined || monto === null || Number.isNaN(Number(monto))) {
    return "Bs 0.00";
  }

  return `Bs ${Number(monto).toFixed(2)}`;
}

export function formatFechaRelativa(iso: string): string {
  if (!iso) return "Sin fecha";

  const fecha = new Date(iso);
  const ahora = new Date();

  if (Number.isNaN(fecha.getTime())) return "Fecha inválida";

  const diffMs = ahora.getTime() - fecha.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias <= 0) return "Hoy";
  if (diffDias === 1) return "Ayer";
  return `Hace ${diffDias} días`;
}
