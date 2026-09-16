// src/features/finanzas/hooks/useConfiguracionEmpresa.ts
//
// La moneda y los costos base salen de `configuracion_empresa`, no se
// hardcodean "Bs" en los componentes.

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useState } from "react";
import { mapConfiguracionEmpresaDesdeDB } from "../mappers/finanzasMapper";
import { obtenerConfiguracionEmpresa } from "../services/finanzasService";
import { ConfiguracionEmpresaUI } from "../types";

const CONFIG_POR_DEFECTO: ConfiguracionEmpresaUI = {
  moneda: "Bs",
  costoKwh: 0,
  costoManoObraHora: 0,
  costoOperativoFijoMensual: 0,
  horasLaborablesMes: 160,
  tasaFalloDefectoPct: 0,
  impuestoPct: 0,
  margenGananciaDefectoPct: 0,
};

export function useConfiguracionEmpresa() {
  const { empresaId } = useEmpresaActual();
  const [config, setConfig] =
    useState<ConfiguracionEmpresaUI>(CONFIG_POR_DEFECTO);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const row = await obtenerConfiguracionEmpresa(empresaId);
      setConfig(mapConfiguracionEmpresaDesdeDB(row));
    } catch (error) {
      console.error("Error al cargar configuración de empresa:", error);
      setConfig(CONFIG_POR_DEFECTO);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { config, moneda: config.moneda, loading, refetch: cargar };
}
