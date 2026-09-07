// src/features/pedidos/components/PedidoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ENVIO_CONFIG,
  PAGO_CONFIG,
  PRIORIDAD_CONFIG,
  estadoConfig,
} from "../constants";
import { EstadoPago, Pedido } from "../types";
import { calcularPrioridad } from "../utils/fechas";
import { formatBs } from "../utils/formato";

interface PedidoCardProps {
  theme: any;
  pedido: Pedido;
  onPress: () => void;
}

const PAGO_ICONOS: Record<EstadoPago, keyof typeof Ionicons.glyphMap> = {
  sin_pagar: "alert-circle",
  anticipo: "time",
  pagado: "checkmark-circle",
};

const METODO_PAGO_ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  efectivo: "cash-outline",
  qr: "qr-code-outline",
  transferencia: "card-outline",
};

const TIPO_ENVIO_ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  domicilio: "bicycle-outline",
  recoger: "storefront-outline",
  pickup: "storefront-outline",
  local: "storefront-outline",
};

export function PedidoCard({ theme, pedido, onPress }: PedidoCardProps) {
  const estadoCfg = estadoConfig(pedido.estado);
  const pagoCfg = PAGO_CONFIG[pedido.pago.estado];
  const prioridad = calcularPrioridad(pedido.fechaEntregaISO, pedido.estado);
  const prioridadCfg = PRIORIDAD_CONFIG[prioridad];

  const checklistHecho = pedido.envio.checklist.filter((c) => c.hecho).length;
  const checklistTotal = pedido.envio.checklist.length;
  const progreso = checklistTotal > 0 ? checklistHecho / checklistTotal : 0;

  const iconoMetodoPago =
    METODO_PAGO_ICONOS[pedido.pago.metodo?.toLowerCase() ?? ""] || "wallet-outline";
  const iconoTipoEnvio =
    TIPO_ENVIO_ICONOS[pedido.envio.tipo?.toLowerCase() ?? ""] ||
    ENVIO_CONFIG[pedido.envio.tipo]?.icono ||
    "cube-outline";

  const imagenUri =
  pedido.fotoFinalUrl ||
  pedido.fotoCotizacionUrl ||
  "https://images.unsplash.com/photo-1615840243388-00133c921503?q=80&w=600&auto=format&fit=crop";

  const handleAbrirWhatsapp = (e: any) => {
    e.stopPropagation();
    if (!pedido.cliente.telefono) return;
    const numeroLimpio = pedido.cliente.telefono.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${numeroLimpio}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.bgSecondary },
        prioridad !== "normal" && {
          borderWidth: 1.5,
          borderColor: prioridadCfg.color + "66",
        },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* 1. SECCIÓN SUPERIOR: IMAGEN CON ELEMENTOS SUPERPUESTOS */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imagenUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Fila superior superpuesta */}
        <View style={styles.topOverlayRow}>
          <View style={styles.codigoBadge}>
            <Ionicons name="pricetag" size={10} color="#FFFFFF" />
            <Text style={styles.codigoBadgeText}>{pedido.codigo}</Text>
          </View>

          <View style={[styles.estadoBadge, { backgroundColor: estadoCfg.color }]}>
            <Ionicons name={estadoCfg.icono} size={11} color="#FFFFFF" />
            <Text style={styles.estadoBadgeText}>{estadoCfg.label}</Text>
          </View>
        </View>

        {/* Fila inferior superpuesta */}
        <View style={styles.bottomOverlayRow}>
          <Text style={styles.nombrePiezaText} numberOfLines={1}>
            {pedido.pieza}
          </Text>

          <View style={[styles.pagoBadgeOverlay, { backgroundColor: pagoCfg.color }]}>
            <Ionicons
              name={PAGO_ICONOS[pedido.pago.estado]}
              size={11}
              color="#FFFFFF"
            />
            <Text style={styles.pagoBadgeText}>
              {pagoCfg.label}
              {pedido.pago.estado === "anticipo" &&
                ` (${pedido.pago.anticipoPorcentaje}%)`}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. SECCIÓN CLIENTE Y ACCIÓN WHATSAPP */}
      <View style={styles.clienteRow}>
        <Ionicons name="person-circle-outline" size={18} color={theme.textPrimary} />
        <Text
          style={[styles.clienteNombre, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {pedido.cliente.nombre}
        </Text>

        {pedido.cliente.recurrente && (
          <View
            style={[
              styles.recurrenteBadge,
              { backgroundColor: theme.primary + "1A" },
            ]}
          >
            <Ionicons name="star" size={9} color={theme.primary} />
            <Text style={[styles.recurrenteBadgeText, { color: theme.primary }]}>
              Frecuente
            </Text>
          </View>
        )}

        {Boolean(pedido.cliente.telefono) && (
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleAbrirWhatsapp}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. BARRA DE CARGA / CHECKLIST */}
      {checklistTotal > 0 && (
        <View style={styles.progresoRow}>
          <Ionicons name="checkbox-outline" size={12} color={theme.textSecondary} />
          <View style={[styles.progresoTrack, { backgroundColor: theme.bgPrimary }]}>
            <View
              style={[
                styles.progresoFill,
                {
                  width: `${progreso * 100}%`,
                  backgroundColor: progreso === 1 ? "#22C55E" : theme.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progresoTexto, { color: theme.textSecondary }]}>
            {checklistHecho}/{checklistTotal}
          </Text>
        </View>
      )}

      {/* 4. SECCIÓN INFERIOR: FECHA, ENVÍO, MÉTODO Y PRECIOS */}
      <View
        style={[
          styles.footerContainer,
          {
            borderTopColor: theme.border + "30",
            backgroundColor: theme.bgPrimary + "50",
          },
        ]}
      >
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={prioridad !== "normal" ? prioridadCfg.color : theme.textSecondary}
          />
          <Text
            style={[
              styles.metaText,
              {
                color: prioridad !== "normal" ? prioridadCfg.color : theme.textSecondary,
                fontWeight: prioridad !== "normal" ? "700" : "500",
              },
            ]}
          >
            {pedido.fechaEntregaTexto}
          </Text>
        </View>

        <View style={styles.footerRightGroup}>
          <View style={styles.metaItem}>
            <Ionicons name={iconoTipoEnvio} size={14} color={theme.textSecondary} />
          </View>

          <View style={styles.metaItem}>
            <Ionicons name={iconoMetodoPago} size={14} color={theme.textSecondary} />
          </View>

          <View style={styles.pagoMontoContainer}>
            <Text style={[styles.montoPagadoText, { color: theme.textSecondary }]}>
              {pedido.pago.montoCobrado || 0}
            </Text>

            <Text style={[styles.separadorText, { color: theme.textSecondary }]}>
              /
            </Text>

            <Text style={[styles.montoTotalText, { color: theme.primary }]}>
              {pedido.pago.total}
            </Text>

            <Text style={[styles.monedaText, { color: theme.primary }]}>
              Bs
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 4,
  },
  imageContainer: {
    height: 140,
    width: "100%",
    position: "relative",
    backgroundColor: "#1E293B",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  topOverlayRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codigoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codigoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
  },
  estadoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  bottomOverlayRow: {
    position: "absolute",
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nombrePiezaText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagoBadgeOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 1,
  },
  pagoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  clienteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  clienteNombre: {
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
  recurrenteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recurrenteBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  whatsappBtn: {
    padding: 2,
    marginLeft: 4,
  },
  progresoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  progresoTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progresoFill: {
    height: "100%",
    borderRadius: 2,
  },
  progresoTexto: {
    fontSize: 10,
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
  },
  pagoMontoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  montoPagadoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  separadorText: {
    fontSize: 12,
    fontWeight: "400",
  },
  montoTotalText: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  monedaText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 2,
  },
});