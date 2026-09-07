// src/features/cotizacion/components/resumen/DesgloseDetallado.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { formatMoneda } from "@/features/cotizacion/utils/formatters";

interface DetailRowProps {
  label: string;
  value?: number;
  moneda: string;
  bold?: boolean;
}

function DetailRow({ label, value, moneda, bold }: DetailRowProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: bold ? theme.textPrimary : theme.textSecondary }, bold && styles.bold]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: theme.textPrimary }, bold && styles.bold]}>
        {formatMoneda(value)} {moneda}
      </Text>
    </View>
  );
}

interface DesgloseDetalladoProps {
  moneda: string;
  matDirecto: number;
  operacionMo: number;
  depreciacion: number;
  energia: number;
  subtotalDirecto: number;
  fondoRiesgo: number;
  fondoRiesgoLabel: string;
  costoDiseno?: number;
  costoBaseTotal: number;
  utilidadLabel: string;
  utilidadSubtext: string;
  utilidadValor: number;
  impuesto?: number;
}

export function DesgloseDetallado({
  moneda,
  matDirecto,
  operacionMo,
  depreciacion,
  energia,
  subtotalDirecto,
  fondoRiesgo,
  fondoRiesgoLabel,
  costoDiseno = 0,
  costoBaseTotal,
  utilidadLabel,
  utilidadSubtext,
  utilidadValor,
  impuesto,
}: DesgloseDetalladoProps) {
  const { theme } = useTheme();

  // Si el costo base recibido no incluye diseño, se suma dinámicamente
  const costoBaseConDiseno = (costoBaseTotal || 0) + (costoDiseno || 0);

  return (
    <View style={styles.container}>
      <DetailRow label="Material directo" value={matDirecto} moneda={moneda} />
      <DetailRow label="Mano de obra / Preparación" value={operacionMo} moneda={moneda} />
      <DetailRow label="Depreciación de máquina" value={depreciacion} moneda={moneda} />
      <DetailRow label="Energía eléctrica" value={energia} moneda={moneda} />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <DetailRow label="Subtotal directo" value={subtotalDirecto} moneda={moneda} bold />
      <DetailRow label={fondoRiesgoLabel} value={fondoRiesgo} moneda={moneda} />

      {/* Fila de Diseño / Personalización */}
      {Boolean(costoDiseno > 0) && (
        <DetailRow label="Diseño / personalización" value={costoDiseno} moneda={moneda} />
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Costo base que incluye la suma del costo de diseño */}
      <DetailRow 
        label="Costo fabricación base (sin utilidad)" 
        value={costoBaseConDiseno} 
        moneda={moneda} 
        bold 
      />

      <View style={[styles.profitBox, { backgroundColor: theme.bgSurface, borderColor: theme.primary }]}>
        <View style={styles.profitInfo}>
          <Text style={[styles.profitLabel, { color: theme.primary }]}>{utilidadLabel}</Text>
          <Text style={[styles.profitSubtext, { color: theme.textSecondary }]}>{utilidadSubtext}</Text>
        </View>
        <Text style={[styles.profitValue, { color: theme.primary }]}>+ {formatMoneda(utilidadValor)} {moneda}</Text>
      </View>

      {Boolean(impuesto && impuesto > 0) && <DetailRow label="Impuestos" value={impuesto} moneda={moneda} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13 },
  bold: { fontWeight: "700" },
  divider: { height: 1, marginVertical: 6 },
  profitBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  profitInfo: { flex: 1 },
  profitLabel: { fontSize: 13, fontWeight: "700" },
  profitSubtext: { fontSize: 11, marginTop: 2 },
  profitValue: { fontSize: 15, fontWeight: "700", marginLeft: 8 },
});