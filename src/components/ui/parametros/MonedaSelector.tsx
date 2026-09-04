// src/components/ui/parametros/MonedaSelector.tsx
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import {
  METADATA_MONEDAS,
  MONEDAS_DISPONIBLES,
  MonedaCodigo,
} from "@/features/parametros/types";
import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MonedaSelectorProps {
  value?: MonedaCodigo | null;
  onChange: (moneda: MonedaCodigo) => void;
  /** Monedas cargadas dinámicamente desde la BD (opcional). Si no se envía, usa MONEDAS_DISPONIBLES */
  monedasDisponibles?: MonedaCodigo[];
}

export function MonedaSelector({
  value,
  onChange,
  monedasDisponibles = MONEDAS_DISPONIBLES as unknown as MonedaCodigo[],
}: MonedaSelectorProps) {
  const { theme } = useContext(ThemeContext);

  // 1. Caso: No existen monedas registradas/disponibles en la BD
  if (!monedasDisponibles || monedasDisponibles.length === 0) {
    return (
      <View
        style={[
          styles.alertaNoMoneda,
          { backgroundColor: theme.bgSecondary, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.alertaTexto, { color: theme.textMuted }]}>
          No hay monedas registradas en la base de datos.
        </Text>
      </View>
    );
  }

  // 2. Renderizado del selector
  return (
    <View style={styles.container}>
      {!value && (
        <View
          style={[
            styles.alertaNoMoneda,
            { backgroundColor: theme.bgSecondary },
          ]}
        >
          <Text style={[styles.alertaTexto, { color: theme.textMuted }]}>
            No hay una moneda seleccionada actualmente. Selecciona una:
          </Text>
        </View>
      )}

      <View style={styles.row}>
        {monedasDisponibles.map((codigo) => {
          const activo = codigo === value;
          const meta = METADATA_MONEDAS[codigo];

          // Fallback por si la BD devuelve un código no mapeado en METADATA_MONEDAS
          const simbolo = meta?.simbolo ?? "";
          const nombreCodigo = meta?.codigo ?? codigo;

          return (
            <Pressable
              key={codigo}
              onPress={() => onChange(codigo)}
              style={[
                styles.chip,
                {
                  backgroundColor: activo
                    ? theme.primaryLight
                    : theme.bgSurface,
                  borderColor: activo ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  { color: activo ? theme.primary : theme.textPrimary },
                ]}
              >
                {simbolo} {nombreCodigo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  alertaNoMoneda: {
    padding: spacing.xs + 4,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  alertaTexto: {
    fontSize: 12,
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "600",
  },
});
