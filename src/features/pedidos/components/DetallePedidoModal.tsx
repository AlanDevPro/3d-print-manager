// src/features/pedidos/components/DetallePedidoModal.tsx
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEmpresaActual } from "@/context/EmpresaContext";
import { fetchEmpresaContacto } from "../services/pedidosService";
import { EstadoPedido, Pedido } from "../types";
import { ClienteSeccion } from "./modal/ClienteSeccion";
import { EnvioSeccion } from "./modal/EnvioSeccion";
import { EstadoSelector } from "./modal/EstadoSelector";
import { HistorialSeccion } from "./modal/HistorialSeccion";
import { PagoSeccion } from "./modal/PagoSeccion";
import { SeccionPedidoEnImpresion } from "./modal/SeccionPedidoEnImpresion";

// Tiempo que se deja visible el banner de "pago verificado" antes de cerrar
// el modal automáticamente. Ajustable en un solo lugar.
const MS_AUTOCIERRE_TRAS_VERIFICAR = 2200;

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  theme: any;
  onClose: () => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
  onToggleChecklist: (pedido: Pedido, itemId: string) => void;
  onVerificarPago: (pedido: Pedido) => void;
  onLlamar: (pedido: Pedido) => void;
  onWhatsapp: (pedido: Pedido, mensaje: string) => void;
  cargandoConfirmacion?: boolean;
  onRecargar?: () => Promise<void> | void;
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
  onRecargar,
}: DetallePedidoModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const verificadoAnteriorRef = useRef<boolean | undefined>(undefined);
  const autocierreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { empresaId } = useEmpresaActual();
  const [contacto, setContacto] = useState<{
    ubicacionUrl: string | null;
    qrPagoUrl: string | null;
  }>({
    ubicacionUrl: null,
    qrPagoUrl: null,
  });

  const snapPoints = useMemo(() => ["90%"], []);

  useEffect(() => {
    if (pedido) {
      const timeout = setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 0);
      return () => clearTimeout(timeout);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [pedido]);

  // Carga de URLs de contacto y QR de la empresa
  useEffect(() => {
    if (!empresaId || !pedido) return;
    fetchEmpresaContacto(empresaId)
      .then(setContacto)
      .catch(() => {});
  }, [empresaId, pedido?.id]);

  // Autocierre: cuando el pago pasa de "no verificado" a "verificado",
  // dejamos que el usuario vea el banner de confirmación dentro de
  // PagoSeccion durante un momento antes de cerrar el modal.
  useEffect(() => {
    const verificadoActual = pedido?.pago.verificado;

    if (
      pedido &&
      verificadoActual === true &&
      verificadoAnteriorRef.current === false
    ) {
      autocierreTimeoutRef.current = setTimeout(() => {
        bottomSheetRef.current?.close();
      }, MS_AUTOCIERRE_TRAS_VERIFICAR);
    }

    verificadoAnteriorRef.current = verificadoActual;

    return () => {
      if (autocierreTimeoutRef.current) {
        clearTimeout(autocierreTimeoutRef.current);
        autocierreTimeoutRef.current = null;
      }
    };
  }, [pedido, pedido?.pago.verificado]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme?.bgPrimary }}
      handleIndicatorStyle={styles.modalHandle}
    >
      {pedido ? (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera: Código e Indicador de cliente frecuente */}
          <View style={styles.modalTopRow}>
            <View style={styles.codigoBadge}>
              <Ionicons
                name="barcode-outline"
                size={14}
                color={theme?.textSecondary}
              />
              <Text
                style={[
                  styles.modalCodigo,
                  { color: theme?.textSecondary },
                ]}
              >
                {pedido.codigo ?? "SIN CÓDIGO"}
              </Text>
            </View>

            {pedido.cliente?.recurrente && (
              <View
                style={[
                  styles.recurrenteBadge,
                  { backgroundColor: (theme?.primary ?? "#000") + "1A" },
                ]}
              >
                <Ionicons
                  name="star"
                  size={11}
                  color={theme?.primary}
                />
                <Text
                  style={[
                    styles.recurrenteBadgeText,
                    { color: theme?.primary },
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
              color={theme?.primary}
            />
            <Text
              style={[styles.modalPieza, { color: theme?.textPrimary }]}
            >
              {pedido.pieza ?? "Pieza sin nombre"}
            </Text>
          </View>

          {/* Fecha límite de entrega */}
          <View style={styles.fechaRow}>
            <Ionicons
              name="calendar-clear-outline"
              size={13}
              color={theme?.textSecondary}
            />
            <Text
              style={[
                styles.modalFecha,
                { color: theme?.textSecondary },
              ]}
            >
              Entrega: {pedido.fechaEntregaTexto ?? "Por definir"}
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
            ubicacionLocalUrl={contacto.ubicacionUrl}
            onLlamar={() => onLlamar(pedido)}
            onWhatsapp={() =>
              onWhatsapp(
                pedido,
                `Hola ${pedido.cliente?.nombre ?? ""}, te escribimos de JEDD3DLAB sobre tu pedido ${pedido.codigo ?? ""}.`
              )
            }
          />

          <PagoSeccion
            theme={theme}
            pedido={pedido}
            qrPagoUrl={contacto.qrPagoUrl}
            onVerificarPago={() => onVerificarPago(pedido)}
            onEntregaConfirmada={async () => {
              bottomSheetRef.current?.close();
              onClose();
              if (onRecargar) {
                await onRecargar();
              }
            }}
            cargandoConfirmacion={cargandoConfirmacion}
          />

          {pedido.estado === "en_impresion" && (
            <SeccionPedidoEnImpresion
              theme={theme}
              pedido={pedido}
              onCambio={async () => {
                if (onRecargar) {
                  await onRecargar();
                }
              }}
            />
          )}

          <EnvioSeccion
            theme={theme}
            pedido={pedido}
            onToggleChecklist={(itemId) => onToggleChecklist(pedido, itemId)}
          />

          <HistorialSeccion theme={theme} pedido={pedido} />

          <TouchableOpacity
            style={styles.cerrarBtn}
            onPress={() => bottomSheetRef.current?.close()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={theme?.textSecondary}
            />
            <Text
              style={[
                styles.cerrarBtnText,
                { color: theme?.textSecondary },
              ]}
            >
              Cerrar
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      ) : (
        <View />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#00000033",
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