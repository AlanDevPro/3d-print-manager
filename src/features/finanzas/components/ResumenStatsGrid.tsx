//src/features/finanzas/components/ResumenStatsGrid.tsx
import { StatCard } from "@/components/ui/StatCard";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ResumenFinancieroUI } from "../types";

interface Props {
  theme: any;
  resumen: ResumenFinancieroUI;
}

export function ResumenStatsGrid({ theme, resumen }: Props) {
  return (
    <View style={styles.grid}>
      <StatCard
        theme={theme}
        label="Cobrado"
        valor={`Bs ${resumen.totalIngresos.toFixed(2)}`}
        icono="trending-up"
        color="#22C55E"
      />
      <StatCard
        theme={theme}
        label="Cobros pendientes"
        valor={`Bs ${resumen.cobrosPendientes.toFixed(2)}`}
        icono="time-outline"
        color="#F59E0B"
      />
      <StatCard
        theme={theme}
        label="Egresos"
        valor={`Bs ${resumen.totalEgresos.toFixed(2)}`}
        icono="trending-down"
        color="#EF4444"
      />
      <StatCard
        theme={theme}
        label="Utilidad neta"
        valor={`Bs ${resumen.utilidadNeta.toFixed(2)}`}
        icono="wallet-outline"
        color={resumen.utilidadNeta >= 0 ? theme.primary : "#EF4444"}
        destacado
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
