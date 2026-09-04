//src/features/parametros/services/cargaInicialService.ts
import { supabase } from "@/services/supabase/client";

export interface DatosTallerCompletos {
  configuracion: any | null;
  impresoras: any[];
  filamentos: any[];
  reglasMargen: any[];
}

export async function cargarDatosTaller(
  empresaId: string,
): Promise<DatosTallerCompletos> {
  const [configRes, impresorasRes, filamentosRes, reglasRes] =
    await Promise.all([
      supabase
        .from("configuracion_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle(),
      supabase
        .from("impresoras")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("activa", true)
        .order("marca", { ascending: true }),
      supabase
        .from("filamentos")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("activo", true)
        .order("material", { ascending: true }),
      supabase
        .from("reglas_margen_ganancia")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("cantidad_minima", { ascending: true }),
    ]);

  if (configRes.error)
    throw new Error(`configuracion_empresa: ${configRes.error.message}`);
  if (impresorasRes.error)
    throw new Error(`impresoras: ${impresorasRes.error.message}`);
  if (filamentosRes.error)
    throw new Error(`filamentos: ${filamentosRes.error.message}`);
  if (reglasRes.error)
    throw new Error(`reglas_margen_ganancia: ${reglasRes.error.message}`);

  return {
    configuracion: configRes.data,
    impresoras: impresorasRes.data ?? [],
    filamentos: filamentosRes.data ?? [],
    reglasMargen: reglasRes.data ?? [],
  };
}
