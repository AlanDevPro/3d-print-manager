// src/features/pedidos/components/modal/EnvioSeccion.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ENVIO_CONFIG } from "../../constants";
import { Pedido } from "../../types";
import { formatBs } from "../../utils/formato";
import { FilaDetalle } from "./FilaDetalle";
import { SeccionModal } from "./SeccionModal";

interface EnvioSeccionProps {
  theme: any;
  pedido: Pedido;
  onToggleChecklist: (itemId: string) => void;
}

export function EnvioSeccion({
  theme,
  pedido,
  onToggleChecklist,
}: EnvioSeccionProps) {
  return (
    <SeccionModal titulo="Detalles de Envío" icono="cube-outline" theme={theme}>
      <FilaDetalle
        theme={theme}
        label="Tipo"
        valor={ENVIO_CONFIG[pedido.envio.tipo].label}
        icono="bus-outline"
      />
      <FilaDetalle
        theme={theme}
        label="Costo de envío"
        valor={pedido.envio.costo > 0 ? formatBs(pedido.envio.costo) : "Gratis"}
        icono="pricetag-outline"
      />
      {!!pedido.envio.tracking && (
        <FilaDetalle
          theme={theme}
          label="Tracking"
          valor={pedido.envio.tracking}
          icono="barcode-outline"
        />
      )}

      <View style={styles.checklistHeader}>
        <Ionicons name="list-outline" size={13} color={theme.textSecondary} />
        <Text style={[styles.checklistTitulo, { color: theme.textSecondary }]}>
          Checklist de verificación
        </Text>
      </View>

      {pedido.envio.checklist.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.checklistItem}
          onPress={() => onToggleChecklist(item.id)}
        >
          <Ionicons
            name={item.hecho ? "checkbox" : "square-outline"}
            size={20}
            color={item.hecho ? "#22C55E" : theme.textSecondary}
          />
          <Text
            style={[
              styles.checklistLabel,
              {
                color: item.hecho ? theme.textPrimary : theme.textSecondary,
                textDecorationLine: item.hecho ? "line-through" : "none",
              },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  checklistTitulo: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  checklistLabel: { fontSize: 13.5, flex: 1 },
});