// src/features/finanzas/hooks/useSerieMensual.ts
//
// Reemplaza a useTendenciaFinanciera. Trae los últimos N meses de ingresos,
// egresos e intentos de impresión y arma la serie mensual que alimentan
// tanto los KPIs como el gráfico Ingresos vs Egresos.

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MESES_SERIE } from "../constantes";
import {
    mapEgresoDesdeDB,
    mapIngresoDesdeDB,
    mapIntentoImpresionDesdeDB,
} from "../mappers/finanzasMapper";
import {
    obtenerEgresos,
    obtenerIngresos,
    obtenerIntentosImpresion,
    obtenerRangoSerie,
} from "../services/finanzasService";
import {
    EgresoUI,
    IngresoUI,
    IntentoImpresionUI,
    MesFinancieroUI,
} from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";
import {
    construirSerieMensual,
    variacionMensualIngresos,
} from "../utils/finanzasCalculos";

export function useSerieMensual(meses = MESES_SERIE) {
  const { empresaId, rol } = useEmpresaActual();
  const [ingresos, setIngresos] = useState<IngresoUI[]>([]);
  const [egresos, setEgresos] = useState<EgresoUI[]>([]);
  const [intentos, setIntentos] = useState<IntentoImpresionUI[]>([]);
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
      const { desde, hasta } = obtenerRangoSerie(meses);
      const [ingresosRows, egresosRows, intentosRows] = await Promise.all([
        obtenerIngresos(empresaId, desde, hasta),
        obtenerEgresos(empresaId, desde, hasta),
        obtenerIntentosImpresion(empresaId, desde, hasta),
      ]);
      setIngresos(ingresosRows.map(mapIngresoDesdeDB));
      setEgresos(egresosRows.map(mapEgresoDesdeDB));
      setIntentos(intentosRows.map(mapIntentoImpresionDesdeDB));
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar la tendencia financiera");
    } finally {
      setLoading(false);
    }
  }, [empresaId, rol, meses]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const serie: MesFinancieroUI[] = useMemo(
    () => construirSerieMensual(meses, ingresos, egresos, intentos),
    [meses, ingresos, egresos, intentos],
  );

  const variacionMensual = useMemo(
    () => variacionMensualIngresos(serie),
    [serie],
  );

  const hayDatos = useMemo(
    () => serie.some((m) => m.ingresos > 0 || m.egresos > 0),
    [serie],
  );

  return { serie, variacionMensual, hayDatos, loading, error, refetch: cargar };
}
