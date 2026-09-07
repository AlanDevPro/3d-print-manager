// src/features/cotizacion/components/resumen/PiezasDetalleLista.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { EstadisticasPiezaRow } from "./EstadisticasPiezaRow";
import type { ResultadoCotizacion } from "@/features/cotizacion/types";

interface PiezasDetalleListaProps {
  piezas: ResultadoCotizacion["piezas"];
}

export function PiezasDetalleLista({ piezas }: PiezasDetalleListaProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>DETALLE DE PIEZAS</Text>
      {piezas.map((p, idx) => (
        <View key={p.id} style={[styles.card, { backgroundColor: theme.bgPrimary, borderColor: theme.border }]}>
          <Text style={[styles.nombre, { color: theme.textPrimary }]} numberOfLines={1}>
            {idx + 1}. {p.nombre_pieza}
          </Text>
          <EstadisticasPiezaRow
            pesoGramos={p.peso_gramos}
            tiempoHoras={p.tiempo_impresion_horas}
            tiempoMinutos={p.tiempo_impresion_minutos}
            compact
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, gap: 8 },
  title: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
  card: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 8 },
  nombre: { fontSize: 13, fontWeight: "700" },
});