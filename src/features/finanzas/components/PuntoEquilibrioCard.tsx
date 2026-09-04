//src/features/finanzas/components/PuntoEquilibrioCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  alcanzado: boolean;
  falta: number;
}

export function PuntoEquilibrioCard({ theme, alcanzado, falta }: Props) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: alcanzado ? "#22C55E17" : theme.bgSecondary,
          borderColor: alcanzado ? "#22C55E40" : "transparent",
          borderWidth: alcanzado ? 1 : 0,
        },
      ]}
    >
      <Ionicons
        name={alcanzado ? "checkmark-circle" : "flag-outline"}
        size={20}
        color={alcanzado ? "#22C55E" : theme.primary}
      />
      <Text style={[styles.texto, { color: theme.textPrimary }]}>
        {alcanzado
          ? "Ya cubriste tus egresos del mes. Lo que sigue es utilidad."
          : `Te faltan Bs ${falta.toFixed(2)} en ventas para cubrir tus egresos del mes.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 13,
  },
  texto: { flex: 1, fontSize: 12.5, fontWeight: "600" },
});
