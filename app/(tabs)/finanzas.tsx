// app/(tabs)/finanzas.tsx
import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useFilamentosBajoStock } from "@/features/finanzas/hooks/useFilamentosBajoStock";
import { useFinanzasResumen } from "@/features/finanzas/hooks/useFinanzasResumen";
import { useMetaMensual } from "@/features/finanzas/hooks/useMetaMensual";
import { useRankingClientes } from "@/features/finanzas/hooks/useRankingClientes";
import { useRankingProductos } from "@/features/finanzas/hooks/useRankingProductos";
import { useTendenciaFinanciera } from "@/features/finanzas/hooks/useTendenciaFinanciera";
import { Periodo } from "@/features/finanzas/types";
import { puedeVerFinanzas } from "@/features/finanzas/utils/finanzasAcceso";
import {
  calcularMargenMedio,
  calcularProgresoMeta,
  calcularPuntoEquilibrio,
} from "@/features/finanzas/utils/finanzasCalculos";

import { SeccionBloque } from "@/components/ui/SeccionBloque";
import { AlertaStockBajoBanner } from "@/features/finanzas/components/AlertaStockBajoBanner";
import { ComparacionMesAnteriorCard } from "@/features/finanzas/components/ComparacionMesAnteriorCard";
import { EgresosPorCategoriaCard } from "@/features/finanzas/components/EgresosPorCategoriaCard";
import {
  FinanzasTab,
  FinanzasTabs,
} from "@/features/finanzas/components/FinanzasTabs";
import { GraficoIngresosEgresos } from "@/features/finanzas/components/GraficoIngresosEgresos";
import { InventarioFilamentoCard } from "@/features/finanzas/components/InventarioFilamentoCard";
import { ListaMovimientos } from "@/features/finanzas/components/ListaMovimientos";
import { MetaMensualCard } from "@/features/finanzas/components/MetaMensualCard";
import { MetodoPagoBar } from "@/features/finanzas/components/MetodoPagoBar";
import { MetricasClaveCard } from "@/features/finanzas/components/MetricasClaveCard";
import { PeriodoSelector } from "@/features/finanzas/components/PeriodoSelector";
import { PuntoEquilibrioCard } from "@/features/finanzas/components/PuntoEquilibrioCard";
import { RankingClientesCard } from "@/features/finanzas/components/RankingClientesCard";
import { RankingProductosCard } from "@/features/finanzas/components/RankingProductosCard";
import { ResumenStatsGrid } from "@/features/finanzas/components/ResumenStatsGrid";

// TODO: reemplazar por consulta real cuando tengas registro de gramos impresos
const GRAMOS_IMPRESOS_MES = 4200;

export default function FinanzasScreen() {
  const { theme } = useTheme();
  const { rol, cargando: cargandoEmpresa } = useEmpresaActual();
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [tab, setTab] = useState<FinanzasTab>("resumen");

  const { ingresos, egresos, resumen } = useFinanzasResumen(periodo);
  const { tendencia, variacionMensual } = useTendenciaFinanciera();
  const { productos } = useRankingProductos(5);
  const { clientes } = useRankingClientes(4);
  const { meta } = useMetaMensual();
  const { filamentos, filamentosBajoStock } = useFilamentosBajoStock();

  const progresoMeta = calcularProgresoMeta(resumen.totalIngresos, meta);
  const { falta, alcanzado } = calcularPuntoEquilibrio(
    resumen.totalIngresos,
    resumen.totalEgresos,
  );
  const margenMedio = calcularMargenMedio(
    resumen.utilidadNeta,
    resumen.totalIngresos,
  );
  const costoPromedioGramo =
    GRAMOS_IMPRESOS_MES > 0 ? resumen.totalEgresos / GRAMOS_IMPRESOS_MES : 0;

  if (cargandoEmpresa) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bgPrimary }]}>
        <View style={styles.centrado} />
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
      >
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Finanzas
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Salud económica de tu taller
          </Text>
        </View>

        <AlertaStockBajoBanner theme={theme} filamentos={filamentosBajoStock} />

        <PeriodoSelector
          theme={theme}
          periodo={periodo}
          onCambiar={setPeriodo}
        />

        <ResumenStatsGrid theme={theme} resumen={resumen} />

        <View style={styles.dobleCardRow}>
          <ComparacionMesAnteriorCard
            theme={theme}
            variacion={variacionMensual}
          />
          <MetaMensualCard
            theme={theme}
            totalIngresos={resumen.totalIngresos}
            meta={meta}
            progreso={progresoMeta}
          />
        </View>

        <PuntoEquilibrioCard
          theme={theme}
          alcanzado={alcanzado}
          falta={falta}
        />

        <FinanzasTabs theme={theme} tab={tab} onCambiar={setTab} />

        {tab === "resumen" && (
          <>
            <SeccionBloque
              titulo="Ingresos vs. Egresos — últimos 6 meses"
              icono="bar-chart-outline"
              theme={theme}
            >
              <GraficoIngresosEgresos theme={theme} tendencia={tendencia} />
            </SeccionBloque>

            <SeccionBloque
              titulo="Ingresos por método de pago"
              icono="card-outline"
              theme={theme}
            >
              <MetodoPagoBar
                theme={theme}
                porMetodo={resumen.porMetodoIngresos}
                total={resumen.totalIngresos}
              />
            </SeccionBloque>

            <RankingProductosCard theme={theme} productos={productos} />
            <RankingClientesCard theme={theme} clientes={clientes} />
            <EgresosPorCategoriaCard
              theme={theme}
              porCategoria={resumen.porCategoriaEgresos}
              totalEgresos={resumen.totalEgresos}
            />
            <InventarioFilamentoCard theme={theme} filamentos={filamentos} />
            <MetricasClaveCard
              theme={theme}
              costoPromedioGramo={costoPromedioGramo}
              margenMedio={margenMedio}
              gramosImpresos={GRAMOS_IMPRESOS_MES}
              ticketPromedio={resumen.ticketPromedio}
            />
          </>
        )}

        {tab === "ingresos" && (
          <ListaMovimientos
            theme={theme}
            tipo="ingreso"
            movimientos={ingresos}
          />
        )}
        {tab === "egresos" && (
          <ListaMovimientos theme={theme} tipo="egreso" movimientos={egresos} />
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
