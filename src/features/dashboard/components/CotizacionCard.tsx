// src/features/dashboard/components/CotizacionCard.tsx
import { formatBs, formatFechaRelativa } from "@/utils/format";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLOR_ALERTA } from "../constants/colors";
import { CotizacionUI } from "../types";

type Props = { cotizacion: CotizacionUI; theme: any };

export function CotizacionCard({ cotizacion, theme }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={() => router.push?.(`/cotizaciones/${cotizacion.id}` as any)}
    >
      <View
        style={[styles.codigoWrap, { backgroundColor: COLOR_ALERTA + "1A" }]}
      >
        <Text style={[styles.codigo, { color: COLOR_ALERTA }]}>
          #{cotizacion.codigo}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.cliente, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {cotizacion.clienteNombre}
        </Text>
        <Text style={[styles.fecha, { color: theme.textSecondary }]}>
          {formatFechaRelativa(cotizacion.createdAt)}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.monto, { color: theme.textPrimary }]}>
          {formatBs(cotizacion.precioFinal)}
        </Text>
        <Text style={[styles.pendiente, { color: COLOR_ALERTA }]}>
          Pendiente
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 10,
  },
  codigoWrap: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  codigo: { fontSize: 11, fontWeight: "800" },
  cliente: { fontSize: 13.5, fontWeight: "700" },
  fecha: { fontSize: 11, marginTop: 1 },
  monto: { fontSize: 14, fontWeight: "800" },
  pendiente: { fontSize: 10.5, fontWeight: "700", marginTop: 1 },
});
