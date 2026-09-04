// src/features/pedidos/components/modal/PagoSeccion.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PAGO_CONFIG } from "../../constants";
import { EstadoPago, Pedido } from "../../types";
import { formatBs } from "../../utils/formato";
import { AccionBoton } from "./AccionBoton";
import { FilaDetalle } from "./FilaDetalle";
import { SeccionModal } from "./SeccionModal";

interface PagoSeccionProps {
  theme: any;
  pedido: Pedido;
  onSubirComprobante: () => void;
  onRecordarCobro: () => void;
  onConfirmarPagoEfectivo?: () => void;
  qrUrl?: string;
  cargandoComprobante?: boolean;
  generandoPdf?: boolean;
  cargandoConfirmacion?: boolean;
}

type MetodoPago = "efectivo" | "qr";

const PAGO_ICONOS: Record<EstadoPago, keyof typeof Ionicons.glyphMap> = {
  sin_pagar: "alert-circle-outline",
  anticipo: "time-outline",
  pagado: "checkmark-circle-outline",
};

export function PagoSeccion({
  theme,
  pedido,
  onSubirComprobante,
  onRecordarCobro,
  onConfirmarPagoEfectivo,
  qrUrl,
  cargandoComprobante = false,
  generandoPdf = false,
  cargandoConfirmacion = false,
}: PagoSeccionProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] =
    useState<MetodoPago>("efectivo");

  const saldoPendiente = Math.max(
    0,
    pedido.pago.total - pedido.pago.montoCobrado,
  );

  const estaPendiente = pedido.pago.estado !== "pagado" || saldoPendiente > 0;

  return (
    <SeccionModal titulo="Control de Pago" icono="card-outline" theme={theme}>
      {/* Chips de Estado de Pago con Iconos */}
      <View style={styles.pagoEstadoRow}>
        {(Object.keys(PAGO_CONFIG) as EstadoPago[]).map((key) => {
          const esSeleccionado = pedido.pago.estado === key;
          return (
            <View
              key={key}
              style={[
                styles.pagoEstadoChip,
                {
                  backgroundColor: esSeleccionado
                    ? PAGO_CONFIG[key].color
                    : theme.bgPrimary,
                },
              ]}
            >
              <Ionicons
                name={PAGO_ICONOS[key]}
                size={13}
                color={esSeleccionado ? "#ffffff" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.pagoEstadoChipText,
                  {
                    color: esSeleccionado ? "#ffffff" : theme.textSecondary,
                  },
                ]}
              >
                {PAGO_CONFIG[key].label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Contenedor Métodos de Pago */}
      <View
        style={[
          styles.metodoCard,
          {
            backgroundColor: theme.bgSecondary || "#F9FAFB",
            borderColor: theme.border || "#E5E7EB",
          },
        ]}
      >
        <Text style={[styles.metodoTitulo, { color: theme.textPrimary }]}>
          Métodos de pago
        </Text>

        {/* Tabs de Selección */}
        <View
          style={[
            styles.tabsContainer,
            { backgroundColor: theme.bgPrimary || "#FFFFFF" },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              metodoSeleccionado === "efectivo" && [
                styles.tabBtnActivo,
                { backgroundColor: theme.primary },
              ],
            ]}
            onPress={() => setMetodoSeleccionado("efectivo")}
          >
            <Ionicons
              name="cash-outline"
              size={15}
              color={
                metodoSeleccionado === "efectivo"
                  ? "#FFFFFF"
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    metodoSeleccionado === "efectivo"
                      ? "#FFFFFF"
                      : theme.textSecondary,
                },
              ]}
            >
              Efectivo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              metodoSeleccionado === "qr" && [
                styles.tabBtnActivo,
                { backgroundColor: theme.primary },
              ],
            ]}
            onPress={() => setMetodoSeleccionado("qr")}
          >
            <Ionicons
              name="qr-code-outline"
              size={15}
              color={
                metodoSeleccionado === "qr" ? "#FFFFFF" : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    metodoSeleccionado === "qr"
                      ? "#FFFFFF"
                      : theme.textSecondary,
                },
              ]}
            >
              Pago QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido Efectivo */}
        {metodoSeleccionado === "efectivo" ? (
          <View style={styles.tabContent}>
            <FilaDetalle
              theme={theme}
              label="Total"
              valor={formatBs(pedido.pago.total)}
              icono="calculator-outline"
            />
            <FilaDetalle
              theme={theme}
              label="Cobrado"
              valor={formatBs(pedido.pago.montoCobrado)}
              icono="wallet-outline"
            />
            <FilaDetalle
              theme={theme}
              label="Saldo pendiente"
              valor={formatBs(saldoPendiente)}
              destacado={saldoPendiente > 0}
              icono="hourglass-outline"
            />

            {estaPendiente && (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={cargandoConfirmacion}
                style={[
                  styles.confirmarBtn,
                  { backgroundColor: "#10B981" },
                  cargandoConfirmacion && { opacity: 0.7 },
                ]}
                onPress={onConfirmarPagoEfectivo}
              >
                {cargandoConfirmacion ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.confirmarBtnText}>
                      Confirmar Pedido
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Contenido QR */
          <View style={styles.tabContent}>
            <View style={styles.qrGridRow}>
              <View style={styles.qrInfoCol}>
                <FilaDetalle
                  theme={theme}
                  label="Total"
                  valor={formatBs(pedido.pago.total)}
                  icono="calculator-outline"
                />
                <FilaDetalle
                  theme={theme}
                  label="Cobrado"
                  valor={formatBs(pedido.pago.montoCobrado)}
                  icono="wallet-outline"
                />
                <FilaDetalle
                  theme={theme}
                  label="Saldo pendiente"
                  valor={formatBs(saldoPendiente)}
                  destacado={saldoPendiente > 0}
                  icono="hourglass-outline"
                />
              </View>

              <View
                style={[
                  styles.qrContainer,
                  {
                    backgroundColor: "#FFFFFF",
                    borderColor: theme.border || "#E5E7EB",
                  },
                ]}
              >
                {qrUrl ? (
                  <Image
                    source={{ uri: qrUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Ionicons
                      name="qr-code-outline"
                      size={24}
                      color="#9CA3AF"
                    />
                    <Text style={styles.qrPlaceholderText}>
                      QR no disponible
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {estaPendiente && (
              <View style={styles.accionesRow}>
                <AccionBoton
                  theme={theme}
                  icono="cloud-upload-outline"
                  label={
                    cargandoComprobante ? "Subiendo..." : "Subir Comprobante"
                  }
                  color="#2563EB"
                  onPress={onSubirComprobante}
                  disabled={cargandoComprobante || generandoPdf}
                  cargando={cargandoComprobante}
                />

                <AccionBoton
                  theme={theme}
                  icono="document-text-outline"
                  label={
                    generandoPdf ? "Generando..." : "Recordar Cobro (PDF)"
                  }
                  color="#F59E0B"
                  onPress={onRecordarCobro}
                  disabled={cargandoComprobante || generandoPdf}
                  cargando={generandoPdf}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  pagoEstadoRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  pagoEstadoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pagoEstadoChipText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  metodoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  metodoTitulo: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActivo: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabContent: {
    gap: 4,
  },
  confirmarBtn: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  confirmarBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  qrGridRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qrInfoCol: {
    flex: 1,
  },
  qrContainer: {
    width: 95,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  qrPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  qrPlaceholderText: {
    fontSize: 9.5,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "600",
  },
  accionesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});