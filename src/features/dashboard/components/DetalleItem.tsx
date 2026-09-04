// src/features/dashboard/components/DetalleItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  destacado?: boolean;
};

export function DetalleItem({ theme, icono, label, valor, destacado }: Props) {
  return (
    <View style={[styles.item, { backgroundColor: theme.bgSecondary }]}>
      <Ionicons
        name={icono}
        size={16}
        color={destacado ? theme.primary : theme.textSecondary}
      />
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
  item: { width: "47%", borderRadius: 12, padding: 10, gap: 4 },
  label: { fontSize: 11 },
  valor: { fontSize: 15, fontWeight: "700" },
});
