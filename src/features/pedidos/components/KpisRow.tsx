// src/features/pedidos/components/KpisRow.tsx
// "Estado del taller" — los 4 números que se necesitan ver de un vistazo.
// Reutilizable: si mañana quieres estos mismos KPIs en el Dashboard,
// importa este componente ahí también.

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { formatBs } from "../utils/formato";
import { KpiCard } from "./KpiCard";

interface KpisRowProps {
  theme: any;
  kpis: {
    activos: number;
    cobroPendiente: number;
    entregasHoy: number;
    vencidos: number;
  };
}

export function KpisRow({ theme, kpis }: KpisRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.kpiScroll}
    >
      <KpiCard
        theme={theme}
        icono="albums-outline"
        iconColor="#3B82F6"
        valor={String(kpis.activos)}
        label="Pedidos activos"
      />
      <KpiCard
        theme={theme}
        icono="cash-outline"
        iconColor="#EF4444"
        valor={formatBs(kpis.cobroPendiente)}
        label="Por cobrar"
      />
      <KpiCard
        theme={theme}
        icono="calendar-outline"
        iconColor="#F59E0B"
        valor={String(kpis.entregasHoy)}
        label="Entregas hoy"
      />
      <KpiCard
        theme={theme}
        icono="alert-circle-outline"
        iconColor="#EF4444"
        valor={String(kpis.vencidos)}
        label="Entregas vencidas"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kpiScroll: { gap: 10, paddingRight: 16 },
});
