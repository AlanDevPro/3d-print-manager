//src/features/cotizacion/utils/formatDuracion.ts
interface FormatDuracionOpciones {
  incluirDias?: boolean;
}

/** Convierte minutos totales a formato "4h 15m" o "0d 0h 30m" */
export function formatDuracion(
  totalMinutos: number | undefined,
  { incluirDias = false }: FormatDuracionOpciones = {},
): string {
  if (totalMinutos === undefined || isNaN(totalMinutos)) return "—";

  const minutosRedondeados = Math.round(totalMinutos);
  const dias = Math.floor(minutosRedondeados / (24 * 60));
  const horas = Math.floor((minutosRedondeados % (24 * 60)) / 60);
  const minutos = minutosRedondeados % 60;

  if (incluirDias) {
    return `${dias}d ${horas}h ${minutos}m`;
  }
  return `${horas}h ${minutos}m`;
}
