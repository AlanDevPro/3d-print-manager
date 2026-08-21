import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  icono: keyof typeof Ionicons.glyphMap;
  mensaje: string;
}

export const EmptyState = ({ icono, mensaje }: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <Ionicons name={icono} size={22} color={theme.textMuted} />
      <Text style={[styles.texto, { color: theme.textSecondary }]}>
        {mensaje}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  texto: {
    fontSize: 13,
    fontWeight: "500",
  },
});
