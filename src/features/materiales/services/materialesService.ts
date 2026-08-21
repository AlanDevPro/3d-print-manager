import { supabase } from "@/services/supabase/client";
import {
  ConfiguracionUsuario,
  Impresora,
  Material,
  ReglaMargenGanancia,
} from "@/types/database";

/**
 * Obtiene los materiales activos del usuario.
 */
export async function getMaterialesActivos(
  userId: string,
): Promise<Material[]> {
  try {
    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .eq("user_id", userId)
      .eq("activo", true)
      .order("tipo", { ascending: true });

    if (error) {
      console.error("[getMaterialesActivos] Error Supabase:", error.message);
      throw new Error(`Error al obtener materiales: ${error.message}`);
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getMaterialesActivos] Captura de excepción:", err);
    throw err;
  }
}

/**
 * Obtiene las impresoras activas del usuario.
 */
export async function getImpresorasActivas(
  userId: string,
): Promise<Impresora[]> {
  try {
    const { data, error } = await supabase
      .from("impresoras")
      .select("*")
      .eq("user_id", userId)
      .eq("activa", true)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("[getImpresorasActivas] Error Supabase:", error.message);
      throw new Error(`Error al obtener impresoras: ${error.message}`);
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getImpresorasActivas] Captura de excepción:", err);
    throw err;
  }
}

/**
 * Obtiene la configuración del usuario.
 */
export async function getConfiguracionUsuario(
  userId: string,
): Promise<ConfiguracionUsuario> {
  try {
    const { data, error } = await supabase
      .from("configuracion_usuario")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[getConfiguracionUsuario] Error Supabase:", error.message);
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }

    if (!data) {
      return {
        user_id: userId,
        costo_kwh: 0.8,
        costo_mano_obra_hora: 15,
        costo_operativo_fijo_mensual: 0,
        horas_laborables_mes: 160,
        tasa_fallo_defecto_pct: 5,
        impuesto_pct: 0,
        margen_ganancia_defecto_pct: 30,
        moneda: "Bs",
        updated_at: new Date().toISOString(),
      };
    }

    return data;
  } catch (err: any) {
    console.error("[getConfiguracionUsuario] Captura de excepción:", err);
    throw err;
  }
}

/**
 * Obtiene las reglas de margen de ganancia por escala/volumen del usuario
 * ordenadas ascendentemente por cantidad mínima para evaluar los rangos correctamente.
 */
export async function getReglasMargenGanancia(
  userId: string,
): Promise<ReglaMargenGanancia[]> {
  try {
    const { data, error } = await supabase
      .from("reglas_margen_ganancia")
      .select("*")
      .eq("user_id", userId)
      .order("cantidad_minima", { ascending: true });

    if (error) {
      console.error("[getReglasMargenGanancia] Error Supabase:", error.message);
      throw new Error(
        `Error al obtener reglas de margen de ganancia: ${error.message}`,
      );
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getReglasMargenGanancia] Captura de excepción:", err);
    throw err;
  }
}
