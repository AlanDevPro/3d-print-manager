// src/features/dashboard/components/ImpresoraChip.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    COLOR_INACTIVA,
    COLOR_LIBRE,
    COLOR_OCUPADA,
} from "../constants/colors";
import { ImpresoraUI } from "../types";

type Props = { impresora: ImpresoraUI; theme: any };

export function ImpresoraChip({ impresora, theme }: Props) {
  const color = !impresora.activa
    ? COLOR_INACTIVA
    : impresora.enUso
      ? COLOR_OCUPADA
      : COLOR_LIBRE;
  const estadoTexto = !impresora.activa
    ? "Apagada"
    : impresora.enUso
      ? "Imprimiendo"
      : "Libre";

  return (
    <View style={[styles.chip, { backgroundColor: theme.bgSecondary }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View>
        <Text
          style={[styles.nombre, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {impresora.nombre}
        </Text>
        <Text style={[styles.estado, { color }]}>{estadoTexto}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 130,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nombre: { fontSize: 12, fontWeight: "700" },
  estado: { fontSize: 10.5, fontWeight: "600", marginTop: 1 },
});
