// src/features/dashboard/hooks/useDashboardData.ts
import { useEmpresa } from "@/context/EmpresaContext";
import { useCallback, useEffect, useState } from "react";
import {
  mapCotizacionToUI,
  mapImpresoraToUI,
  mapProductoToUI,
} from "../mappers/dashboardMapper";
import {
  fetchCatalogoProductos,
  fetchCotizacionesPendientes,
  fetchImpresoras,
  fetchIngresosDelMes,
} from "../services/dashboardService";
import { CotizacionUI, DashboardKpis, ImpresoraUI, ModeloUI } from "../types";

type EstadoDashboard = {
  loading: boolean;
  error: string | null;
  impresoras: ImpresoraUI[];
  cotizacionesPendientes: CotizacionUI[];
  catalogo: ModeloUI[];
  kpis: DashboardKpis;
};

const ESTADO_INICIAL: EstadoDashboard = {
  loading: true,
  error: null,
  impresoras: [],
  cotizacionesPendientes: [],
  catalogo: [],
  kpis: {
    cotizacionesPendientes: 0,
    ingresosMes: 0,
    impresorasEnUso: 0,
    impresorasTotal: 0,
  },
};

export function useDashboardData() {
  const { empresa } = useEmpresa();
  const [estado, setEstado] = useState<EstadoDashboard>(ESTADO_INICIAL);

  const cargar = useCallback(async () => {
    if (!empresa?.id) return;
    setEstado((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [impresorasRaw, pendientesRaw, ingresos, catalogoRaw] =
        await Promise.all([
          fetchImpresoras(empresa.id),
          fetchCotizacionesPendientes(empresa.id),
          fetchIngresosDelMes(empresa.id),
          fetchCatalogoProductos(empresa.id),
        ]);

      const impresoras = impresorasRaw.map(mapImpresoraToUI);

      setEstado({
        loading: false,
        error: null,
        impresoras,
        cotizacionesPendientes: pendientesRaw.map(mapCotizacionToUI),
        catalogo: catalogoRaw.map(mapProductoToUI),
        kpis: {
          cotizacionesPendientes: pendientesRaw.length,
          ingresosMes: ingresos.total,
          impresorasEnUso: impresoras.filter((i) => i.activa && i.enUso).length,
          impresorasTotal: impresoras.length,
        },
      });
    } catch (err) {
      setEstado((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Error al cargar el panel",
      }));
    }
  }, [empresa?.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ...estado, refetch: cargar };
}
