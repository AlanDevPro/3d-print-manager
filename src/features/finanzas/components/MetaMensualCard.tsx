//src/features/finanzas/components/MetaMensualCard.tsx
import { ProgressBar } from "@/components/ui/ProgressBar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  totalIngresos: number;
  meta: number;
  progreso: number;
}

export function MetaMensualCard({
  theme,
  totalIngresos,
  meta,
  progreso,
}: Props) {
  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        Meta del mes
      </Text>
      <Text style={[styles.monto, { color: theme.textPrimary }]}>
        Bs {totalIngresos.toFixed(0)} / {meta || "—"}
      </Text>
      <ProgressBar
        porcentaje={progreso}
        color={progreso >= 100 ? "#22C55E" : theme.primary}
        height={6 as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, padding: 12, gap: 6 },
  label: { fontSize: 11 },
  monto: { fontSize: 13.5, fontWeight: "800" },
});
