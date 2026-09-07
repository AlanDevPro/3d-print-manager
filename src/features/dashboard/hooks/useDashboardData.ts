// src/features/dashboard/hooks/useDashboardData.ts
import { useEmpresa } from "@/context/EmpresaContext";
import { supabase } from "@/services/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

type DashboardDataResponse = {
  impresoras: ImpresoraUI[];
  cotizacionesPendientes: CotizacionUI[];
  catalogo: ModeloUI[];
  kpis: DashboardKpis;
};

export function useDashboardData() {
  const { empresa } = useEmpresa();
  const queryClient = useQueryClient();
  const empresaId = empresa?.id;

  // Fetching unificado mediante TanStack Query
  const { data, isLoading, isFetching, error, refetch } = useQuery<DashboardDataResponse>({
    queryKey: ["dashboardData", empresaId],
    queryFn: async () => {
      if (!empresaId) {
        return {
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
      }

      const [impresorasRaw, pendientesRaw, ingresos, catalogoRaw] =
        await Promise.all([
          fetchImpresoras(empresaId),
          fetchCotizacionesPendientes(empresaId),
          fetchIngresosDelMes(empresaId),
          fetchCatalogoProductos(empresaId),
        ]);

      const impresoras = impresorasRaw.map(mapImpresoraToUI);

      return {
        impresoras,
        cotizacionesPendientes: pendientesRaw.map(mapCotizacionToUI),
        catalogo: catalogoRaw.map(mapProductoToUI),
        kpis: {
          cotizacionesPendientes: pendientesRaw.length,
          ingresosMes: ingresos.total,
          impresorasEnUso: impresoras.filter((i) => i.activa && i.enUso).length,
          impresorasTotal: impresoras.length,
        },
      };
    },
    enabled: !!empresaId,
  });

  // Suscripción en tiempo real a cambios en la base de datos Supabase
  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel(`dashboard-realtime-${empresaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", empresaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, queryClient]);

  return {
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    error: error instanceof Error ? error.message : null,
    impresoras: data?.impresoras ?? [],
    cotizacionesPendientes: data?.cotizacionesPendientes ?? [],
    catalogo: data?.catalogo ?? [],
    kpis: data?.kpis ?? {
      cotizacionesPendientes: 0,
      ingresosMes: 0,
      impresorasEnUso: 0,
      impresorasTotal: 0,
    },
    refetch,
  };
}