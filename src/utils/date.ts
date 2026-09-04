// src/utils/date.ts

/**
 * Convierte un objeto Date o string de fecha a formato ISO (YYYY-MM-DD)
 * para compatibilidad estricta con PostgreSQL/Supabase DATE.
 *
 * Se centraliza aquí porque tanto FormularioFilamento como
 * FormularioImpresora (y cualquier otro formulario que persista
 * columnas DATE) necesitan la misma normalización.
 */
export function formatToDbDate(date: Date | string = new Date()): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split("T")[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
