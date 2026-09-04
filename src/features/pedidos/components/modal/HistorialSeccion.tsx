// src/features/pedidos/components/modal/HistorialSeccion.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pedido } from "../../types";
import { formatFechaHistorial } from "../../utils/fechas";
import { SeccionModal } from "./SeccionModal";

interface HistorialSeccionProps {
  theme: any;
  pedido: Pedido;
}

export function HistorialSeccion({ theme, pedido }: HistorialSeccionProps) {
  return (
    <SeccionModal titulo="Historial" icono="time-outline" theme={theme}>
      {pedido.historial
        .slice()
        .reverse()
        .map((evento) => (
          <View key={evento.id} style={styles.historialItem}>
            <View style={styles.dotContainer}>
              <Ionicons
                name="ellipse"
                size={8}
                color={theme.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.historialTexto, { color: theme.textPrimary }]}
              >
                {evento.texto}
              </Text>
              <View style={styles.fechaRow}>
                <Ionicons
                  name="time-outline"
                  size={11}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.historialFecha,
                    { color: theme.textSecondary },
                  ]}
                >
                  {formatFechaHistorial(evento.fecha)}
                </Text>
              </View>
            </View>
          </View>
        ))}
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  historialItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  dotContainer: {
    paddingTop: 4,
  },
  historialTexto: { fontSize: 13 },
  fechaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  historialFecha: { fontSize: 10.5 },
});