// src/components/ui/EmptyState.tsx
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { theme } = useTheme();

  // Opción A: Proteger con Optional Chaining + Color de respaldo (Fallback)
  const colorTextoSecundario = theme?.textSecondary ?? "#6B7280";
  const colorTextoPrimario = theme?.textPrimary ?? "#111827";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colorTextoPrimario }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colorTextoSecundario }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
