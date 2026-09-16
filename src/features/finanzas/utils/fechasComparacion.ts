// src/features/finanzas/utils/fechasComparacion.ts
// Admite fecha en formato "2026-09-16", "2026-09-16T10:20:00" o "16/09/2026".

function normalizarISO(fecha: string): string {
  if (fecha.includes("/")) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return fecha.slice(0, 10);
}

export function esMismaFechaIso(fecha: string, iso: string): boolean {
  return normalizarISO(fecha) === iso;
}

export function diaDelMesDeFecha(fecha: string): number {
  return Number(normalizarISO(fecha).split("-")[2]);
}
