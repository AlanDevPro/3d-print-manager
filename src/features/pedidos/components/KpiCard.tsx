// src/features/pedidos/components/KpiCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface KpiCardProps {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  valor: string;
  label: string;
}

export function KpiCard({
  theme,
  icono,
  iconColor,
  valor,
  label,
}: KpiCardProps) {
  return (
    <View style={[styles.kpiCard, { backgroundColor: theme.bgSecondary }]}>
      <View style={[styles.kpiIconWrap, { backgroundColor: iconColor + "1A" }]}>
        <Ionicons name={icono} size={16} color={iconColor} />
      </View>
      <Text style={[styles.kpiValor, { color: theme.textPrimary }]}>
        {valor}
      </Text>
      <Text
        style={[styles.kpiLabel, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kpiCard: { width: 128, borderRadius: 16, padding: 12, gap: 6 },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiValor: { fontSize: 16, fontWeight: "800" },
  kpiLabel: { fontSize: 10.5, lineHeight: 13 },
});
