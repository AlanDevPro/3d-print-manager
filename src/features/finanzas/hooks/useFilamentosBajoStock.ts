//src/features/finanzas/hooks/useFilamentosBajoStock.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useEffect, useState } from "react";
import { mapFilamentoDesdeDB } from "../mappers/finanzasMapper";
import { obtenerFilamentosBajoStock } from "../services/finanzasService";
import { FilamentoStockUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

export function useFilamentosBajoStock(umbral = 0.2) {
  const { empresaId, rol } = useEmpresaActual();
  const [filamentos, setFilamentos] = useState<FilamentoStockUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const rows = await obtenerFilamentosBajoStock(empresaId);
        setFilamentos(rows.map(mapFilamentoDesdeDB));
      } catch (error) {
        console.error("Error al cargar filamentos bajo stock:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId, rol]);

  const bajoStock = filamentos.filter((f) => {
    if (f.umbralBajoStock !== undefined && f.umbralBajoStock > 0) {
      return f.gramosRestantes <= f.umbralBajoStock;
    }
    return f.gramosRestantes / f.gramosPorRollo <= umbral;
  });

  return { filamentos, filamentosBajoStock: bajoStock, loading };
}
