import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRecordatorioPdf } from "../hooks/useRecordatorioPdf";
import { EstadoPedido, Pedido } from "../types";
import { ClienteSeccion } from "./modal/ClienteSeccion";
import { EnvioSeccion } from "./modal/EnvioSeccion";
import { EstadoSelector } from "./modal/EstadoSelector";
import { HistorialSeccion } from "./modal/HistorialSeccion";
import { PagoSeccion } from "./modal/PagoSeccion";

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  theme: any;
  onClose: () => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
  onToggleChecklist: (pedido: Pedido, itemId: string) => void;
  onVerificarPago: (pedido: Pedido) => void; // 👈 reemplaza onSubirComprobante
  onLlamar: (pedido: Pedido) => void;
  onWhatsapp: (pedido: Pedido, mensaje: string) => void;
  cargandoConfirmacion?: boolean;
}

export function DetallePedidoModal({
  pedido,
  theme,
  onClose,
  onCambiarEstado,
  onToggleChecklist,
  onVerificarPago,
  cargandoConfirmacion = false,
  onLlamar,
  onWhatsapp,
}: DetallePedidoModalProps) {
  

  return (
    <Modal
      visible={!!pedido}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {pedido && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />

              {/* Cabecera: Código e Indicador de cliente frecuente */}
              <View style={styles.modalTopRow}>
                <View style={styles.codigoBadge}>
                  <Ionicons
                    name="barcode-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalCodigo,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {pedido.codigo}
                  </Text>
                </View>

                {pedido.cliente.recurrente && (
                  <View
                    style={[
                      styles.recurrenteBadge,
                      { backgroundColor: theme.primary + "1A" },
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={11}
                      color={theme.primary}
                    />
                    <Text
                      style={[
                        styles.recurrenteBadgeText,
                        { color: theme.primary },
                      ]}
                    >
                      Cliente frecuente
                    </Text>
                  </View>
                )}
              </View>

              {/* Nombre de la pieza e icono del modelo 3D */}
              <View style={styles.piezaRow}>
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color={theme.primary}
                />
                <Text
                  style={[styles.modalPieza, { color: theme.textPrimary }]}
                >
                  {pedido.pieza}
                </Text>
              </View>

              {/* Fecha límite de entrega */}
              <View style={styles.fechaRow}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={13}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.modalFecha,
                    { color: theme.textSecondary },
                  ]}
                >
                  Entrega: {pedido.fechaEntregaTexto}
                </Text>
              </View>

              <EstadoSelector
                theme={theme}
                estadoActual={pedido.estado}
                onSeleccionar={(estado) => onCambiarEstado(pedido, estado)}
              />

              <ClienteSeccion
                theme={theme}
                pedido={pedido}
                onLlamar={() => onLlamar(pedido)}
                onWhatsapp={() =>
                  onWhatsapp(
                    pedido,
                    `Hola ${pedido.cliente.nombre}, te escribimos de JEDD3DLAB sobre tu pedido ${pedido.codigo}.`
                  )
                }
              />

              <PagoSeccion
  theme={theme}
  pedido={pedido}
  onVerificarPago={() => onVerificarPago(pedido)}
  cargandoConfirmacion={cargandoConfirmacion}
/>

              <EnvioSeccion
                theme={theme}
                pedido={pedido}
                onToggleChecklist={(itemId) =>
                  onToggleChecklist(pedido, itemId)
                }
              />

              <HistorialSeccion theme={theme} pedido={pedido} />

              <TouchableOpacity
                style={styles.cerrarBtn}
                onPress={onClose}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.cerrarBtnText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codigoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modalCodigo: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  piezaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  modalPieza: { fontSize: 19, fontWeight: "800", flex: 1 },
  fechaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 14,
  },
  modalFecha: { fontSize: 12.5 },
  recurrenteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recurrenteBadgeText: { fontSize: 10, fontWeight: "800" },
  cerrarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  cerrarBtnText: { fontSize: 13, fontWeight: "600" },
});