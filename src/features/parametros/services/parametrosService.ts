import { supabase } from "@/services/supabase/client";
import {
  mapDbToParametros,
  mapImpresoraToDb,
  mapParametrosToDbConfig,
} from "../mappers/parametrosMapper";
import {
  ImpresoraDepreciacion,
  PARAMETROS_VACIOS,
  ParametrosOperativos,
  ReglaMargenGanancia,
} from "../types";

export const parametrosService = {
  async getParametros(empresaId: string): Promise<ParametrosOperativos> {
    if (!empresaId) {
      console.error("❌ parametrosService.getParametros: empresaId vacío.");
    }

    const [configRes, impresorasRes, reglasRes] = await Promise.all([
      supabase
        .from("configuracion_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle(),
      supabase
        .from("impresoras")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("activa", true),
      supabase
        .from("reglas_margen_ganancia")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("nombre", { ascending: true }),
    ]);

    if (configRes.error)
      console.error("❌ configuracion_empresa:", configRes.error);
    if (impresorasRes.error)
      console.error("❌ impresoras:", impresorasRes.error);
    if (reglasRes.error)
      console.error("❌ reglas_margen_ganancia:", reglasRes.error);

    const impresorasData = impresorasRes.data || [];
    const reglasData = reglasRes.data || [];

    if (
      !configRes.data &&
      impresorasData.length === 0 &&
      reglasData.length === 0
    ) {
      return { ...PARAMETROS_VACIOS, empresaId };
    }

    return mapDbToParametros(configRes.data, impresorasData, reglasData);
  },

  async saveConfiguracion(empresaId: string, parametros: ParametrosOperativos) {
    const dbPayload = mapParametrosToDbConfig(empresaId, parametros);
    const { error } = await supabase
      .from("configuracion_empresa")
      .upsert(dbPayload, { onConflict: "empresa_id" });

    if (error) throw error;
  },

  async saveImpresora(empresaId: string, impresora: ImpresoraDepreciacion) {
    const payload = mapImpresoraToDb(empresaId, impresora);
    const { data, error } = await supabase
      .from("impresoras")
      .update(payload)
      .eq("id", impresora.id)
      .eq("empresa_id", empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 🟢 Métodos para Reglas de Margen de Ganancia adaptados

  async addReglaMargen(
    empresaId: string,
    regla: Omit<ReglaMargenGanancia, "id">,
  ): Promise<ReglaMargenGanancia> {
    const { data, error } = await supabase
      .from("reglas_margen_ganancia")
      .insert({
        empresa_id: empresaId,
        nombre: regla.nombre,
        margen_ganancia_pct: regla.porcentaje,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: String(data.id),
      nombre: String(data.nombre),
      porcentaje: Number(data.margen_ganancia_pct),
    };
  },

  async updateReglaMargen(
    reglaId: string,
    regla: Partial<Omit<ReglaMargenGanancia, "id">>,
  ): Promise<ReglaMargenGanancia> {
    const updatePayload: Record<string, any> = {};
    if (regla.nombre !== undefined) updatePayload.nombre = regla.nombre;
    if (regla.porcentaje !== undefined)
      updatePayload.margen_ganancia_pct = regla.porcentaje;

    const { data, error } = await supabase
      .from("reglas_margen_ganancia")
      .update(updatePayload)
      .eq("id", reglaId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: String(data.id),
      nombre: String(data.nombre),
      porcentaje: Number(data.margen_ganancia_pct),
    };
  },

  async deleteReglaMargen(reglaId: string): Promise<void> {
    const { error } = await supabase
      .from("reglas_margen_ganancia")
      .delete()
      .eq("id", reglaId);

    if (error) throw error;
  },
};