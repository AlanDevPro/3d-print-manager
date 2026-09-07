// src/features/cotizacion/utils/formatters.ts
export function formatMoneda(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0,00";
  return value.toFixed(2).replace(".", ",");
}

export function formatTiempo(horas?: number, minutos?: number): string {
  const h = Math.floor(horas || 0);
  const m = Math.round(minutos || 0);
  if (h <= 0 && m <= 0) return "0min";
  if (h <= 0) return `${m}min`;
  if (m <= 0) return `${h}hrs`;
  return `${h}hrs ${m}min`;
}