// src/features/pedidos/components/UrgentePill.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PRIORIDAD_CONFIG } from "../constants";
import { Pedido } from "../types";
import { calcularPrioridad } from "../utils/fechas";

interface UrgentePillProps {
  pedido: Pedido;
  theme: any;
  onPress: () => void;
}

export function UrgentePill({ pedido, theme, onPress }: UrgentePillProps) {
  const prioridad = calcularPrioridad(pedido.fechaEntregaISO, pedido.estado);
  const cfg = PRIORIDAD_CONFIG[prioridad];

  return (
    <TouchableOpacity
      style={[styles.urgentePill, { backgroundColor: cfg.color + "1A" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.urgenteDot, { backgroundColor: cfg.color }]} />
      <View>
        <Text
          style={[styles.urgenteCliente, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {pedido.cliente.nombre}
        </Text>
        <Text style={[styles.urgenteLabel, { color: cfg.color }]}>
          {cfg.label} · {pedido.fechaEntregaTexto}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  urgentePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 160,
  },
  urgenteDot: { width: 7, height: 7, borderRadius: 3.5 },
  urgenteCliente: { fontSize: 12.5, fontWeight: "700" },
  urgenteLabel: { fontSize: 10.5, fontWeight: "700", marginTop: 1 },
});
