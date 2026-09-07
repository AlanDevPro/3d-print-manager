import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/services/supabase/client";
import { useCallback, useEffect, useState } from "react";
import {
  getConfiguracionEmpresa,
  getEmpresaIdByUserId,
  getImpresorasActivas,
  getMaterialesActivos,
  getReglasMargenGanancia,
} from "../services/materialesService";
import type {
  ConfiguracionEmpresa,
  Impresora,
  Material,
  ReglaMargenGanancia,
} from "../types";

export function useMaterialesTaller() {
  const { user } = useAuth();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [impresoras, setImpresoras] = useState<Impresora[]>([]);
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionEmpresa | null>(null);
  const [reglasMargen, setReglasMargen] = useState<ReglaMargenGanancia[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    setError(null);

    try {
      const activeEmpresaId = await getEmpresaIdByUserId(user.id);
      setEmpresaId(activeEmpresaId);

      const [mats, imps, cfg, reglas] = await Promise.all([
        getMaterialesActivos(activeEmpresaId),
        getImpresorasActivas(activeEmpresaId),
        getConfiguracionEmpresa(activeEmpresaId),
        getReglasMargenGanancia(activeEmpresaId),
      ]);

      setMateriales(mats);
      setImpresoras(imps);
      setConfiguracion(cfg);
      setReglasMargen(reglas);
    } catch (e: any) {
      setError(e.message ?? "Error cargando los recursos del taller");
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ============================================================================
  // SUSCRIPCIÓN EN TIEMPO REAL (SUPABASE REALTIME)
  // ============================================================================
  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel(`taller_changes_${empresaId}`)
      // 1. Cambios en Filamentos / Materiales
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "filamentos",
          filter: `empresa_id=eq.${empresaId}`,
        },
        async () => {
          const matsActualizados = await getMaterialesActivos(empresaId);
          setMateriales(matsActualizados);
        }
      )
      // 2. Cambios en Impresoras
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "impresoras",
          filter: `empresa_id=eq.${empresaId}`,
        },
        async () => {
          const impsActualizadas = await getImpresorasActivas(empresaId);
          setImpresoras(impsActualizadas);
        }
      )
      // 3. Cambios en Configuración (Mano de obra, Energía/KWh, Tasa de fallo)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "configuracion_empresa",
          filter: `empresa_id=eq.${empresaId}`,
        },
        async () => {
          const cfgActualizada = await getConfiguracionEmpresa(empresaId);
          setConfiguracion(cfgActualizada);
        }
      )
      // 4. Cambios en Reglas de Margen
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reglas_margen_ganancia",
          filter: `empresa_id=eq.${empresaId}`,
        },
        async () => {
          const reglasActualizadas = await getReglasMargenGanancia(empresaId);
          setReglasMargen(reglasActualizadas);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  return {
    empresaId,
    materiales,
    impresoras,
    configuracion,
    reglasMargen,
    cargando,
    error,
    recargar: cargarDatos,
  };
}