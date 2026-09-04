// src/features/pedidos/components/modal/EstadoSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ESTADOS } from "../../constants";
import { EstadoPedido } from "../../types";

interface EstadoSelectorProps {
  theme: any;
  estadoActual: EstadoPedido;
  onSeleccionar: (estado: EstadoPedido) => void;
}

export function EstadoSelector({
  theme,
  estadoActual,
  onSeleccionar,
}: EstadoSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: theme.textSecondary }]}>
        Estado del pedido
      </Text>
      <View style={styles.grid}>
        {ESTADOS.map((config) => {
          const activo = estadoActual === config.key;
          const colorBadge = activo ? config.color : theme.bgSecondary;
          const colorTexto = activo ? "#FFF" : theme.textSecondary;

          return (
            <TouchableOpacity
              key={config.key}
              activeOpacity={0.8}
              onPress={() => onSeleccionar(config.key)}
              style={[
                styles.btnEstado,
                {
                  backgroundColor: colorBadge,
                  borderColor: activo ? config.color : "transparent",
                },
              ]}
            >
              <Ionicons
                name={config.icono}
                size={14}
                color={colorTexto}
              />
              <Text style={[styles.btnText, { color: colorTexto }]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  titulo: {
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  btnEstado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnText: { fontSize: 12, fontWeight: "700" },
});