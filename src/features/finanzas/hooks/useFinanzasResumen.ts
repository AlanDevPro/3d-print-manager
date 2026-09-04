//src/features/finanzas/hooks/useFinanzasResumen.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useState } from "react";
import { mapEgresoDesdeDB, mapIngresoDesdeDB } from "../mappers/finanzasMapper";
import {
  obtenerCobrosPendientes,
  obtenerEgresos,
  obtenerIngresos,
  obtenerRangoPeriodo,
} from "../services/finanzasService";
import { EgresoUI, IngresoUI, Periodo, ResumenFinancieroUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";
import {
  calcularPorCategoria,
  calcularPorMetodo,
  calcularTicketPromedio,
  calcularTotales,
} from "../utils/finanzasCalculos";

export function useFinanzasResumen(periodo: Periodo) {
  const { empresaId, rol } = useEmpresaActual();
  const [ingresos, setIngresos] = useState<IngresoUI[]>([]);
  const [egresos, setEgresos] = useState<EgresoUI[]>([]);
  const [cobrosPendientes, setCobrosPendientes] = useState(0);
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
      const [ingresosRows, egresosRows, pendientes] = await Promise.all([
        obtenerIngresos(empresaId, desde, hasta),
        obtenerEgresos(empresaId, desde, hasta),
        obtenerCobrosPendientes(empresaId),
      ]);
      setIngresos(ingresosRows.map(mapIngresoDesdeDB));
      setEgresos(egresosRows.map(mapEgresoDesdeDB));
      setCobrosPendientes(pendientes);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar finanzas");
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol, periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const { totalIngresos, totalEgresos, utilidadNeta } = calcularTotales(
    ingresos,
    egresos,
  );

  const resumen: ResumenFinancieroUI = {
    totalIngresos,
    totalEgresos,
    utilidadNeta,
    cobrosPendientes,
    porMetodoIngresos: calcularPorMetodo(ingresos),
    porCategoriaEgresos: calcularPorCategoria(egresos),
    ticketPromedio: calcularTicketPromedio(totalIngresos, ingresos.length),
    cantidadIngresos: ingresos.length,
  };

  return { ingresos, egresos, resumen, loading, error, refetch: cargar };
}
