//src/components/ui/StatCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  label: string;
  valor: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  destacado?: boolean;
}

export function StatCard({
  theme,
  label,
  valor,
  icono,
  color,
  destacado,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSecondary },
        destacado && { borderWidth: 1.5, borderColor: color },
      ]}
    >
      <View style={[styles.icono, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icono} size={16} color={color} />
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[styles.valor, { color: destacado ? color : theme.textPrimary }]}
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "47.5%", borderRadius: 14, padding: 12, gap: 6 },
  icono: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 11.5 },
  valor: { fontSize: 16.5, fontWeight: "800" },
});
