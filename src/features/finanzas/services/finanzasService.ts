//src/features/finanzas/services/finanzasService.ts
import { supabase } from "@/services/supabase/client";
import { Periodo } from "../types";

export function obtenerRangoPeriodo(periodo: Periodo) {
  const hoy = new Date();
  const desde = new Date(hoy);
  if (periodo === "semana") {
    desde.setDate(hoy.getDate() - 7);
  } else {
    desde.setDate(1); // primer día del mes actual
  }
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hoy.toISOString().slice(0, 10),
  };
}

export async function obtenerIngresos(
  empresaId: string,
  desde: string,
  hasta: string,
) {
  const { data, error } = await supabase
    .from("ingresos")
    .select("*, clientes(nombre), catalogo_productos(nombre)")
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
    .select("*")
    .eq("empresa_id", empresaId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerCobrosPendientes(empresaId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select("pago_total, pago_monto_cobrado")
    .eq("empresa_id", empresaId)
    .neq("pago_estado", "pagado");

  if (error) throw error;
  return (data ?? []).reduce(
    (acc, p) => acc + (Number(p.pago_total) - Number(p.pago_monto_cobrado)),
    0,
  );
}

export async function obtenerTendenciaFinanciera(empresaId: string) {
  const { data, error } = await supabase
    .from("vista_finanzas_diario")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerRankingProductos(empresaId: string, limite = 5) {
  const { data, error } = await supabase
    .from("vista_productos_rentabilidad")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("margen_ganancia", { ascending: false }) // 👈 Cambiado: reemplazar "total_generado" por el nombre real (ej. total_ventas)
    .limit(limite);

  if (error) throw error;
  return data ?? [];
}

export async function obtenerRankingClientes(empresaId: string, limite = 4) {
  const { data, error } = await supabase
    .from("vista_clientes_stats")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("total_gastado", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data ?? [];
}

export async function obtenerMetaMensual(
  empresaId: string,
  primerDiaMes: string,
) {
  const { data, error } = await supabase
    .from("metas_financieras")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("periodo", primerDiaMes)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function obtenerFilamentosBajoStock(empresaId: string) {
  const { data, error } = await supabase
    .from("filamentos")
    .select(
      "id, marca, material, color, color_hex, stock_gramos, capacidad_rollo_gramos, umbral_bajo_stock",
    )
    .eq("empresa_id", empresaId)
    .eq("activo", true);

  if (error) throw error;
  return data ?? [];
}
