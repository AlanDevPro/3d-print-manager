// src/features/materiales/services/materialesService.ts
import { supabase } from "@/services/supabase/client";
import type {
  ConfiguracionEmpresa,
  Filamento,
  FilamentoInput,
  Impresora,
  ImpresoraInput,
  Material,
  ReglaMargenGanancia,
} from "../types";

/* ============================================================================
   CONFIGURACIÓN POR DEFECTO
   ============================================================================ */

const DEFAULT_CONFIGURACION = (empresaId: string): ConfiguracionEmpresa => ({
  empresa_id: empresaId,
  costo_kwh: 0.8,
  costo_mano_obra_hora: 15,
  costo_operativo_fijo_mensual: 0,
  horas_laborables_mes: 160,
  tasa_fallo_defecto_pct: 5,
  impuesto_pct: 0,
  margen_ganancia_defecto_pct: 30,
  moneda: "BOB",
  qr_pago_url: null,
  qr_pago_titular: null,
  updated_at: new Date().toISOString(),
});

/* ============================================================================
   EMPRESA HELPER
   ============================================================================ */

/**
 * Obtiene el ID de la empresa asociada al usuario autenticado.
 */
export async function getEmpresaIdByUserId(userId: string): Promise<string> {
  if (!userId) {
    throw new Error("Se requiere un userId válido para consultar la empresa.");
  }

  const { data, error } = await supabase
    .from("empresas")
    .select("id")
    .eq("creado_por", userId)
    .maybeSingle();

  if (error || !data) {
    console.error(
      "[getEmpresaIdByUserId] Error obteniendo empresa:",
      error?.message,
    );
    throw new Error("No se encontró una empresa asociada a este usuario.");
  }

  return data.id;
}

/* ============================================================================
   FILAMENTOS / MATERIALES
   ============================================================================ */

/**
 * Obtiene los filamentos (materiales) activos de la empresa.
 */
export async function getMaterialesActivos(
  empresaId: string,
): Promise<Material[]> {
  if (!empresaId) return [];

  try {
    const { data, error } = await supabase
      .from("filamentos")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("activo", true)
      .order("material", { ascending: true });

    if (error) {
      console.error("[getMaterialesActivos] Error Supabase:", error.message);
      throw new Error(`Error al obtener filamentos: ${error.message}`);
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getMaterialesActivos] Excepción:", err);
    throw err;
  }
}

/**
 * Obtiene todos los filamentos de la empresa (activos e inactivos).
 */
export async function getTodosLosFilamentos(
  empresaId: string,
): Promise<Filamento[]> {
  if (!empresaId) return [];

  try {
    const { data, error } = await supabase
      .from("filamentos")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("material", { ascending: true });

    if (error) {
      console.error("[getTodosLosFilamentos] Error Supabase:", error.message);
      throw new Error(
        `Error al consultar inventario de filamentos: ${error.message}`,
      );
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getTodosLosFilamentos] Excepción:", err);
    throw err;
  }
}

/**
 * Crea un nuevo registro de filamento asociado a la empresa.
 */
export async function crearFilamento(
  empresaId: string,
  input: FilamentoInput,
): Promise<Filamento> {
  if (!empresaId) {
    throw new Error(
      "No se proporcionó un ID de empresa válido para crear el filamento.",
    );
  }

  const { data, error } = await supabase
    .from("filamentos")
    .insert([{ ...input, empresa_id: empresaId }])
    .select()
    .single();

  if (error) {
    console.error("[crearFilamento] Error Supabase:", error.message);
    throw new Error(`Error al registrar el filamento: ${error.message}`);
  }

  return data;
}

/* ============================================================================
   IMPRESORAS
   ============================================================================ */

/**
 * Obtiene las impresoras activas de la empresa.
 */
export async function getImpresorasActivas(
  empresaId: string,
): Promise<Impresora[]> {
  if (!empresaId) return [];

  try {
    const { data, error } = await supabase
      .from("impresoras")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("activa", true)
      .order("marca", { ascending: true });

    if (error) {
      console.error("[getImpresorasActivas] Error Supabase:", error.message);
      throw new Error(`Error al obtener impresoras: ${error.message}`);
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getImpresorasActivas] Excepción:", err);
    throw err;
  }
}

/**
 * Obtiene todas las impresoras de la empresa.
 */
export async function getTodasLasImpresoras(
  empresaId: string,
): Promise<Impresora[]> {
  if (!empresaId) return [];

  try {
    const { data, error } = await supabase
      .from("impresoras")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("marca", { ascending: true });

    if (error) {
      console.error("[getTodasLasImpresoras] Error Supabase:", error.message);
      throw new Error(
        `Error al obtener catálogo de impresoras: ${error.message}`,
      );
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getTodasLasImpresoras] Excepción:", err);
    throw err;
  }
}

/**
 * Crea una nueva impresora para la empresa.
 */
export async function crearImpresora(
  empresaId: string,
  input: ImpresoraInput,
): Promise<Impresora> {
  if (!empresaId) {
    throw new Error(
      "No se proporcionó un ID de empresa válido para crear la impresora.",
    );
  }

  const { data, error } = await supabase
    .from("impresoras")
    .insert([{ ...input, empresa_id: empresaId }])
    .select()
    .single();

  if (error) {
    console.error("[crearImpresora] Error Supabase:", error.message);
    throw new Error(`Error al crear la impresora: ${error.message}`);
  }

  return data;
}

/* ============================================================================
   CONFIGURACIÓN Y REGLAS DE NEGOCIO
   ============================================================================ */

/**
 * Obtiene la configuración de costos globales de la empresa mediante empresa_id.
 */
export async function getConfiguracionEmpresa(
  empresaId: string,
): Promise<ConfiguracionEmpresa> {
  if (!empresaId) {
    return DEFAULT_CONFIGURACION("");
  }

  try {
    const { data, error } = await supabase
      .from("configuracion_empresa")
      .select("*")
      .eq("empresa_id", empresaId)
      .maybeSingle();

    if (error) {
      console.error("[getConfiguracionEmpresa] Error Supabase:", error.message);
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }

    if (!data) {
      return DEFAULT_CONFIGURACION(empresaId);
    }

    return data;
  } catch (err: any) {
    console.error("[getConfiguracionEmpresa] Excepción:", err);
    throw err;
  }
}

/**
 * Obtiene las reglas de margen de ganancia asociadas a la empresa.
 */
export async function getReglasMargenGanancia(
  empresaId: string,
): Promise<ReglaMargenGanancia[]> {
  if (!empresaId) return [];

  try {
    const { data, error } = await supabase
      .from("reglas_margen_ganancia")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getReglasMargenGanancia] Error Supabase:", error.message);
      throw new Error(`Error al obtener reglas de utilidad: ${error.message}`);
    }

    return data ?? [];
  } catch (err: any) {
    console.error("[getReglasMargenGanancia] Excepción:", err);
    throw err;
  }
}