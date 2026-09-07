// src/features/parametros/hooks/useParametros.ts
import { useCallback, useEffect, useState } from "react";
import { parametrosService } from "../services/parametrosService";
import { PARAMETROS_VACIOS, ParametrosOperativos, ReglaMargenGanancia } from "../types";
import { supabase } from "@/services/supabase/client";

interface UseParametrosResult {
  parametros: ParametrosOperativos | null;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  actualizarSeccion: <K extends keyof ParametrosOperativos>(
    seccion: K,
    valores: Partial<ParametrosOperativos[K]>
  ) => void;
  guardarCambios: () => Promise<void>;
  recargar: () => Promise<void>;
  // Métodos reactivos expuestos para mutaciones optimistas
  agregarRegla: (regla: Omit<ReglaMargenGanancia, "id">) => Promise<void>;
  eliminarRegla: (reglaId: string) => Promise<void>;
}

export function useParametros(empresaId: string | null): UseParametrosResult {
  const [parametros, setParametros] = useState<ParametrosOperativos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Carga inicial remota/local
  const cargar = useCallback(async () => {
    if (!empresaId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const data = await parametrosService.getParametros(empresaId);
      setParametros(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar parámetros";
      setError(msg);
      setParametros({ ...PARAMETROS_VACIOS, empresaId });
    } finally {
      setCargando(false);
    }
  }, [empresaId]);

  // 2. Suscripción en Tiempo Real con Supabase Realtime
  useEffect(() => {
    cargar();

    if (!empresaId) return;

    const channel = supabase
      .channel(`parametros-empresa-${empresaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "configuracion_empresa",
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => cargar()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "impresoras",
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => cargar()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reglas_margen_ganancia",
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => cargar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, cargar]);

  // 3. Mutación Local para Formulario Temporal
  const actualizarSeccion = useCallback<
    UseParametrosResult["actualizarSeccion"]
  >((seccion, valores) => {
    setParametros((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [seccion]: { ...(prev[seccion] as object), ...valores },
      };
    });
  }, []);

  // 4. Guardado Principal
  const guardarCambios = useCallback(async () => {
    if (!parametros || !empresaId) return;

    setGuardando(true);
    setError(null);
    try {
      await parametrosService.saveConfiguracion(empresaId, parametros);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar parámetros";
      setError(msg);
      throw e;
    } finally {
      setGuardando(false);
    }
  }, [parametros, empresaId]);

  // 5. Mutaciones Reactivas Optimistas para Reglas
  const agregarRegla = useCallback(
    async (regla: Omit<ReglaMargenGanancia, "id">) => {
      if (!empresaId) return;
      try {
        const nuevaRegla = await parametrosService.addReglaMargen(empresaId, regla);
        setParametros((prev) => {
          if (!prev) return prev;
          const reglasActuales = prev.tarifas?.reglasMargen ?? [];
          return {
            ...prev,
            tarifas: {
              ...prev.tarifas,
              monedaPrincipal: prev.tarifas?.monedaPrincipal ?? "BOB",
              tarifaElectricaKwh: prev.tarifas?.tarifaElectricaKwh ?? 0.8,
              reglasMargen: [...reglasActuales, nuevaRegla],
            },
          };
        });
      } catch (e) {
        await cargar();
        throw e;
      }
    },
    [empresaId, cargar]
  );

  const eliminarRegla = useCallback(
    async (reglaId: string) => {
      try {
        setParametros((prev) => {
          if (!prev) return prev;
          const reglasActuales = prev.tarifas?.reglasMargen ?? [];
          return {
            ...prev,
            tarifas: {
              ...prev.tarifas,
              monedaPrincipal: prev.tarifas?.monedaPrincipal ?? "BOB",
              tarifaElectricaKwh: prev.tarifas?.tarifaElectricaKwh ?? 0.8,
              reglasMargen: reglasActuales.filter((r) => r.id !== reglaId),
            },
          };
        });
        await parametrosService.deleteReglaMargen(reglaId);
      } catch (e) {
        await cargar();
        throw e;
      }
    },
    [cargar]
  );

  return {
    parametros,
    cargando,
    guardando,
    error,
    actualizarSeccion,
    guardarCambios,
    recargar: cargar,
    agregarRegla,
    eliminarRegla,
  };
}