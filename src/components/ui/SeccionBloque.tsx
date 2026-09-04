//src/components/ui/SeccionBloque.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  theme: any;
  children: React.ReactNode;
}

export function SeccionBloque({ titulo, icono, theme, children }: Props) {
  return (
    <View style={styles.bloque}>
      <View style={styles.header}>
        <Ionicons name={icono} size={16} color={theme.primary} />
        <Text style={[styles.titulo, { color: theme.textPrimary }]}>
          {titulo}
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: 8 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  titulo: { fontSize: 14.5, fontWeight: "700" },
  card: { borderRadius: 14, padding: 14, gap: 10 },
});
