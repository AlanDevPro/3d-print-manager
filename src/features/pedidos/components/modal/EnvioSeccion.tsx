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
  pedido: Pedido | null | undefined;
  onToggleChecklist: (itemId: string) => void;
}

export function EnvioSeccion({
  theme,
  pedido,
  onToggleChecklist,
}: EnvioSeccionProps) {
  // Guard temprano: Si no hay pedido ni datos de envío, no renderizar nada o evitar fallos
  if (!pedido || !pedido.envio) {
    return null;
  }

  // Búsqueda segura del tipo de envío en la configuración
  const tipoEnvioKey = pedido.envio.tipo;
  const tipoEnvioConfig = ENVIO_CONFIG?.[tipoEnvioKey];
  const tipoEnvioTexto =
    tipoEnvioConfig?.label ?? String(tipoEnvioKey ?? "No especificado");

  const costoTexto =
    typeof pedido.envio.costo === "number" && pedido.envio.costo > 0
      ? formatBs(pedido.envio.costo)
      : "Gratis";

  // Asegurar que el checklist sea un arreglo para iterar de forma segura
  const checklist = Array.isArray(pedido.envio.checklist)
    ? pedido.envio.checklist
    : [];

  return (
    <SeccionModal titulo="Detalles de Envío" icono="cube-outline" theme={theme}>
      <FilaDetalle
        theme={theme}
        label="Tipo"
        valor={tipoEnvioTexto}
        icono="bus-outline"
      />

      <FilaDetalle
        theme={theme}
        label="Costo de envío"
        valor={costoTexto}
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

      {checklist.length > 0 && (
        <>
          <View style={styles.checklistHeader}>
            <Ionicons
              name="list-outline"
              size={13}
              color={theme?.textSecondary}
            />
            <Text
              style={[
                styles.checklistTitulo,
                { color: theme?.textSecondary },
              ]}
            >
              Checklist de verificación
            </Text>
          </View>

          {checklist.map((item) => {
            if (!item) return null;

            const isHecho = Boolean(item.hecho);
            const labelTexto = item.label ?? "Sin descripción";

            return (
              <TouchableOpacity
                key={item.id ?? Math.random().toString()}
                style={styles.checklistItem}
                onPress={() => item.id && onToggleChecklist(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isHecho ? "checkbox" : "square-outline"}
                  size={20}
                  color={isHecho ? "#22C55E" : theme?.textSecondary}
                />
                <Text
                  style={[
                    styles.checklistLabel,
                    {
                      color: isHecho
                        ? theme?.textPrimary
                        : theme?.textSecondary,
                      textDecorationLine: isHecho ? "line-through" : "none",
                    },
                  ]}
                >
                  {labelTexto}
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}
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
  checklistLabel: {
    fontSize: 13.5,
    flex: 1,
  },
});