// src/features/finanzas/hooks/useFinanzasResumen.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  mapEgresoDesdeDB,
  mapIngresoDesdeDB,
  mapIntentoImpresionDesdeDB,
} from "../mappers/finanzasMapper";
import {
  obtenerCobrosPendientes,
  obtenerEgresos,
  obtenerIngresos,
  obtenerIntentosImpresion,
  obtenerRangoPeriodo,
} from "../services/finanzasService";
import {
  EgresoUI,
  IngresoUI,
  IntentoImpresionUI,
  Periodo,
  ProduccionResumenUI,
  ResumenFinancieroUI,
} from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";
import {
  agruparEgresosPorCategoria,
  calcularMargenPct,
  calcularPorCategoria,
  calcularPorMetodo,
  calcularProduccion,
  calcularTicketPromedio,
  calcularTotales,
} from "../utils/finanzasCalculos";

const PRODUCCION_VACIA: ProduccionResumenUI = {
  gramos: 0,
  horas: 0,
  intentos: 0,
  intentosFallidos: 0,
  tasaFalloPct: 0,
};

export function useFinanzasResumen(periodo: Periodo) {
  const { empresaId, rol } = useEmpresaActual();
  const [ingresos, setIngresos] = useState<IngresoUI[]>([]);
  const [egresos, setEgresos] = useState<EgresoUI[]>([]);
  const [intentos, setIntentos] = useState<IntentoImpresionUI[]>([]);
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
      const [ingresosRows, egresosRows, intentosRows, pendientes] =
        await Promise.all([
          obtenerIngresos(empresaId, desde, hasta),
          obtenerEgresos(empresaId, desde, hasta),
          obtenerIntentosImpresion(empresaId, desde, hasta),
          obtenerCobrosPendientes(empresaId),
        ]);

      setIngresos(ingresosRows.map(mapIngresoDesdeDB));
      setEgresos(egresosRows.map(mapEgresoDesdeDB));
      setIntentos(intentosRows.map(mapIntentoImpresionDesdeDB));
      setCobrosPendientes(pendientes);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar finanzas");
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol, periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const resumen: ResumenFinancieroUI = useMemo(() => {
    const { totalIngresos, totalEgresos, utilidadNeta } = calcularTotales(
      ingresos,
      egresos,
    );
    return {
      totalIngresos,
      totalEgresos,
      utilidadNeta,
      cobrosPendientes,
      porMetodoIngresos: calcularPorMetodo(ingresos),
      porCategoriaEgresos: calcularPorCategoria(egresos),
      ticketPromedio: calcularTicketPromedio(totalIngresos, ingresos.length),
      cantidadIngresos: ingresos.length,
      margenPct: calcularMargenPct(utilidadNeta, totalIngresos),
    };
  }, [ingresos, egresos, cobrosPendientes]);

  const categoriasEgreso = useMemo(
    () => agruparEgresosPorCategoria(egresos),
    [egresos],
  );

  const produccion = useMemo(
    () => (intentos.length ? calcularProduccion(intentos) : PRODUCCION_VACIA),
    [intentos],
  );

  return {
    ingresos,
    egresos,
    resumen,
    categoriasEgreso,
    produccion,
    loading,
    error,
    refetch: cargar,
  };
}
