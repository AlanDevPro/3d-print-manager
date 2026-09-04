//src/features/finanzas/components/ListaMovimientos.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EgresoUI, IngresoUI, MetodoPago } from "../types";

const METODO_CFG: Record<
  MetodoPago,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  efectivo: { label: "Efectivo", color: "#22C55E", icono: "cash-outline" },
  qr: { label: "QR", color: "#3B82F6", icono: "qr-code-outline" },
  transferencia: {
    label: "Transferencia",
    color: "#8B5CF6",
    icono: "swap-horizontal-outline",
  },
};

interface Props {
  theme: any;
  tipo: "ingreso" | "egreso";
  movimientos: (IngresoUI | EgresoUI)[];
}

export function ListaMovimientos({ theme, tipo, movimientos }: Props) {
  return (
    <View style={{ gap: 10 }}>
      {movimientos.map((mov) => {
        const esIngreso = tipo === "ingreso";
        const descripcion = mov.concepto;
        const subdescripcion = esIngreso
          ? (mov as IngresoUI).clienteNombre
          : (mov as EgresoUI).categoria;
        const color = esIngreso ? "#22C55E" : "#EF4444";
        const metodoCfg = METODO_CFG[mov.metodo];

        return (
          <View
            key={mov.id}
            style={[styles.fila, { backgroundColor: theme.bgSecondary }]}
          >
            <View style={[styles.icono, { backgroundColor: color + "1A" }]}>
              <Ionicons
                name={esIngreso ? "arrow-down-circle" : "arrow-up-circle"}
                size={17}
                color={color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.desc, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {descripcion}
              </Text>
              <Text
                style={[styles.sub, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {subdescripcion} · {mov.fecha}
              </Text>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: metodoCfg.color + "1A" },
                ]}
              >
                <Ionicons
                  name={metodoCfg.icono}
                  size={10}
                  color={metodoCfg.color}
                />
                <Text
                  style={{
                    color: metodoCfg.color,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  {metodoCfg.label}
                </Text>
              </View>
            </View>
            <Text style={{ color, fontSize: 14, fontWeight: "800" }}>
              {esIngreso ? "+" : "-"} Bs {mov.monto.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  desc: { fontSize: 13.5, fontWeight: "700" },
  sub: { fontSize: 11.5, marginTop: 1 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
});
