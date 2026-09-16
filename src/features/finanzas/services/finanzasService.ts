// src/features/finanzas/services/finanzasService.ts
//
// Todas las consultas apuntan a tablas que existen en el esquema:
// ingresos, egresos, pedidos, pedido_impresion_intentos, filamentos,
// metas_financieras, configuracion_empresa, catalogo_productos.
//
// Ya no se consultan vistas (vista_finanzas_diario / vista_productos_rentabilidad /
// vista_clientes_stats): la agregación se hace con los datos ya traídos.

import { supabase } from "@/services/supabase/client";
import { MESES_SERIE } from "../constantes";
import { Periodo, RangoFechas } from "../types";
import { aISO } from "../utils/finanzasFormato";

// ---------------------------------------------------------------------------
// Rangos de fechas
// ---------------------------------------------------------------------------
export function obtenerRangoPeriodo(periodo: Periodo): RangoFechas {
  const hoy = new Date();
  let desde: Date;

  switch (periodo) {
    case "semana":
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6);
      break;
    case "anio":
      desde = new Date(hoy.getFullYear(), 0, 1);
      break;
    case "mes":
    default:
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      break;
  }

  return { desde: aISO(desde), hasta: aISO(hoy) };
}

/** Rango que cubre los últimos `meses` meses completos (incluido el actual). */
export function obtenerRangoSerie(meses = MESES_SERIE): RangoFechas {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1);
  return { desde: aISO(desde), hasta: aISO(hoy) };
}

export function primerDiaMesActual(): string {
  const hoy = new Date();
  return aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}

// ---------------------------------------------------------------------------
// Movimientos
// ---------------------------------------------------------------------------
export async function obtenerIngresos(
  empresaId: string,
  desde: string,
  hasta: string,
) {
  const { data, error } = await supabase
    .from("ingresos")
    .select(
      "id, concepto, monto, metodo, fecha, producto_id, clientes(nombre), catalogo_productos(nombre, categoria)",
    )
    .eq("empresa_id", empresaId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerEgresos(
  empresaId: string,
  desde: string,
  hasta: string,
) {
  const { data, error } = await supabase
    .from("egresos")
    .select("id, concepto, categoria, monto, metodo, fecha")
    .eq("empresa_id", empresaId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Saldo por cobrar: pedidos que aún no están pagados por completo. */
export async function obtenerCobrosPendientes(empresaId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select("pago_total, pago_monto_cobrado")
    .eq("empresa_id", empresaId)
    .neq("pago_estado", "pagado");

  if (error) throw error;

  return (data ?? []).reduce((acc, p: any) => {
    const saldo = Number(p.pago_total ?? 0) - Number(p.pago_monto_cobrado ?? 0);
    return acc + Math.max(saldo, 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Producción real (gramos / horas impresas)
// ---------------------------------------------------------------------------
export async function obtenerIntentosImpresion(
  empresaId: string,
  desde: string,
  hasta: string,
) {
  const { data, error } = await supabase
    .from("pedido_impresion_intentos")
    .select(
      "id, gramos_planificados, gramos_reales, horas_planificadas, horas_reales, resultado, iniciado_at, finalizado_at, created_at",
    )
    .eq("empresa_id", empresaId)
    .not("finalizado_at", "is", null)
    .gte("finalizado_at", `${desde}T00:00:00`)
    .lte("finalizado_at", `${hasta}T23:59:59`)
    .order("finalizado_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Rentabilidad por producto (Pareto)
// ---------------------------------------------------------------------------
/**
 * Ingresos agrupados por producto en el rango indicado.
 * Se usa `ingresos.producto_id` -> `catalogo_productos`, sin vistas.
 */
export async function obtenerRankingProductos(
  empresaId: string,
  desde: string,
  hasta: string,
  limite = 8,
) {
  const { data, error } = await supabase
    .from("ingresos")
    .select("monto, producto_id, catalogo_productos(nombre, categoria)")
    .eq("empresa_id", empresaId)
    .not("producto_id", "is", null)
    .gte("fecha", desde)
    .lte("fecha", hasta);

  if (error) throw error;

  const acumulado = new Map<
    string,
    {
      productoId: string;
      nombre: string;
      categoria: string | null;
      ventas: number;
      totalGenerado: number;
    }
  >();

  for (const row of (data ?? []) as any[]) {
    const id = row.producto_id as string;
    const actual = acumulado.get(id) ?? {
      productoId: id,
      nombre: row.catalogo_productos?.nombre ?? "Sin nombre",
      categoria: row.catalogo_productos?.categoria ?? null,
      ventas: 0,
      totalGenerado: 0,
    };
    actual.ventas += 1;
    actual.totalGenerado += Number(row.monto ?? 0);
    acumulado.set(id, actual);
  }

  return [...acumulado.values()]
    .sort((a, b) => b.totalGenerado - a.totalGenerado)
    .slice(0, limite);
}

// ---------------------------------------------------------------------------
// Meta mensual / configuración / inventario
// ---------------------------------------------------------------------------
export async function obtenerMetaMensual(empresaId: string, periodo: string) {
  const { data, error } = await supabase
    .from("metas_financieras")
    .select("id, periodo, monto_meta")
    .eq("empresa_id", empresaId)
    .eq("periodo", periodo)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function obtenerConfiguracionEmpresa(empresaId: string) {
  const { data, error } = await supabase
    .from("configuracion_empresa")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function obtenerFilamentos(empresaId: string) {
  const { data, error } = await supabase
    .from("filamentos")
    .select(
      "id, marca, material, color, color_hex, stock_gramos, capacidad_rollo_gramos, umbral_bajo_stock",
    )
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("stock_gramos", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
