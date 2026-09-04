//src/features/finanzas/components/AlertaStockBajoBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FilamentoStockUI } from "../types";

interface Props {
  theme: any;
  filamentos: FilamentoStockUI[];
}

export function AlertaStockBajoBanner({ theme, filamentos }: Props) {
  if (filamentos.length === 0) return null;
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: "#EF444417", borderColor: "#EF444440" },
      ]}
    >
      <Ionicons name="warning-outline" size={18} color="#EF4444" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.titulo, { color: "#EF4444" }]}>
          Stock bajo de filamento
        </Text>
        <Text style={[styles.texto, { color: theme.textSecondary }]}>
          {filamentos.map((f) => f.nombre).join(" · ")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  titulo: { fontSize: 12.5, fontWeight: "800", marginBottom: 2 },
  texto: { fontSize: 11.5 },
});
