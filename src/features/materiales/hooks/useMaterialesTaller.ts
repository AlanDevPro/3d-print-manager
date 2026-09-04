//src/features/materiales/hooks/useMaterialesTaller.ts
import { useAuth } from "@/features/auth/hooks/useAuth";
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
