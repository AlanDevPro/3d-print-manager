// src/features/finanzas/utils/finanzasFormato.ts
//
// Formateadores manuales: Hermes no siempre incluye Intl completo en Android,
// así que evitamos toLocaleString para no romper en release builds.

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function separarMiles(valor: number, decimales = 0): string {
  const negativo = valor < 0;
  const fijo = Math.abs(valor).toFixed(decimales);
  const [entero, decimal] = fijo.split(".");
  const conSeparador = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const texto = decimal ? `${conSeparador},${decimal}` : conSeparador;
  return negativo ? `-${texto}` : texto;
}

export function formatearMoneda(valor: number, moneda = "Bs", decimales = 0) {
  return `${moneda} ${separarMiles(valor, decimales)}`;
}

/** Compacta valores grandes para los ejes: 8420 -> "8,4k" */
export function formatearCompacto(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
  if (Math.abs(valor) >= 1000) {
    const k = valor / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${Math.round(valor)}`;
}

export function formatearPorcentaje(valor: number, decimales = 1) {
  return `${valor.toFixed(decimales)}%`;
}

/** "2026-09-15" -> "15/09/2026" */
export function formatearFecha(fechaISO?: string | null): string {
  if (!fechaISO) return "";
  const [y, m, d] = fechaISO.slice(0, 10).split("-");
  if (!y || !m || !d) return fechaISO;
  return `${d}/${m}/${y}`;
}

/** "2026-09-15" -> "2026-09" */
export function claveMes(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

/** "2026-09" -> "Sep" */
export function etiquetaMes(clave: string): string {
  const mes = Number(clave.slice(5, 7));
  return MESES_CORTOS[mes - 1] ?? clave;
}

/** Devuelve las últimas `n` claves de mes terminando en el mes actual. */
export function ultimasClavesMes(n: number, referencia = new Date()): string[] {
  const claves: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(referencia.getFullYear(), referencia.getMonth() - i, 1);
    claves.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return claves;
}

/** Fecha local en formato YYYY-MM-DD (evita el corrimiento de toISOString). */
export function aISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
