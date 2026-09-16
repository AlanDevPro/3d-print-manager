// src/components/ui/ListaErrores.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

interface ListaErroresProps {
  errores: ErrorCampo[];
  tono?: "danger" | "warning";
  containerStyle?: ViewStyle | ViewStyle[];
}

export function ListaErrores({
  errores,
  tono = "danger",
  containerStyle,
}: ListaErroresProps) {
  const { theme } = useTheme();

  if (!errores || errores.length === 0) return null;

  const color = tono === "danger" ? theme.danger : "#D97706";
  const fondo =
    tono === "danger" ? "rgba(239, 68, 68, 0.08)" : "rgba(217, 119, 6, 0.10)";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: fondo, borderColor: `${color}33` },
        containerStyle,
      ]}
    >
      {errores.map((e) => (
        <View key={e.campo} style={styles.row}>
          <Ionicons name="close-circle" size={14} color={color} />
          <Text style={[styles.text, { color: theme.textPrimary }]}>
            {e.mensaje}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
});
