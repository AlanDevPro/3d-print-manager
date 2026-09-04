// src/features/pedidos/components/modal/FilaDetalle.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FilaDetalleProps {
  theme: any;
  label: string;
  valor: string | number;
  icono?: keyof typeof Ionicons.glyphMap; // <-- Agrega esta línea
  destacado?: boolean;
}

export function FilaDetalle({
  theme,
  label,
  valor,
  icono, // <-- Recíbela aquí
  destacado,
}: FilaDetalleProps) {
  return (
    <View style={styles.fila}>
      <View style={styles.labelRow}>
        {icono && (
          <Ionicons name={icono} size={14} color={theme.textSecondary} />
        )}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.valor,
          { color: destacado ? "#EF4444" : theme.textPrimary },
          destacado && styles.valorDestacado,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: { fontSize: 13 },
  valor: { fontSize: 13, fontWeight: "600" },
  valorDestacado: { fontWeight: "800" },
});