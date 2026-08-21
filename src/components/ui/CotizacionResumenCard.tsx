import type { ResultadoCotizacion } from "@/features/cotizacion/types";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  resultado: ResultadoCotizacion | null;
  cantidad: number;
  /**
   * Callback para notificar al padre cuando el usuario edita
   * manualmente el precio unitario (override).
   */
  onOverridePrecio?: (nuevoPrecio: number | undefined) => void;
}

/** Formateador seguro para moneda boliviana */
const formatBs = (value?: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00";
  return value.toFixed(2).replace(".", ",");
};

export function CotizacionResumenCard({
  resultado,
  cantidad,
  onOverridePrecio,
}: Props) {
  const { theme } = useTheme();

  // 1. ESTADO LOCAL DEL INPUT EDITABLE DE PRECIO
  const [precioEditable, setPrecioEditable] = useState<string>("");

  // 2. SINCRONIZACIÓN CON EL PRECIO CALCULADO DE LA BD
  useEffect(() => {
    if (resultado?.precio_por_pieza !== undefined) {
      setPrecioEditable(
        resultado.precio_por_pieza.toFixed(2).replace(".", ","),
      );
    } else {
      setPrecioEditable("");
    }
  }, [resultado?.precio_por_pieza]);

  // Manejador del cambio manual de precio en la UI (override)
  const handlePrecioChange = (text: string) => {
    setPrecioEditable(text);

    if (!onOverridePrecio) return;

    const normalizedText = text.replace(",", ".");
    const parsed = parseFloat(normalizedText);

    if (!isNaN(parsed) && parsed > 0) {
      onOverridePrecio(parsed);
    } else if (text.trim() === "") {
      onOverridePrecio(undefined); // Restablece al cálculo automático con reglas de BD
    }
  };

  // 3. ESTADO INICIAL / VACÍO
  if (!resultado || !resultado.desglose) {
    return (
      <View
        style={[
          styles.card,
          styles.emptyCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Ingresa los parámetros necesarios para calcular la cotización en
          tiempo real.
        </Text>
      </View>
    );
  }

  const { desglose } = resultado;

  // Garantiza obtener el porcentaje calculado por las reglas de la BD
  const pctUtilidadAplicado =
    resultado.margen_ganancia_aplicado_pct ?? desglose.porcentaje_utilidad ?? 0;

  // Proporciones para la barra visual
  const flexMaterial = desglose.material_directo || 0;
  const flexOperacion = desglose.operacion_preparacion || 0;
  const flexDepreciacion = desglose.depreciacion_maquina || 0;
  const flexEnergia = desglose.energia || 0;
  const flexUtilidad = desglose.utilidad_pieza || 0;

  const costSegments = [
    { key: "mat", label: "MATERIAL", flex: flexMaterial, color: "#1F2937" },
    { key: "ope", label: "OPERACIÓN", flex: flexOperacion, color: "#4B5563" },
    {
      key: "dep",
      label: "DEPRECIACIÓN",
      flex: flexDepreciacion,
      color: "#9CA3AF",
    },
    { key: "ene", label: "ENERGÍA", flex: flexEnergia, color: "#D1D5DB" },
    { key: "uti", label: "UTILIDAD", flex: flexUtilidad, color: theme.primary },
  ];

  const precioVentaImpresionConUtilidad =
    (desglose.costo_total_pieza || 0) + (desglose.utilidad_pieza || 0);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      {/* HEADER: PRECIO POR PIEZA EDITABLE */}
      <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
        PRECIO POR PIEZA (VENTA)
      </Text>
      <View style={styles.priceRow}>
        <TextInput
          style={[
            styles.priceInput,
            {
              borderColor: theme.border,
              color: theme.textPrimary,
              backgroundColor: theme.inputBg || "transparent",
            },
          ]}
          value={precioEditable}
          onChangeText={handlePrecioChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <Text style={[styles.currencySymbol, { color: theme.primary }]}>
          Bs
        </Text>
      </View>
      <Text style={[styles.subtextNotice, { color: theme.textSecondary }]}>
        Toca el número para fijar un precio personalizado o borra para restaurar
        el cálculo automático.
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* TOTAL DEL PROYECTO */}
      <View style={styles.projectTotalRow}>
        <Text style={[styles.projectTotalText, { color: theme.textSecondary }]}>
          Total del proyecto · {cantidad} {cantidad === 1 ? "pieza" : "piezas"}
        </Text>
        <Text style={[styles.projectTotalValue, { color: theme.textPrimary }]}>
          {formatBs(resultado.precio_final)} Bs
        </Text>
      </View>

      {/* BARRA PROPORCIONAL DE COSTOS Y MARGEN */}
      <View style={styles.progressBar}>
        {costSegments.map((seg) => (
          <View
            key={seg.key}
            style={[
              styles.progressSegment,
              {
                flex: seg.flex > 0 ? seg.flex : 0.001,
                backgroundColor: seg.color,
              },
            ]}
          />
        ))}
      </View>

      {/* LEYENDA DINÁMICA */}
      <View style={styles.legendContainer}>
        {costSegments.map((seg) => (
          <LegendItem
            key={seg.key}
            color={seg.color}
            label={seg.label}
            textColor={theme.textSecondary}
          />
        ))}
      </View>

      {/* FILAS DE DESGLOSE TÉCNICO */}
      <View style={styles.costDetails}>
        <DetailRow
          label="Material directo"
          value={desglose.material_directo}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Mano de obra / Preparación"
          value={desglose.operacion_preparacion}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Depreciación de máquina"
          value={desglose.depreciacion_maquina}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Energía eléctrica"
          value={desglose.energia}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />

        <View style={[styles.subDivider, { backgroundColor: theme.border }]} />

        <DetailRow
          label="Subtotal directo"
          value={desglose.subtotal_operativo}
          bold
          textColor={theme.textPrimary}
          labelColor={theme.textPrimary}
        />
        <DetailRow
          label={`Fondo de riesgo (${desglose.porcentaje_riesgo ?? 0}%)`}
          value={desglose.fondo_riesgo}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />

        <View style={[styles.subDivider, { backgroundColor: theme.border }]} />

        <DetailRow
          label="Costo fabricación base (sin utilidad)"
          value={desglose.costo_total_pieza}
          bold
          textColor={theme.textPrimary}
          labelColor={theme.textPrimary}
        />

        {/* CAJA DESTACADA DE MARGEN Y UTILIDAD APLICANDO PORCENTAJE DE BD */}
        <View
          style={[
            styles.profitBox,
            {
              backgroundColor: theme.bgSurface,
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.profitInfoContainer}>
            <Text style={[styles.profitLabel, { color: theme.primary }]}>
              Utilidad por pieza
            </Text>
            <Text
              style={[styles.profitSubtext, { color: theme.textSecondary }]}
            >
              Regla aplicada (Q={cantidad}): {pctUtilidadAplicado.toFixed(1)}%
            </Text>
          </View>
          <Text style={[styles.profitValue, { color: theme.primary }]}>
            + {formatBs(desglose.utilidad_pieza)} Bs
          </Text>
        </View>

        {(resultado.precio_personalizacion ?? 0) > 0 && (
          <DetailRow
            label="Trabajo de personalización"
            value={resultado.precio_personalizacion}
            textColor={theme.textPrimary}
            labelColor={theme.textSecondary}
          />
        )}

        <Text style={[styles.rateText, { color: theme.textSecondary }]}>
          Tasa hora/hombre: {formatBs(desglose.tasa_hora_hombre)} Bs/h
        </Text>
      </View>

      {/* BOTONES DE ACCIÓN */}
      <View style={styles.actionsRow}>
        <Pressable style={[styles.btnSecondary, { borderColor: theme.border }]}>
          <Text style={[styles.btnSecondaryText, { color: theme.textPrimary }]}>
            Ficha interna
          </Text>
        </Pressable>
        <Pressable
          style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.btnPrimaryText}>Voucher cliente</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// COMPONENTES AUXILIARES
// --------------------------------------------------------------------------

function LegendItem({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  bold,
  textColor,
  labelColor,
}: {
  label: string;
  value?: number;
  bold?: boolean;
  textColor: string;
  labelColor: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          styles.detailLabel,
          { color: labelColor },
          bold && styles.textBold,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          { color: textColor },
          bold && styles.textBold,
        ]}
      >
        {formatBs(value)} Bs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 20,
    fontWeight: "700",
    width: 140,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  subtextNotice: {
    fontSize: 11,
    marginTop: 6,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  projectTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectTotalText: {
    fontSize: 13,
    fontWeight: "500",
  },
  projectTotalValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 14,
  },
  progressSegment: {
    height: "100%",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: "700",
  },
  costDetails: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
  },
  textBold: {
    fontWeight: "700",
  },
  subDivider: {
    height: 1,
    marginVertical: 6,
  },
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
  profitInfoContainer: {
    flex: 1,
  },
  profitLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  profitSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  profitValue: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  rateText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontWeight: "700",
    fontSize: 13,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
