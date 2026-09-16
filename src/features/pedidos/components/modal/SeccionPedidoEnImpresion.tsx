// src/features/pedidos/components/modal/SeccionPedidoEnImpresion.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useImpresionPedido } from "../../hooks/useImpresionPedido";
import { Pedido } from "../../types";
import { SeccionModal } from "./SeccionModal";

interface SeccionPedidoEnImpresionProps {
  theme: any;
  pedido: Pedido;
  onCambio: () => Promise<void>;
}

export function SeccionPedidoEnImpresion({
  theme,
  pedido,
  onCambio,
}: SeccionPedidoEnImpresionProps) {
  const { progreso, gramosActuales, horasActuales, imprimiendo, cargando, iniciar, marcarFallida } =
    useImpresionPedido(pedido, onCambio);

  const impresion = pedido.impresion;

  // Manejo seguro por si no existe la información de impresión
  if (!impresion) {
    return null;
  }

  const yaFallo = impresion.intentoActual?.resultado === "fallido";
  const horaActualTexto = formatHoras(horasActuales);
  const horaTotalTexto = formatHoras(impresion.tiempoImpresionHoras);

  return (
    <SeccionModal titulo="Pedido en impresión" icono="print-outline" theme={theme}>
      <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        <Fila
          theme={theme}
          icono="cube-outline"
          texto={pedido.pieza}
          valorDerecha={`${impresion.unidadesPieza} und.`}
        />
        <Fila
          theme={theme}
          icono="print-outline"
          texto="Impresora"
          valorDerecha={impresion.impresoraNombre ?? "Sin asignar"}
        />
        <Fila
          theme={theme}
          icono="color-palette-outline"
          texto="Filamento"
          valorDerecha={
            impresion.filamentoMaterial
              ? `${impresion.filamentoMaterial} - ${impresion.filamentoColor ?? ""}`
              : "Sin asignar"
          }
        />
        <Fila
          theme={theme}
          icono="scale-outline"
          texto={`${gramosActuales}g / ${impresion.gramosImpresion}g`}
          iconoDerecha="time-outline"
          valorDerecha={`${horaActualTexto} / ${horaTotalTexto}`}
        />

        <View style={[styles.progresoTrack, { backgroundColor: theme.bgPrimary }]}>
          <View
            style={[
              styles.progresoFill,
              {
                width: `${Math.round(progreso * 100)}%`,
                backgroundColor: progreso >= 1 ? "#22C55E" : theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progresoTexto, { color: theme.textSecondary }]}>
          {Math.round(progreso * 100)}% completado
        </Text>

        {!imprimiendo ? (
          <TouchableOpacity
            style={[styles.accionBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
            disabled={cargando}
            onPress={iniciar}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accionBtnText}>
                  {yaFallo ? "Imprimir nuevamente" : "Iniciar impresión"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.accionBtn, { backgroundColor: "#EF4444" }]}
            activeOpacity={0.85}
            disabled={cargando}
            onPress={marcarFallida}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="alert-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.accionBtnText}>Impresión fallida</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SeccionModal>
  );
}

function formatHoras(horasDecimal: number) {
  const horas = Math.floor(horasDecimal);
  const minutos = Math.round((horasDecimal - horas) * 60);
  return `${horas}h ${minutos}min`;
}

function Fila({
  theme,
  icono,
  texto,
  valorDerecha,
  iconoDerecha,
}: {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  texto: string;
  valorDerecha: string;
  iconoDerecha?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fila}>
      <View style={styles.filaIzquierda}>
        <Ionicons name={icono} size={15} color={theme.textSecondary} />
        <Text style={[styles.filaTexto, { color: theme.textPrimary }]} numberOfLines={1}>
          {texto}
        </Text>
      </View>
      <View style={styles.filaDerecha}>
        {iconoDerecha && <Ionicons name={iconoDerecha} size={14} color={theme.textSecondary} />}
        <Text style={[styles.filaValor, { color: theme.textSecondary }]}>{valorDerecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10, marginTop: 4 },
  fila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filaIzquierda: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  filaDerecha: { flexDirection: "row", alignItems: "center", gap: 4 },
  filaTexto: { fontSize: 13, fontWeight: "600" },
  filaValor: { fontSize: 12.5, fontWeight: "600" },
  progresoTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginTop: 4 },
  progresoFill: { height: "100%", borderRadius: 4 },
  progresoTexto: { fontSize: 11, fontWeight: "600", textAlign: "right" },
  accionBtn: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  accionBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});