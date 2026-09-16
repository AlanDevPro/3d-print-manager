// src/features/finanzas/utils/fechasMes.ts

export interface MesInfo {
  anio: number;
  mes: number; // 0-11
  key: string; // "2026-09"
  inicialMes: string; // "SEP"
  etiquetaCompleta: string; // "Septiembre 2026"
  esMesActual: boolean;
}

const INICIALES_MES = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const NOMBRES_MES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function claveMes(anio: number, mes: number): string {
  return `${anio}-${String(mes + 1).padStart(2, "0")}`;
}

/**
 * Devuelve `cantidad` meses terminando `retroceso` meses atrás del mes actual.
 * retroceso=0 -> el mes actual queda como el último (el de más a la derecha).
 * retroceso=6 -> "página" completa de los 6 meses anteriores a esos.
 */
export function obtenerMeses(cantidad = 6, retroceso = 0): MesInfo[] {
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth();

  return Array.from({ length: cantidad }, (_, i) => {
    // i=0 es el más antiguo de la página, i=cantidad-1 es el más reciente
    const offset = retroceso + (cantidad - 1 - i);
    const fecha = new Date(anioActual, mesActual - offset, 1);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    return {
      anio,
      mes,
      key: claveMes(anio, mes),
      inicialMes: INICIALES_MES[mes],
      etiquetaCompleta: `${NOMBRES_MES[mes]} ${anio}`,
      esMesActual: anio === anioActual && mes === mesActual,
    };
  });
}

export function obtenerMesPorDefecto(meses: MesInfo[]): string {
  const actual = meses.find((m) => m.esMesActual);
  return actual ? actual.key : meses[meses.length - 1].key;
}

/** Cantidad de días del mes (para pintar la grilla del modal). */
export function diasDelMes(anio: number, mes: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

/** Día de la semana (0=domingo) del día 1 de ese mes, para alinear la grilla. */
export function primerDiaSemanaDelMes(anio: number, mes: number): number {
  return new Date(anio, mes, 1).getDay();
}
