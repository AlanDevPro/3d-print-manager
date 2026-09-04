// src/features/dashboard/services/dashboardService.ts
import { supabase } from "@/services/supabase/client";
import { CotizacionRow, ImpresoraRow, ProductoCatalogoRow } from "../types";

export async function fetchImpresoras(
  empresaId: string,
): Promise<ImpresoraRow[]> {
  const { data, error } = await supabase
    .from("impresoras")
    .select("id, modelo, marca, activa, estado, empresa_id")
    .eq("empresa_id", empresaId)
    .order("modelo", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCotizacionesPendientes(
  empresaId: string,
  limite = 5,
): Promise<CotizacionRow[]> {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select(
      "id, codigo_cotizacion, cliente_nombre, precio_final, estado, created_at, empresa_id",
    )
    .eq("empresa_id", empresaId)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true })
    .limit(limite);

  if (error) throw error;
  return data ?? [];
}

export async function fetchIngresosDelMes(
  empresaId: string,
): Promise<{ total: number; cantidad: number }> {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    .toISOString()
    .slice(0, 10); // `fecha` en `ingresos` es tipo date

  const { data, error } = await supabase
    .from("ingresos")
    .select("monto, fecha")
    .eq("empresa_id", empresaId)
    .gte("fecha", inicioMes);

  if (error) throw error;

  const total = (data ?? []).reduce((acc, i) => acc + i.monto, 0);
  return { total, cantidad: data?.length ?? 0 };
}

export async function fetchCatalogoProductos(
  empresaId: string,
  limite = 8,
): Promise<ProductoCatalogoRow[]> {
  const { data, error } = await supabase
    .from("catalogo_productos")
    .select(
      `
      id,
      nombre,
      categoria,
      descripcion,
      precio_referencia,
      tiempo_impresion_horas,
      peso_gramos,
      imagen_url,
      stock_terminado,
      umbral_stock_bajo,
      activo,
      empresa_id
      `,
    )
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data ?? [];
}
