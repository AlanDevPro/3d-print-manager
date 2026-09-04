import { useCallback, useEffect, useState } from "react";
import { mapDbToEmpresa } from "../mappers/empresaMapper";
import { obtenerEmpresa } from "../services/empresaService";
import type { EmpresaInfo } from "../types";

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEmpresa = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const dbEmpresa = await obtenerEmpresa();
      if (dbEmpresa) {
        setEmpresa(mapDbToEmpresa(dbEmpresa));
        setEmpresaId(dbEmpresa.id);
      } else {
        setEmpresa(null);
        setEmpresaId(null);
      }
    } catch (e: any) {
      console.error("❌ [useEmpresa] Error al obtener datos de la empresa:", e);
      setError(e.message ?? "Error al cargar la empresa");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpresa();
  }, [cargarEmpresa]);

  return {
    empresa,
    empresaId,
    cargando,
    error,
    recargarEmpresa: cargarEmpresa,
  };
}

export type UseEmpresaReturn = ReturnType<typeof useEmpresa>;
