// src/components/ui/PasoBadge.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface PasoBadgeProps {
  numero: number;
  titulo: string;
  completo: boolean;
  bloqueado: boolean;
  icono?: keyof typeof Ionicons.glyphMap;
}

export function PasoBadge({
  numero,
  titulo,
  completo,
  bloqueado,
  icono = "ellipse-outline",
}: PasoBadgeProps) {
  const { theme } = useTheme();

  const color = bloqueado
    ? theme.textSecondary
    : completo
      ? "#16A34A"
      : theme.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: `${color}1F` }]}>
        {completo ? (
          <Ionicons name="checkmark" size={13} color={color} />
        ) : (
          <Text style={[styles.numero, { color }]}>{numero}</Text>
        )}
      </View>
      <Ionicons name={icono} size={16} color={color} />
      <Text style={[styles.titulo, { color: theme.textPrimary }]}>
        {titulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  bubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  numero: { fontSize: 11, fontWeight: "800" },
  titulo: { fontSize: 14, fontWeight: "700" },
});
