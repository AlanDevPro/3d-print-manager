import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { PAGO_CONFIG } from "../../constants";
import { EstadoPago, Pedido } from "../../types";
import { formatBs } from "../../utils/formato";
import { FilaDetalle } from "./FilaDetalle";
import { SeccionModal } from "./SeccionModal";

interface PagoSeccionProps {
  theme: any;
  pedido: Pedido;
  onVerificarPago?: () => void;
  cargandoConfirmacion?: boolean;
}

const PAGO_ICONOS: Record<EstadoPago, keyof typeof Ionicons.glyphMap> = {
  sin_pagar: "alert-circle-outline",
  anticipo: "time-outline",
  pagado: "checkmark-circle-outline",
};

export function PagoSeccion({
  theme,
  pedido,
  onVerificarPago,
  cargandoConfirmacion = false,
}: PagoSeccionProps) {
  const [modalImagenVisible, setModalImagenVisible] = useState(false);

  const imagenComprobante = pedido.pago.comprobanteUrl;
  const saldoPendiente = Math.max(0, pedido.pago.total - pedido.pago.montoCobrado);

  const esMetodoQr =
    pedido.pago.metodo?.toLowerCase().includes("qr") ||
    pedido.pago.metodo?.toLowerCase().includes("transferencia");

  // Hay un pago registrado (el cliente subió comprobante o confirmó efectivo) pero
  // aún no fue verificado por el admin: solo entonces se muestra el botón.
  const hayPagoPendienteDeVerificar = Boolean(pedido.pago.metodo) && !pedido.pago.verificado;

  const estadoActualConfig = PAGO_CONFIG[pedido.pago.estado] || PAGO_CONFIG.sin_pagar;

  return (
    <SeccionModal titulo="Control de Pago" icono="card-outline" theme={theme}>
      <View
        style={[
          styles.cardContenedor,
          { backgroundColor: theme.bgSecondary || "#F9FAFB", borderColor: theme.border || "#E5E7EB" },
        ]}
      >
        <View style={styles.encabezadoRow}>
          <View style={styles.metodoInfoGroup}>
            <View style={[styles.metodoIconoCircle, { backgroundColor: theme.primary + "15" }]}>
              <Ionicons name={esMetodoQr ? "qr-code-outline" : "cash-outline"} size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.metodoLabelSub, { color: theme.textSecondary }]}>Método registrado</Text>
              <Text style={[styles.metodoNombre, { color: theme.textPrimary }]}>
                {pedido.pago.metodo ? pedido.pago.metodo.toUpperCase() : "SIN MÉTODO"}
              </Text>
            </View>
          </View>

          <View style={[styles.pagoEstadoBadge, { backgroundColor: estadoActualConfig.color }]}>
            <Ionicons name={PAGO_ICONOS[pedido.pago.estado]} size={13} color="#FFFFFF" />
            <Text style={styles.pagoEstadoBadgeText}>{estadoActualConfig.label}</Text>
          </View>
        </View>

        <View style={[styles.divisor, { backgroundColor: theme.border || "#E5E7EB" }]} />

        <View style={styles.desgloseContenedor}>
          <FilaDetalle theme={theme} label="Total" valor={formatBs(pedido.pago.total)} icono="calculator-outline" />
          <FilaDetalle theme={theme} label="Cobrado" valor={formatBs(pedido.pago.montoCobrado)} icono="wallet-outline" />
          <FilaDetalle
            theme={theme}
            label="Saldo pendiente"
            valor={formatBs(saldoPendiente)}
            destacado={saldoPendiente > 0}
            icono="hourglass-outline"
          />
        </View>

        {esMetodoQr && (
          <View style={styles.seccionComprobanteWrapper}>
            <Text style={[styles.comprobanteLabel, { color: theme.textSecondary }]}>
              Comprobante adjunto por el cliente
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.comprobanteBox, { backgroundColor: theme.bgPrimary || "#FFFFFF", borderColor: theme.border || "#E5E7EB" }]}
              onPress={() => imagenComprobante && setModalImagenVisible(true)}
              disabled={!imagenComprobante}
            >
              {imagenComprobante ? (
                <>
                  <Image source={{ uri: imagenComprobante }} style={styles.comprobanteImage} resizeMode="cover" />
                  <View style={styles.overlayAmpliar}>
                    <Ionicons name="scan-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.overlayAmpliarText}>Tocar para ampliar</Text>
                  </View>
                </>
              ) : (
                <View style={styles.comprobantePlaceholder}>
                  <Ionicons name="image-outline" size={28} color={theme.textSecondary || "#9CA3AF"} />
                  <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                    Aún no hay comprobante del cliente
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de verificación: solo aparece si hay un pago pendiente de verificar */}
        {hayPagoPendienteDeVerificar && (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={cargandoConfirmacion || pedido.pago.total <= 0}
    style={[
      styles.confirmarBtn,
      { backgroundColor: pedido.pago.total > 0 ? "#10B981" : "#9CA3AF" },
      cargandoConfirmacion && { opacity: 0.7 }
    ]}
    onPress={onVerificarPago}
  >
    {cargandoConfirmacion ? (
      <ActivityIndicator color="#FFFFFF" size="small" />
    ) : (
      <>
        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
        <Text style={styles.confirmarBtnText}>
          {pedido.pago.total > 0
            ? "Verificar pago y pasar a producción"
            : "Monto total inválido (0 Bs)"}
        </Text>
      </>
    )}
  </TouchableOpacity>
)}

        {/* Una vez verificado, se muestra un estado final en vez del botón */}
        {pedido.pago.verificado && (
          <View style={styles.verificadoBanner}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.verificadoBannerText}>Pago verificado</Text>
          </View>
        )}
      </View>

      <Modal visible={modalImagenVisible} transparent animationType="fade" onRequestClose={() => setModalImagenVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalImagenVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableOpacity style={styles.modalCerrarBtn} onPress={() => setModalImagenVisible(false)}>
              <Ionicons name="close-circle" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableWithoutFeedback>
              <View style={styles.modalImagenWrapper}>
                {imagenComprobante && (
                  <Image source={{ uri: imagenComprobante }} style={styles.modalImagenFull} resizeMode="contain" />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  cardContenedor: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 4 },
  encabezadoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metodoInfoGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  metodoIconoCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  metodoLabelSub: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  metodoNombre: { fontSize: 13, fontWeight: "700" },
  pagoEstadoBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pagoEstadoBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  divisor: { height: 1, marginVertical: 12 },
  desgloseContenedor: { gap: 4 },
  seccionComprobanteWrapper: { marginTop: 14, alignItems: "center" },
  comprobanteLabel: { fontSize: 11, fontWeight: "600", marginBottom: 8 },
  comprobanteBox: { width: "80%", height: 140, borderRadius: 12, borderWidth: 1, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  comprobanteImage: { width: "100%", height: "100%" },
  overlayAmpliar: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  overlayAmpliarText: { color: "#FFFFFF", fontSize: 9.5, fontWeight: "600" },
  comprobantePlaceholder: { alignItems: "center", justifyContent: "center", gap: 4 },
  placeholderText: { fontSize: 11, fontWeight: "500" },
  confirmarBtn: { flexDirection: "row", gap: 6, borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 14 },
  confirmarBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  verificadoBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#10B98122" },
  verificadoBannerText: { color: "#10B981", fontSize: 13, fontWeight: "700" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCerrarBtn: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  modalImagenWrapper: { width: "100%", height: "80%", justifyContent: "center", alignItems: "center" },
  modalImagenFull: { width: "100%", height: "100%" },
});