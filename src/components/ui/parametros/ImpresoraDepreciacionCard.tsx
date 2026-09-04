// src/components/ui/parametros/ImpresoraDepreciacionCard.tsx
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import { ImpresoraDepreciacion } from "@/features/parametros/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ImpresoraDepreciacionCardProps {
  impresora: ImpresoraDepreciacion;
  monedaPrincipal: string;
  tarifaElectricaKwh?: number;
}

export function ImpresoraDepreciacionCard({
  impresora,
  monedaPrincipal,
  tarifaElectricaKwh = 0,
}: ImpresoraDepreciacionCardProps) {
  const { theme } = useContext(ThemeContext);

  const horasRestantes = Math.max(
    0,
    (impresora.vidaUtilHoras || 0) - (impresora.horasImpresas || 0),
  );

  // Cálculo de costo eléctrico estimado por hora (Potencia W / 1000 * Tarifa kWh)
  const costoElectricoHora =
    ((impresora.potenciaWatts || 0) / 1000) * tarifaElectricaKwh;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.nombreRow}>
          <Ionicons name="print" size={16} color={theme.primary} />
          <Text style={[styles.nombreText, { color: theme.textPrimary }]}>
            {impresora.nombre}
          </Text>
        </View>

        <View
          style={[
            styles.miniCardCosto,
            { backgroundColor: theme.bgSecondary, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.miniCardCostoLabel, { color: theme.textMuted }]}>
            Costo
          </Text>
          <Text style={[styles.miniCardCostoValue, { color: theme.primary }]}>
            {impresora.costo} {monedaPrincipal}
          </Text>
        </View>
      </View>

      <View style={[styles.detalle, { borderTopColor: theme.border }]}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            Uso Actual / Vida Útil
          </Text>
          <Text style={[styles.ratioText, { color: theme.textPrimary }]}>
            {impresora.horasImpresas} h / {impresora.vidaUtilHoras} h
          </Text>
        </View>

        <View style={styles.colRight}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            Horas Restantes
          </Text>
          <Text
            style={[
              styles.restantesText,
              { color: horasRestantes < 300 ? "#e53e3e" : theme.primary },
            ]}
          >
            {horasRestantes} h
          </Text>
        </View>
      </View>

      {tarifaElectricaKwh > 0 && (
        <View style={[styles.extraRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            Costo Elec. Est. / hora
          </Text>
          <Text style={[styles.extraValue, { color: theme.textPrimary }]}>
            {costoElectricoHora.toFixed(2)} {monedaPrincipal}/h
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: spacing.xs + 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  nombreText: { fontSize: 13, fontWeight: "700" },
  miniCardCosto: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  miniCardCostoLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  miniCardCostoValue: { fontSize: 12, fontWeight: "700" },
  detalle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  col: { flex: 1 },
  colRight: { alignItems: "flex-end" },
  label: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  ratioText: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  restantesText: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  extraValue: { fontSize: 11, fontWeight: "600" },
});
