//src/features/finanzas/components/PeriodoSelector.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Periodo } from "../types";

interface Props {
  theme: any;
  periodo: Periodo;
  onCambiar: (p: Periodo) => void;
}

export function PeriodoSelector({ theme, periodo, onCambiar }: Props) {
  return (
    <View style={[styles.row, { backgroundColor: theme.bgSecondary }]}>
      {(["semana", "mes"] as Periodo[]).map((p) => (
        <TouchableOpacity
          key={p}
          style={[
            styles.btn,
            periodo === p && { backgroundColor: theme.bgPrimary },
          ]}
          onPress={() => onCambiar(p)}
        >
          <Text
            style={{
              color: periodo === p ? theme.primary : theme.textSecondary,
              fontSize: 12.5,
              fontWeight: periodo === p ? "700" : "500",
            }}
          >
            {p === "semana" ? "Esta semana" : "Este mes"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderRadius: 12, padding: 4 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
});
