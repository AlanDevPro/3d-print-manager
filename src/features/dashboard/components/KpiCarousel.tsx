// src/features/dashboard/components/KpiCarousel.tsx
import { formatBs } from "@/utils/format";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { COLOR_ALERTA, COLOR_LIBRE, COLOR_OCUPADA } from "../constants/colors";
import { DashboardKpis } from "../types";
import { KpiCard } from "./KpiCard";

type Props = { theme: any; kpis: DashboardKpis };

export function KpiCarousel({ theme, kpis }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <KpiCard
        theme={theme}
        icono="document-text-outline"
        iconColor={COLOR_ALERTA}
        valor={String(kpis.cotizacionesPendientes)}
        label="Cotizaciones pendientes"
      />
      <KpiCard
        theme={theme}
        icono="cash-outline"
        iconColor={COLOR_LIBRE}
        valor={formatBs(kpis.ingresosMes)}
        label="Ingresos del mes"
      />
      <KpiCard
        theme={theme}
        icono="flash-outline"
        iconColor={COLOR_OCUPADA}
        valor={`${kpis.impresorasEnUso}/${kpis.impresorasTotal}`}
        label="Impresoras imprimiendo"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 10, paddingRight: 16 },
});
