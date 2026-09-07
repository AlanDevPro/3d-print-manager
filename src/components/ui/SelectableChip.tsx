// src/components/ui/SelectableChip.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  showIcon?: boolean;
}

export function SelectableChip({ label, selected, onPress, showIcon = false }: SelectableChipProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.bgSurface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          size={16}
          color={selected ? "#FFFFFF" : theme.textMuted}
        />
      )}
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : theme.textPrimary, fontWeight: selected ? "700" : "500" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
});