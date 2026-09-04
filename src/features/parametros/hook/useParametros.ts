// src/features/parametros/hooks/useParametros.ts
import { useCallback, useEffect, useState } from "react";
import { parametrosService } from "../services/parametrosService";
import { PARAMETROS_VACIOS, ParametrosOperativos } from "../types";

interface UseParametrosResult {
  parametros: ParametrosOperativos | null;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  actualizarSeccion: <K extends keyof ParametrosOperativos>(
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
    console.log("🚀 [Hook Check] Entrando a cargar(). userId actual:", userId);

    if (!userId) {
      console.warn(
        "⚠️ [Hook Warning] userId es NULL, UNDEFINED o VACÍO. No se invocará la BD.",
      );
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      console.log(
        "📞 [Hook Exec] Invocando parametrosService.getParametros para userId:",
        userId,
      );
      const data = await parametrosService.getParametros(userId);

      console.log(
        "🎉 [Hook Success] Datos recibidos con éxito en el Hook:",
        data,
      );
      setParametros(data);
    } catch (e) {
      console.error(
        "💥 [Hook Error] Falló parametrosService.getParametros:",
        e,
      );
      const msg = e instanceof Error ? e.message : "Error al cargar parámetros";
      setError(msg);
      // Fallback a estructura estrictamente VACÍA sin datos precargados
      setParametros({ ...PARAMETROS_VACIOS, userId });
    } finally {
      setCargando(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log(
      "🔄 [Hook Effect] Se ejecutó useEffect de useParametros. Re-evaluando dependencia userId...",
    );
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
    if (!parametros || !userId) {
      console.warn(
        "⚠️ [Hook Warning] No se puede guardar: parametros o userId ausentes.",
        { parametros, userId },
      );
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      console.log("💾 [Hook Save] Invocando saveConfiguracion...");
      await parametrosService.saveConfiguracion(userId, parametros);
      console.log("✅ [Hook Save Success] Guardado exitoso en BD.");
    } catch (e) {
      console.error("💥 [Hook Save Error] Falló el guardado:", e);
      const msg =
        e instanceof Error ? e.message : "Error al guardar parámetros";
      setError(msg);
      throw e;
    } finally {
      setGuardando(false);
    }
  }, [parametros, userId]);

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
