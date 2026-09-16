// src/features/finanzas/hooks/useFilamentosBajoStock.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapFilamentoDesdeDB } from "../mappers/finanzasMapper";
import { obtenerFilamentos } from "../services/finanzasService";
import { FilamentoStockUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

/**
 * @param umbralRelativo fracción del rollo usada cuando el filamento no tiene
 * `umbral_bajo_stock` configurado en la base.
 */
export function useFilamentosBajoStock(umbralRelativo = 0.2) {
  const { empresaId, rol } = useEmpresaActual();
  const [filamentos, setFilamentos] = useState<FilamentoStockUI[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await obtenerFilamentos(empresaId);
      setFilamentos(rows.map(mapFilamentoDesdeDB));
    } catch (error) {
      console.error("Error al cargar filamentos:", error);
      setFilamentos([]);
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filamentosBajoStock = useMemo(
    () =>
      filamentos.filter((f) =>
        f.umbralBajoStock > 0
          ? f.gramosRestantes <= f.umbralBajoStock
          : f.gramosRestantes / (f.gramosPorRollo || 1) <= umbralRelativo,
      ),
    [filamentos, umbralRelativo],
  );

  return { filamentos, filamentosBajoStock, loading, refetch: cargar };
}
