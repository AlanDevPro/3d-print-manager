// src/components/ui/parametros/EspecificacionesMaquinaCard.tsx
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import {
  EspecificacionMaquina,
  ImpresoraDepreciacion,
} from "@/features/parametros/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface EspecificacionesMaquinaCardProps {
  impresoras?: (EspecificacionMaquina | ImpresoraDepreciacion)[] | null;
  style?: StyleProp<ViewStyle>;
}

export function EspecificacionesMaquinaCard({
  impresoras = [],
  style,
}: EspecificacionesMaquinaCardProps) {
  const { theme } = useContext(ThemeContext);

  const listaImpresoras = Array.isArray(impresoras) ? impresoras : [];

  return (
    <View
      style={[
        styles.mainCard,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
        style,
      ]}
    >
      <View style={[styles.titleRow, { borderBottomColor: theme.border }]}>
        <Ionicons name="flash-outline" size={16} color={theme.primary} />
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.textPrimary, fontSize: 13 },
          ]}
        >
          Potencia Impresoras
        </Text>
      </View>

      {listaImpresoras.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.textEmpty, { color: theme.textMuted }]}>
            No hay impresoras registradas para mostrar su potencia.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {listaImpresoras.map((item, index) => {
            const nombre = item.nombre || "Sin nombre";

            // Soporte seguro para camelCase (potenciaWatts) y snake_case (potencia_watts de Supabase)
            const obj = item as Record<string, unknown>;
            const potenciaWatts =
              typeof obj.potenciaWatts === "number"
                ? obj.potenciaWatts
                : typeof obj.potencia_watts === "number"
                  ? obj.potencia_watts
                  : typeof obj.potencia === "number"
                    ? obj.potencia
                    : typeof obj.consumoWatts === "number"
                      ? obj.consumoWatts
                      : undefined;

            const potenciaFormateada =
              typeof potenciaWatts === "number" ? `${potenciaWatts} W` : "N/A";

            const itemId =
              "id" in item && typeof item.id === "string" ? item.id : index;

            return (
              <View
                key={itemId}
                style={[
                  styles.innerCard,
                  {
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.nombreRow}>
                  <Ionicons name="print" size={16} color={theme.primary} />
                  <Text
                    style={[styles.nombreText, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {nombre}
                  </Text>
                </View>

                <View
                  style={[
                    styles.miniCardPotencia,
                    {
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.potenciaLabelRow}>
                    <Ionicons name="flash" size={10} color={theme.primary} />
                    <Text
                      style={[
                        styles.miniCardPotenciaLabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Potencia
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.miniCardPotenciaValue,
                      { color: theme.primary },
                    ]}
                  >
                    {potenciaFormateada}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: spacing.xs + 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContainer: {
    gap: spacing.xs,
  },
  innerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.xs,
  },
  nombreText: {
    fontSize: 13,
    fontWeight: "600",
  },
  miniCardPotencia: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  potenciaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniCardPotenciaLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  miniCardPotenciaValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  textEmpty: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
});
