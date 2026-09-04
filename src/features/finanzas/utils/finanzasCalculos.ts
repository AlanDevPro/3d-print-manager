//src/features/finanzas/utils/finanzasCalculos.ts
import { CategoriaEgreso, EgresoUI, IngresoUI, MetodoPago } from "../types";

export function calcularTotales(ingresos: IngresoUI[], egresos: EgresoUI[]) {
  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
  const totalEgresos = egresos.reduce((s, e) => s + e.monto, 0);
  return {
    totalIngresos,
    totalEgresos,
    utilidadNeta: totalIngresos - totalEgresos,
  };
}

export function calcularPorMetodo(
  ingresos: IngresoUI[],
): Record<MetodoPago, number> {
  return ingresos.reduce(
    (acc, i) => ({ ...acc, [i.metodo]: (acc[i.metodo] ?? 0) + i.monto }),
    { efectivo: 0, qr: 0, transferencia: 0 } as Record<MetodoPago, number>,
  );
}

export function calcularPorCategoria(
  egresos: EgresoUI[],
): Record<CategoriaEgreso, number> {
  const base: Record<CategoriaEgreso, number> = {
    material: 0,
    energia: 0,
    repuestos_reimpresion: 0,
    mantenimiento: 0,
    otro: 0,
  };
  egresos.forEach((e) => (base[e.categoria] += e.monto));
  return base;
}

export function calcularVariacionPorcentual(
  actual: number,
  anterior: number,
): number {
  if (anterior <= 0) return 0;
  return ((actual - anterior) / anterior) * 100;
}

export function calcularProgresoMeta(
  totalIngresos: number,
  meta: number,
): number {
  if (meta <= 0) return 0;
  return Math.min(100, Math.round((totalIngresos / meta) * 100));
}

export function calcularPuntoEquilibrio(
  totalIngresos: number,
  totalEgresos: number,
) {
  return {
    falta: Math.max(0, totalEgresos - totalIngresos),
    alcanzado: totalIngresos >= totalEgresos,
  };
}

export function calcularTicketPromedio(
  totalIngresos: number,
  cantidad: number,
): number {
  return cantidad > 0 ? totalIngresos / cantidad : 0;
}

export function calcularMargenMedio(
  utilidadNeta: number,
  totalIngresos: number,
): number {
  return totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
}
