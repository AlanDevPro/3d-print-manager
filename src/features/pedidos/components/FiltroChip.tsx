// src/features/pedidos/components/FiltroChip.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FiltroChipProps {
  label: string;
  activo: boolean;
  color: string;
  theme: any;
  icono?: keyof typeof Ionicons.glyphMap; // Icono opcional
  onPress: () => void;
}

export function FiltroChip({
  label,
  activo,
  color,
  theme,
  icono,
  onPress,
}: FiltroChipProps) {
  const iconColor = activo ? "#FFF" : theme.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: activo ? color : theme.bgSecondary,
          borderColor: activo ? color : "transparent",
        },
      ]}
    >
      {icono && <Ionicons name={icono} size={14} color={iconColor} />}
      <Text
        style={[
          styles.chipLabel,
          { color: iconColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 12, fontWeight: "700" },
});