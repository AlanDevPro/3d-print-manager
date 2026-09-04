// src/features/pedidos/components/PedidoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  ENVIO_CONFIG,
  PAGO_CONFIG,
  PRIORIDAD_CONFIG,
  estadoConfig,
} from "../constants";
import { EstadoPago, Pedido } from "../types";
import { calcularPrioridad } from "../utils/fechas";
import { formatBs } from "../utils/formato";

interface PedidoCardProps {
  theme: any;
  pedido: Pedido;
  onPress: () => void;
}

// Mapeo de iconos para el estado de pago
const PAGO_ICONOS: Record<EstadoPago, keyof typeof Ionicons.glyphMap> = {
  sin_pagar: "alert-circle-outline",
  anticipo: "time-outline",
  pagado: "checkmark-circle-outline",
};

export function PedidoCard({ theme, pedido, onPress }: PedidoCardProps) {
  const estadoCfg = estadoConfig(pedido.estado);
  const pagoCfg = PAGO_CONFIG[pedido.pago.estado];
  const prioridad = calcularPrioridad(pedido.fechaEntregaISO, pedido.estado);
  const prioridadCfg = PRIORIDAD_CONFIG[prioridad];
  const checklistHecho = pedido.envio.checklist.filter((c) => c.hecho).length;
  const checklistTotal = pedido.envio.checklist.length;
  const progreso = checklistTotal > 0 ? checklistHecho / checklistTotal : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.bgSecondary },
        prioridad !== "normal" && {
          borderWidth: 1.5,
          borderColor: prioridadCfg.color + "55",
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Cabecera de la tarjeta: Código, badges y datos principales */}
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardCodigoRow}>
            <Ionicons name="pricetag-outline" size={11} color={theme.textSecondary} />
            <Text style={[styles.cardCodigo, { color: theme.textSecondary }]}>
              {pedido.codigo}
            </Text>

            {pedido.cliente.recurrente && (
              <View
                style={[
                  styles.recurrenteBadge,
                  { backgroundColor: theme.primary + "1A" },
                ]}
              >
                <Ionicons name="star" size={9} color={theme.primary} />
                <Text
                  style={[styles.recurrenteBadgeText, { color: theme.primary }]}
                >
                  Frecuente
                </Text>
              </View>
            )}
          </View>

          {/* Cliente con icono */}
          <View style={styles.itemRow}>
            <Ionicons name="person-outline" size={13} color={theme.textPrimary} />
            <Text
              style={[styles.cardCliente, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {pedido.cliente.nombre}
            </Text>
          </View>

          {/* Pieza 3D o Producto con icono */}
          <View style={styles.itemRow}>
            <Ionicons name="cube-outline" size={12} color={theme.textSecondary} />
            <Text
              style={[styles.cardPieza, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {pedido.pieza}
            </Text>
          </View>
        </View>

        {/* Badge con Icono del estado del pedido */}
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: estadoCfg.color + "1A" },
          ]}
        >
          <Ionicons
            name={estadoCfg.icono}
            size={12}
            color={estadoCfg.color}
          />
          <Text style={[styles.estadoBadgeText, { color: estadoCfg.color }]}>
            {estadoCfg.label}
          </Text>
        </View>
      </View>

      {/* Fila con Fecha de Entrega y Método de Envío */}
      <View style={styles.cardBottomRow}>
        <View style={styles.cardInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={
              prioridad !== "normal" ? prioridadCfg.color : theme.textSecondary
            }
          />
          <Text
            style={[
              styles.cardInfoText,
              {
                color:
                  prioridad !== "normal"
                    ? prioridadCfg.color
                    : theme.textSecondary,
                fontWeight: prioridad !== "normal" ? "700" : "400",
              },
            ]}
          >
            {pedido.fechaEntregaTexto}
          </Text>
        </View>

        <View style={styles.cardInfoItem}>
          <Ionicons
            name={ENVIO_CONFIG[pedido.envio.tipo].icono}
            size={13}
            color={theme.textSecondary}
          />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {ENVIO_CONFIG[pedido.envio.tipo].label}
          </Text>
        </View>
      </View>

      {/* Barra de Progreso del Checklist */}
      <View style={styles.progresoRow}>
        <Ionicons name="checkbox-outline" size={12} color={theme.textSecondary} />
        <View
          style={[styles.progresoTrack, { backgroundColor: theme.bgPrimary }]}
        >
          <View
            style={[
              styles.progresoFill,
              {
                width: `${progreso * 100}%`,
                backgroundColor: progreso === 1 ? "#22C55E" : theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progresoTexto, { color: theme.textSecondary }]}>
          {checklistHecho}/{checklistTotal}
        </Text>
      </View>

      {/* Pie de la tarjeta: Estado de Pago y Total */}
      <View style={styles.cardFooterRow}>
        <View
          style={[styles.pagoBadge, { backgroundColor: pagoCfg.color + "1A" }]}
        >
          <Ionicons
            name={PAGO_ICONOS[pedido.pago.estado]}
            size={12}
            color={pagoCfg.color}
          />
          <Text style={[styles.pagoBadgeText, { color: pagoCfg.color }]}>
            {pagoCfg.label}
            {pedido.pago.estado === "anticipo"
              ? ` (${pedido.pago.anticipoPorcentaje}%)`
              : ""}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={[styles.cardTotal, { color: theme.primary }]}>
            {formatBs(pedido.pago.total)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14, gap: 10 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardCodigoRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardCodigo: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.3 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  recurrenteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  recurrenteBadgeText: { fontSize: 9.5, fontWeight: "800" },
  cardCliente: { fontSize: 14.5, fontWeight: "700", flex: 1 },
  cardPieza: { fontSize: 12, flex: 1 },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  estadoBadgeText: { fontSize: 10.5, fontWeight: "800" },
  cardBottomRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  cardInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardInfoText: { fontSize: 11.5 },
  progresoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  progresoTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  progresoFill: { height: "100%", borderRadius: 3 },
  progresoTexto: { fontSize: 10.5, fontWeight: "600" },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  pagoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pagoBadgeText: { fontSize: 11, fontWeight: "700" },
  totalRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  cardTotal: { fontSize: 15, fontWeight: "800" },
});