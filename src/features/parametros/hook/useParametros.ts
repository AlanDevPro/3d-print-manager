// src/features/parametros/hooks/useParametros.ts
import {
  guardarParametros,
  obtenerParametros,
} from "@/services/supabase/parametros";
import { useCallback, useEffect, useState } from "react";
import {
  PARAMETROS_DEFAULT,
  ParametrosOperativos,
  SeccionParametros,
} from "../types";

interface UseParametrosResult {
  parametros: ParametrosOperativos | null;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  actualizarSeccion: <K extends SeccionParametros>(
    seccion: K,
    valores: Partial<ParametrosOperativos[K]>,
  ) => void;
  guardarCambios: () => Promise<void>;
  recargar: () => Promise<void>;
}

export function useParametros(userId: string | null): UseParametrosResult {
  const [parametros, setParametros] = useState<ParametrosOperativos | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!userId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerParametros(userId);
      setParametros(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar parámetros");
      setParametros({ ...PARAMETROS_DEFAULT, userId });
    } finally {
      setCargando(false);
    }
  }, [userId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

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

  const guardarCambios = useCallback(async () => {
    if (!parametros) return;
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await guardarParametros(parametros);
      setParametros(actualizado);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar parámetros");
      throw e;
    } finally {
      setGuardando(false);
    }
  }, [parametros]);

  return {
    parametros,
    cargando,
    guardando,
    error,
    actualizarSeccion,
    guardarCambios,
    recargar: cargar,
  };
}
