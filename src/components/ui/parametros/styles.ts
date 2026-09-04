// src/components/ui/parametros/styles.ts
import { radii, spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

/**
 * Estilos estructurales (sin color) reutilizados por los distintos
 * componentes de "Parámetros". Los colores se aplican de forma
 * dinámica desde cada componente usando ThemeContext.
 */
export const parametrosStyles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    gap: spacing.xs + 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cardHeaderRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCol: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardVal: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 1,
  },
  cardDivider: {
    width: StyleSheet.hairlineWidth,
    height: "80%",
    backgroundColor: "rgba(150,150,150,0.3)",
    marginHorizontal: spacing.xs,
  },
});
