// src/features/finanzas/hooks/useMetaMensual.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useState } from "react";
import {
  obtenerMetaMensual,
  primerDiaMesActual,
} from "../services/finanzasService";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

export function useMetaMensual() {
  const { empresaId, rol } = useEmpresaActual();
  const [meta, setMeta] = useState(0);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const row = await obtenerMetaMensual(empresaId, primerDiaMesActual());
      setMeta(Number(row?.monto_meta ?? 0));
    } catch (error) {
      console.error("Error al cargar meta mensual:", error);
      setMeta(0);
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { meta, loading, refetch: cargar };
}
