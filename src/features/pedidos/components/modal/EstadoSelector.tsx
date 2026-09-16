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
  // Solución: Hacemos un cast a string para evitar el conflicto de tipos estrictos con TypeScript
  const estadosLineales = ESTADOS.filter(
    (e) => (e.key as string) !== "cancelado",
  );

  // Encontramos el índice actual para determinar qué pasos ya pasaron, cuál es el actual y cuáles faltan
  const currentIndex = estadosLineales.findIndex((e) => e.key === estadoActual);

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: theme.textSecondary }]}>
        Progreso del pedido
      </Text>

      <View style={styles.stepperContainer}>
        {estadosLineales.map((config, index) => {
          const isCurrent = config.key === estadoActual;
          const isCompleted = currentIndex !== -1 && index < currentIndex;

          // Colores dinámicos según el estado del nodo
          let nodeBg = theme.bgSecondary;
          let nodeBorder = theme.border || "#ccc";
          let iconColor = theme.textSecondary;
          let textColor = theme.textSecondary;

          if (isCurrent) {
            nodeBg = config.color;
            nodeBorder = config.color;
            iconColor = "#FFFFFF";
            textColor = config.color;
          } else if (isCompleted) {
            nodeBg = config.color + "20"; // Tono suave transparente
            nodeBorder = config.color;
            iconColor = config.color;
            textColor = theme.textPrimary;
          }

          return (
            <React.Fragment key={config.key}>
              {/* Línea conectora entre nodos */}
              {index > 0 && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor:
                        index <= currentIndex
                          ? config.color
                          : theme.border + "40",
                    },
                  ]}
                />
              )}

              {/* Nodo del paso */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSeleccionar(config.key as EstadoPedido)}
                style={styles.stepWrapper}
              >
                <View
                  style={[
                    styles.nodeCircle,
                    {
                      backgroundColor: nodeBg,
                      borderColor: nodeBorder,
                    },
                    isCurrent && styles.nodeCurrentShadow,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? "checkmark" : config.icono}
                    size={isCurrent ? 16 : 13}
                    color={iconColor}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: textColor },
                    isCurrent && { fontWeight: "800" },
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
    maxWidth: 75,
  },
  nodeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  nodeCurrentShadow: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  connectorLine: {
    flex: 1,
    height: 2.5,
    marginHorizontal: -8,
    marginBottom: 22, // Alineado verticalmente al centro de los círculos de los nodos
    borderRadius: 1.5,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
