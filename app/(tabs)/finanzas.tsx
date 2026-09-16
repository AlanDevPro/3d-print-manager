// app/(tabs)/finanzas.tsx
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useTheme } from "@/hooks/useTheme";

import { useConfiguracionEmpresa } from "@/features/finanzas/hooks/useConfiguracionEmpresa";
import { useFinanzasResumen } from "@/features/finanzas/hooks/useFinanzasResumen";
import { useMetaMensual } from "@/features/finanzas/hooks/useMetaMensual";
import { useRankingProductos } from "@/features/finanzas/hooks/useRankingProductos";
import { useSerieMensual } from "@/features/finanzas/hooks/useSerieMensual";

import { LABEL_PERIODO } from "@/features/finanzas/constantes";
import { Periodo } from "@/features/finanzas/types";
import { puedeVerFinanzas } from "@/features/finanzas/utils/finanzasAcceso";
import {
  calcularCostoPorGramo,
  calcularProgresoMeta,
  calcularPuntoEquilibrio,
} from "@/features/finanzas/utils/finanzasCalculos";

import {
  FinanzasTab,
  FinanzasTabs,
} from "@/features/finanzas/components/FinanzasTabs";
import EgresosDonutChart from "@/features/finanzas/components/graficos/EgresosDonutChart";
import IngresosEgresosChart from "@/features/finanzas/components/graficos/IngresosEgresosChart";
import KPICardsGrid from "@/features/finanzas/components/graficos/KPICardsGrid";
import ParetoProductosChart from "@/features/finanzas/components/graficos/ParetoProductosChart";
import { MetodoPagoBar } from "@/features/finanzas/components/MetodoPagoBar";
import { MetricasClaveCard } from "@/features/finanzas/components/MetricasClaveCard";
import { MovimientosPeriodoView } from "@/features/finanzas/components/Movimientosperiodoview";
import { PeriodoSelector } from "@/features/finanzas/components/PeriodoSelector";
import { PuntoEquilibrioCard } from "@/features/finanzas/components/PuntoEquilibrioCard";

export default function FinanzasScreen() {
  const { theme } = useTheme();
  const { rol, cargando: cargandoEmpresa } = useEmpresaActual();
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [tab, setTab] = useState<FinanzasTab>("resumen");

  const { moneda } = useConfiguracionEmpresa();
  const {
    ingresos,
    egresos,
    resumen,
    categoriasEgreso,
    produccion,
    loading: cargandoResumen,
    refetch: recargarResumen,
  } = useFinanzasResumen(periodo);
  const {
    serie,
    variacionMensual,
    loading: cargandoSerie,
    refetch: recargarSerie,
  } = useSerieMensual();
  const { meta, refetch: recargarMeta } = useMetaMensual();
  const {
    pareto,
    loading: cargandoPareto,
    refetch: recargarPareto,
  } = useRankingProductos(periodo);

  const progresoMeta = calcularProgresoMeta(resumen.totalIngresos, meta);
  const { falta, alcanzado } = calcularPuntoEquilibrio(
    resumen.totalIngresos,
    resumen.totalEgresos,
  );
  const costoPromedioGramo = calcularCostoPorGramo(
    resumen.totalEgresos,
    produccion.gramos,
  );

  const subtituloPareto = useMemo(
    () =>
      `Ingresos por producto · ${LABEL_PERIODO[periodo].toLowerCase()} actual`,
    [periodo],
  );

  const refrescando = cargandoResumen || cargandoSerie;
  const recargarTodo = () => {
    recargarResumen();
    recargarSerie();
    recargarMeta();
    recargarPareto();
  };

  if (cargandoEmpresa) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bgPrimary }]}>
        <View style={styles.centrado}>
          <ActivityIndicator color={theme.textSecondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!puedeVerFinanzas(rol)) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
        edges={["top"]}
      >
        <View style={styles.centrado}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Acceso restringido
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Solo administradores y empleados de la empresa pueden ver las
            finanzas.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={recargarTodo} />
        }
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Finanzas
        </Text>

        {/* --- KPIs mensuales (siempre sobre los últimos meses cerrados) --- */}
        <KPICardsGrid serie={serie} moneda={moneda} cargando={cargandoSerie} />
        <MetricasClaveCard
          theme={theme}
          costoPromedioGramo={costoPromedioGramo}
          margenMedio={resumen.margenPct}
          gramosImpresos={produccion.gramos}
          ticketPromedio={resumen.ticketPromedio}
        />

        <PuntoEquilibrioCard
          theme={theme}
          alcanzado={alcanzado}
          falta={falta}
        />

        <IngresosEgresosChart
          serie={serie}
          moneda={moneda}
          cargando={cargandoSerie}
        />

        {/* --- SELECTOR DE PERÍODO (Semana / Mes) --- */}
        <PeriodoSelector
          theme={theme}
          periodo={periodo}
          onCambiar={setPeriodo}
        />

        {/* --- PESTAÑAS (Resumen / Ingresos / Egresos) --- */}
        <FinanzasTabs theme={theme} tab={tab} onCambiar={setTab} />

        {tab === "resumen" && (
          <>
            <MetodoPagoBar
              theme={theme}
              porMetodo={resumen.porMetodoIngresos}
              total={resumen.totalIngresos}
            />

            <ParetoProductosChart
              pareto={pareto}
              moneda={moneda}
              subtitulo={subtituloPareto}
              cargando={cargandoPareto}
            />

            <EgresosDonutChart
              categorias={categoriasEgreso}
              moneda={moneda}
              cargando={cargandoResumen}
            />
          </>
        )}

        {/*
          Ingresos/Egresos ahora usan MovimientosPeriodoView:
          - periodo === "semana": selector de días lun-dom, muestra el día actual por defecto
          - periodo === "mes": selector de 6 meses (íconos), con modal de calendario para
            filtrar por un día puntual de ese mes
          En ambos casos, la lista se pagina de 10 en 10 con pestañas numeradas.
        */}
        {tab === "ingresos" && (
          <MovimientosPeriodoView
            theme={theme}
            tipo="ingreso"
            periodo={periodo}
            movimientosSemanaActual={ingresos}
            cargandoSemana={cargandoResumen}
          />
        )}

        {tab === "egresos" && (
          <MovimientosPeriodoView
            theme={theme}
            tipo="egreso"
            periodo={periodo}
            movimientosSemanaActual={egresos}
            cargandoSemana={cargandoResumen}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2, textAlign: "center" },
  dobleCardRow: { flexDirection: "row", gap: 10 },
});
