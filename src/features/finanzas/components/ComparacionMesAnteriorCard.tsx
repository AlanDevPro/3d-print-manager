//src/features/finanzas/components/ComparacionMesAnteriorCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  variacion: number;
}

export function ComparacionMesAnteriorCard({ theme, variacion }: Props) {
  const positivo = variacion >= 0;
  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        Vs. mes anterior
      </Text>
      <View style={styles.row}>
        <Ionicons
          name={positivo ? "arrow-up-circle" : "arrow-down-circle"}
          size={18}
          color={positivo ? "#22C55E" : "#EF4444"}
        />
        <Text
          style={[styles.valor, { color: positivo ? "#22C55E" : "#EF4444" }]}
        >
          {positivo ? "+" : ""}
          {variacion.toFixed(1)}%
        </Text>
      </View>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>
        en ingresos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, padding: 12, gap: 6 },
  label: { fontSize: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  valor: { fontSize: 16, fontWeight: "800" },
  sub: { fontSize: 10.5 },
});
