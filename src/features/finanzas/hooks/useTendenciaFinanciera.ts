//src/features/finanzas/hooks/useTendenciaFinanciera.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useEffect, useState } from "react";
import { obtenerTendenciaFinanciera } from "../services/finanzasService";
import { TendenciaMensual } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

const TENDENCIA_VACIA: TendenciaMensual = {
  labels: [],
  ingresos: [],
  egresos: [],
};

export function useTendenciaFinanciera() {
  const { empresaId, rol } = useEmpresaActual();
  const [tendencia, setTendencia] = useState<TendenciaMensual>(TENDENCIA_VACIA);
  const [variacionMensual, setVariacionMensual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const rows = await obtenerTendenciaFinanciera(empresaId);
        const labels = rows.map((r: any) => r.fecha);
        const ingresos = rows.map((r: any) => Number(r.total_ingresos ?? 0));
        const egresos = rows.map((r: any) => Number(r.total_egresos ?? 0));
        setTendencia({ labels, ingresos, egresos });

        if (ingresos.length >= 2) {
          const actual = ingresos[ingresos.length - 1];
          const anterior = ingresos[ingresos.length - 2];
          setVariacionMensual(
            anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0,
          );
        }
      } catch (error) {
        console.error("Error al cargar tendencia financiera:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId, rol]);

  return { tendencia, variacionMensual, loading };
}
