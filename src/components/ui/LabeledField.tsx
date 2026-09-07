// src/components/ui/LabeledField.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface LabeledFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  unit?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  containerStyle?: ViewStyle | ViewStyle[];
  surface?: "primary" | "surface"; // fondo del input container
}

export function LabeledField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = "default",
  maxLength,
  containerStyle,
  surface = "surface",
}: LabeledFieldProps) {
  const { theme } = useTheme();
  const bg = surface === "primary" ? theme.bgPrimary : theme.bgSurface;

  return (
    <View style={containerStyle}>
      {label ? (
        <View style={styles.labelGroup}>
          <Ionicons name={icon} size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        </View>
      ) : null}
      <View style={[styles.inputContainer, { backgroundColor: bg, borderColor: theme.border }]}>
        <TextInput
          style={[styles.inputField, { color: theme.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {unit && <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelGroup: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  inputField: { flex: 1, paddingVertical: 10, fontSize: 14 },
  unitBadge: { fontSize: 13, fontWeight: "700", marginLeft: 6, opacity: 0.8 },
});