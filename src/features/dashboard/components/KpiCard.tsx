// src/features/dashboard/components/KpiCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  valor: string;
  label: string;
};

export function KpiCard({ theme, icono, iconColor, valor, label }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "1A" }]}>
        <Ionicons name={icono} size={16} color={iconColor} />
      </View>
      <Text style={[styles.valor, { color: theme.textPrimary }]}>{valor}</Text>
      <Text
        style={[styles.label, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 140, borderRadius: 16, padding: 12, gap: 6 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  valor: { fontSize: 18, fontWeight: "800" },
  label: { fontSize: 11, lineHeight: 14 },
});
