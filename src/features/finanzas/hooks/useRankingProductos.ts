// src/features/finanzas/hooks/useRankingProductos.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  obtenerRangoPeriodo,
  obtenerRankingProductos,
} from "../services/finanzasService";
import { ParetoUI, Periodo, ProductoRentabilidadUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";
import { construirPareto } from "../utils/finanzasCalculos";

const PARETO_VACIO: ParetoUI = { items: [], total: 0, indiceCorte80: -1 };

export function useRankingProductos(periodo: Periodo, limite = 8) {
  const { empresaId, rol } = useEmpresaActual();
  const [productos, setProductos] = useState<ProductoRentabilidadUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { desde, hasta } = obtenerRangoPeriodo(periodo);
      const rows = await obtenerRankingProductos(
        empresaId,
        desde,
        hasta,
        limite,
      );
      setProductos(rows);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar el ranking de productos");
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol, periodo, limite]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pareto = useMemo(
    () => (productos.length ? construirPareto(productos) : PARETO_VACIO),
    [productos],
  );

  return { productos, pareto, loading, error, refetch: cargar };
}
