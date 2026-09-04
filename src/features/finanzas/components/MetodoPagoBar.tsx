//src/features/finanzas/components/MetodoPagoBar.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MetodoPago } from "../types";

const METODO_CFG: Record<MetodoPago, { label: string; color: string }> = {
  efectivo: { label: "Efectivo", color: "#22C55E" },
  qr: { label: "QR", color: "#3B82F6" },
  transferencia: { label: "Transferencia", color: "#8B5CF6" },
};

interface Props {
  theme: any;
  porMetodo: Record<MetodoPago, number>;
  total: number;
}

export function MetodoPagoBar({ theme, porMetodo, total }: Props) {
  const metodos = (Object.keys(METODO_CFG) as MetodoPago[]).filter(
    (m) => porMetodo[m] > 0,
  );

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.barra}>
        {metodos.map((m) => (
          <View
            key={m}
            style={{
              width: `${total > 0 ? (porMetodo[m] / total) * 100 : 0}%`,
              backgroundColor: METODO_CFG[m].color,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 6 }}>
        {metodos.map((m) => (
          <View key={m} style={styles.item}>
            <View
              style={[styles.dot, { backgroundColor: METODO_CFG[m].color }]}
            />
            <Text
              style={{
                color: theme.textPrimary,
                fontSize: 12.5,
                fontWeight: "600",
              }}
            >
              {METODO_CFG[m].label} · Bs {porMetodo[m].toFixed(2)} (
              {total > 0 ? Math.round((porMetodo[m] / total) * 100) : 0}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  item: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
