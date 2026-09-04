//src/features/finanzas/components/InventarioFilamentoCard.tsx
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SeccionBloque } from "@/components/ui/SeccionBloque";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FilamentoStockUI } from "../types";

interface Props {
  theme: any;
  filamentos: FilamentoStockUI[];
}

export function InventarioFilamentoCard({ theme, filamentos }: Props) {
  return (
    <SeccionBloque
      titulo="Inventario de filamento"
      icono="layers-outline"
      theme={theme}
    >
      {filamentos.map((f) => {
        const pct = Math.round((f.gramosRestantes / f.gramosPorRollo) * 100);
        const bajo = pct <= 20;
        return (
          <View key={f.id} style={styles.fila}>
            <View style={styles.header}>
              <View style={[styles.dot, { backgroundColor: f.color }]} />
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                {f.nombre}
              </Text>
              <Text
                style={{
                  color: bajo ? "#EF4444" : theme.textSecondary,
                  fontWeight: bajo ? "800" : "500",
                  fontSize: 12,
                }}
              >
                {f.gramosRestantes} g
              </Text>
            </View>
            <ProgressBar
              porcentaje={pct}
              color={bajo ? "#EF4444" : "#22C55E"}
            />
          </View>
        );
      })}
    </SeccionBloque>
  );
}

const styles = StyleSheet.create({
  fila: { gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 12.5, fontWeight: "600", flex: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#00000022",
  },
});
