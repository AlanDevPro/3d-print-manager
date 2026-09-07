// src/features/cotizacion/components/resumen/EstadisticasPiezaRow.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { formatTiempo } from "@/features/cotizacion/utils/formatters";

interface EstadisticasPiezaRowProps {
  pesoGramos: string | number;
  tiempoHoras?: number;
  tiempoMinutos?: number;
  compact?: boolean; // tarjeta más pequeña, para el listado de piezas
}

export function EstadisticasPiezaRow({ pesoGramos, tiempoHoras, tiempoMinutos, compact }: EstadisticasPiezaRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <View style={[compact ? styles.compactBox : styles.box, { borderColor: theme.border, backgroundColor: theme.bgSurface }]}>
        <View style={styles.headerRow}>
          <Ionicons name="scale-outline" size={compact ? 13 : 14} color={theme.textSecondary} />
          <Text style={[compact ? styles.compactLabel : styles.label, { color: theme.textSecondary }]}>Peso de Pieza</Text>
        </View>
        <Text style={[compact ? styles.compactValue : styles.value, { color: theme.textPrimary }]}>{pesoGramos}g</Text>
      </View>

      <View style={[compact ? styles.compactBox : styles.box, { borderColor: theme.border, backgroundColor: theme.bgSurface }]}>
        <View style={styles.headerRow}>
          <Ionicons name="time-outline" size={compact ? 13 : 14} color={theme.textSecondary} />
          <Text style={[compact ? styles.compactLabel : styles.label, { color: theme.textSecondary }]}>Duración de Pieza</Text>
        </View>
        <Text style={[compact ? styles.compactValue : styles.value, { color: theme.textPrimary }]}>
          {formatTiempo(tiempoHoras, tiempoMinutos)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  box: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, gap: 4 },
  compactBox: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, gap: 4 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontSize: 10, fontWeight: "600" },
  compactLabel: { fontSize: 10, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  compactValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },
});