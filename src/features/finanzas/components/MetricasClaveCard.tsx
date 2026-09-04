//src/features/finanzas/components/MetricasClaveCard.tsx
import { SeccionBloque } from "@/components/ui/SeccionBloque";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  costoPromedioGramo: number;
  margenMedio: number;
  gramosImpresos: number;
  ticketPromedio: number;
}

export function MetricasClaveCard({
  theme,
  costoPromedioGramo,
  margenMedio,
  gramosImpresos,
  ticketPromedio,
}: Props) {
  return (
    <SeccionBloque
      titulo="Métricas clave"
      icono="analytics-outline"
      theme={theme}
    >
      <View style={styles.grid}>
        <Metrica
          theme={theme}
          label="Costo promedio por gramo"
          valor={`Bs ${costoPromedioGramo.toFixed(3)}`}
        />
        <Metrica
          theme={theme}
          label="Margen medio"
          valor={`${margenMedio.toFixed(1)}%`}
          destacado={margenMedio >= 0}
        />
        <Metrica
          theme={theme}
          label="Gramos impresos (mes)"
          valor={`${gramosImpresos.toLocaleString()} g`}
        />
        <Metrica
          theme={theme}
          label="Ticket promedio"
          valor={`Bs ${ticketPromedio.toFixed(2)}`}
        />
      </View>
    </SeccionBloque>
  );
}

function Metrica({
  theme,
  label,
  valor,
  destacado,
}: {
  theme: any;
  label: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <View style={[styles.item, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.valor,
          { color: destacado ? theme.primary : theme.textPrimary },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item: { width: "47%", borderRadius: 10, padding: 10, gap: 4 },
  label: { fontSize: 10.5 },
  valor: { fontSize: 15, fontWeight: "800" },
});
