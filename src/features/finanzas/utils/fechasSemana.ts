// src/features/finanzas/utils/fechasSemana.ts

export interface DiaSemanaInfo {
  fecha: Date;
  iso: string; // "2026-09-16"
  inicialDia: string; // "LUN"
  numeroDia: string; // "16"
  esHoy: boolean;
}

const INICIALES_DIA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

function normalizarFecha(fecha: Date): Date {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return f;
}

function aIso(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Devuelve los 7 días (lunes a domingo) de la semana que contiene `fechaReferencia`. */
export function obtenerDiasSemana(
  fechaReferencia: Date = new Date(),
): DiaSemanaInfo[] {
  const hoy = normalizarFecha(new Date());
  const ref = normalizarFecha(fechaReferencia);

  // getDay(): 0=domingo..6=sábado -> se convierte a offset desde el lunes
  const diaSemana = ref.getDay();
  const offsetDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const lunes = new Date(ref);
  lunes.setDate(ref.getDate() - offsetDesdeLunes);

  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + i);
    const iso = aIso(fecha);
    return {
      fecha,
      iso,
      inicialDia: INICIALES_DIA[i],
      numeroDia: String(fecha.getDate()).padStart(2, "0"),
      esHoy: iso === aIso(hoy),
    };
  });
}

/** Iso (yyyy-mm-dd) del día de hoy si cae dentro de la semana recibida; si no, el lunes. */
export function obtenerDiaPorDefecto(dias: DiaSemanaInfo[]): string {
  const hoy = dias.find((d) => d.esHoy);
  return hoy ? hoy.iso : dias[0].iso;
}
