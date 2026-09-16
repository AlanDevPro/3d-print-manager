// src/features/finanzas/utils/finanzasCalculos.ts
//
// Funciones puras: no tocan Supabase ni React. Fáciles de testear.

import {
  CATEGORIAS_EGRESO,
  COLOR_CATEGORIA_EGRESO,
  LABEL_CATEGORIA_EGRESO,
  METODOS_PAGO,
} from "../constantes";
import {
  CategoriaEgreso,
  CategoriaEgresoUI,
  EgresoUI,
  IngresoUI,
  IntentoImpresionUI,
  KpiUI,
  MesFinancieroUI,
  MetodoPago,
  ParetoUI,
  ProduccionResumenUI,
  ProductoRentabilidadUI,
} from "../types";
import {
  claveMes,
  etiquetaMes,
  formatearCompacto,
  formatearMoneda,
  ultimasClavesMes,
} from "./finanzasFormato";

// ---------------------------------------------------------------------------
// Básicos
// ---------------------------------------------------------------------------
const suma = (arr: { monto: number }[]) =>
  arr.reduce((acc, m) => acc + (Number(m.monto) || 0), 0);

export function calcularTotales(ingresos: IngresoUI[], egresos: EgresoUI[]) {
  const totalIngresos = suma(ingresos);
  const totalEgresos = suma(egresos);
  return {
    totalIngresos,
    totalEgresos,
    utilidadNeta: totalIngresos - totalEgresos,
  };
}

export function calcularPorMetodo(
  movimientos: { metodo: MetodoPago; monto: number }[],
): Record<MetodoPago, number> {
  const base = METODOS_PAGO.reduce(
    (acc, m) => ({ ...acc, [m]: 0 }),
    {} as Record<MetodoPago, number>,
  );
  for (const mov of movimientos) {
    if (base[mov.metodo] === undefined) continue;
    base[mov.metodo] += Number(mov.monto) || 0;
  }
  return base;
}

export function calcularPorCategoria(
  egresos: EgresoUI[],
): Record<CategoriaEgreso, number> {
  const base = CATEGORIAS_EGRESO.reduce(
    (acc, c) => ({ ...acc, [c]: 0 }),
    {} as Record<CategoriaEgreso, number>,
  );
  for (const e of egresos) {
    const cat = base[e.categoria] !== undefined ? e.categoria : "otro";
    base[cat] += Number(e.monto) || 0;
  }
  return base;
}

export function calcularTicketPromedio(total: number, cantidad: number) {
  return cantidad > 0 ? total / cantidad : 0;
}

export function calcularMargenPct(utilidad: number, ingresos: number) {
  return ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
}

export function calcularProgresoMeta(totalIngresos: number, meta: number) {
  if (meta <= 0) return 0;
  return Math.min((totalIngresos / meta) * 100, 100);
}

export function calcularPuntoEquilibrio(
  totalIngresos: number,
  totalEgresos: number,
) {
  const falta = Math.max(totalEgresos - totalIngresos, 0);
  return { falta, alcanzado: totalIngresos >= totalEgresos };
}

export function variacionPct(actual: number, anterior: number) {
  if (!anterior) return actual > 0 ? 100 : 0;
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}

// ---------------------------------------------------------------------------
// Producción (pedido_impresion_intentos)
// ---------------------------------------------------------------------------
export function calcularProduccion(
  intentos: IntentoImpresionUI[],
): ProduccionResumenUI {
  const gramos = intentos.reduce((acc, i) => acc + i.gramos, 0);
  const horas = intentos.reduce((acc, i) => acc + i.horas, 0);
  const fallidos = intentos.filter((i) => i.fallido).length;
  return {
    gramos,
    horas,
    intentos: intentos.length,
    intentosFallidos: fallidos,
    tasaFalloPct: intentos.length ? (fallidos / intentos.length) * 100 : 0,
  };
}

export function calcularCostoPorGramo(totalEgresos: number, gramos: number) {
  return gramos > 0 ? totalEgresos / gramos : 0;
}

export function calcularCostoPorHora(totalEgresos: number, horas: number) {
  return horas > 0 ? totalEgresos / horas : 0;
}

// ---------------------------------------------------------------------------
// Serie mensual
// ---------------------------------------------------------------------------
export function construirSerieMensual(
  meses: number,
  ingresos: IngresoUI[],
  egresos: EgresoUI[],
  intentos: IntentoImpresionUI[],
): MesFinancieroUI[] {
  const claves = ultimasClavesMes(meses);

  return claves.map((clave) => {
    const ing = ingresos.filter((i) => claveMes(i.fechaISO) === clave);
    const egr = egresos.filter((e) => claveMes(e.fechaISO) === clave);
    const imp = intentos.filter((i) => claveMes(i.fechaISO) === clave);

    const totalIngresos = suma(ing);
    const totalEgresos = suma(egr);
    const utilidad = totalIngresos - totalEgresos;
    const gramos = imp.reduce((acc, i) => acc + i.gramos, 0);
    const horas = imp.reduce((acc, i) => acc + i.horas, 0);

    return {
      clave,
      etiqueta: etiquetaMes(clave),
      ingresos: totalIngresos,
      egresos: totalEgresos,
      utilidad,
      margenPct: calcularMargenPct(utilidad, totalIngresos),
      cantidadIngresos: ing.length,
      ticketPromedio: calcularTicketPromedio(totalIngresos, ing.length),
      gramos,
      horas,
      costoPorHora: calcularCostoPorHora(totalEgresos, horas),
    };
  });
}

/** Variación % de ingresos del último mes respecto del anterior. */
export function variacionMensualIngresos(serie: MesFinancieroUI[]) {
  if (serie.length < 2) return 0;
  return variacionPct(
    serie[serie.length - 1].ingresos,
    serie[serie.length - 2].ingresos,
  );
}

// ---------------------------------------------------------------------------
// KPIs derivados de la serie mensual
// ---------------------------------------------------------------------------
export function construirKpis(
  serie: MesFinancieroUI[],
  moneda: string,
): KpiUI[] {
  if (serie.length === 0) return [];

  const actual = serie[serie.length - 1];
  const previo = serie.length > 1 ? serie[serie.length - 2] : undefined;

  const delta = (getter: (m: MesFinancieroUI) => number) =>
    previo ? variacionPct(getter(actual), getter(previo)) : 0;

  return [
    {
      id: "utilidad_neta",
      label: "Utilidad Neta",
      valor: formatearMoneda(actual.utilidad, moneda),
      deltaPct: delta((m) => m.utilidad),
      invertido: false,
      serie: serie.map((m) => m.utilidad),
    },
    {
      id: "margen_operativo",
      label: "Margen Operativo",
      valor: `${actual.margenPct.toFixed(1)}%`,
      deltaPct: previo ? actual.margenPct - previo.margenPct : 0,
      invertido: false,
      serie: serie.map((m) => m.margenPct),
    },
    {
      id: "costo_hora",
      label: "Costo / Hora de Impresión",
      valor:
        actual.horas > 0
          ? formatearMoneda(actual.costoPorHora, moneda, 2)
          : "—",
      deltaPct: delta((m) => m.costoPorHora),
      invertido: true, // bajar es bueno
      serie: serie.map((m) => m.costoPorHora),
    },
    {
      id: "ticket_promedio",
      label: "Valor Promedio de Venta",
      valor: formatearMoneda(actual.ticketPromedio, moneda),
      deltaPct: delta((m) => m.ticketPromedio),
      invertido: false,
      serie: serie.map((m) => m.ticketPromedio),
    },
  ];
}

// ---------------------------------------------------------------------------
// Egresos por categoría (donut + desglose por concepto)
// ---------------------------------------------------------------------------
export function agruparEgresosPorCategoria(
  egresos: EgresoUI[],
): CategoriaEgresoUI[] {
  const total = suma(egresos);
  if (total <= 0) return [];

  return CATEGORIAS_EGRESO.map((id) => {
    const delGrupo = egresos.filter((e) =>
      CATEGORIAS_EGRESO.includes(e.categoria)
        ? e.categoria === id
        : id === "otro",
    );
    const monto = suma(delGrupo);

    const porConcepto = new Map<string, number>();
    for (const e of delGrupo) {
      const clave = e.concepto?.trim() || "Sin concepto";
      porConcepto.set(clave, (porConcepto.get(clave) ?? 0) + e.monto);
    }

    const desglose = [...porConcepto.entries()]
      .map(([label, m]) => ({
        label,
        monto: m,
        pct: monto ? (m / monto) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 6);

    return {
      id,
      label: LABEL_CATEGORIA_EGRESO[id],
      color: COLOR_CATEGORIA_EGRESO[id],
      monto,
      pct: (monto / total) * 100,
      desglose,
    };
  })
    .filter((c) => c.monto > 0)
    .sort((a, b) => b.monto - a.monto);
}

// ---------------------------------------------------------------------------
// Pareto de productos (80/20)
// ---------------------------------------------------------------------------
export function construirPareto(productos: ProductoRentabilidadUI[]): ParetoUI {
  const ordenados = [...productos].sort(
    (a, b) => b.totalGenerado - a.totalGenerado,
  );
  const total = ordenados.reduce((acc, p) => acc + p.totalGenerado, 0);

  let acumulado = 0;
  const items = ordenados.map((p) => {
    acumulado += p.totalGenerado;
    return { ...p, pctAcumulado: total > 0 ? (acumulado / total) * 100 : 0 };
  });

  const indiceCorte80 = items.findIndex((p) => p.pctAcumulado >= 80);

  return { items, total, indiceCorte80 };
}

/** Etiqueta corta para el eje X del Pareto. */
export function abreviarNombre(nombre: string, max = 9) {
  const limpio = nombre.trim();
  const primera = limpio.split(" ")[0] ?? limpio;
  return primera.length > max ? `${primera.slice(0, max - 1)}…` : primera;
}

export { formatearCompacto };

