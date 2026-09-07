// src/features/cotizacion/components/resumen/PrecioVentaDestacado.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { formatMoneda } from "@/features/cotizacion/utils/formatters";

interface PrecioVentaDestacadoProps {
  precio?: number;
  esVistaGeneral: boolean;
  moneda: string;
}

export function PrecioVentaDestacado({ precio, esVistaGeneral, moneda }: PrecioVentaDestacadoProps) {
  const { theme } = useTheme();

  return (
    <>
      <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
        {esVistaGeneral ? "PRECIO TOTAL (VENTA)" : "PRECIO SUGERIDO DE ESTA PIEZA (TOTAL)"}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceReadOnly, { color: theme.textPrimary }]}>{formatMoneda(precio)}</Text>
        <Text style={[styles.currencySymbol, { color: theme.primary }]}>{moneda}</Text>
      </View>
      <Text style={[styles.subtextNotice, { color: theme.textSecondary }]}>
        {esVistaGeneral
          ? "Precio total de venta de todas las piezas de este proyecto."
          : "Precio sugerido de esta pieza según su proporción dentro del costo directo total del proyecto."}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 2 },
  priceReadOnly: { fontSize: 24, fontWeight: "800" },
  currencySymbol: { fontSize: 16, fontWeight: "700", marginLeft: 6, marginBottom: 2 },
  subtextNotice: { fontSize: 11 },
});