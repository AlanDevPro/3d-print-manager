// app/(tabs)/pedidos.tsx
// Panel de pedidos — JEDD3DLAB

import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DetallePedidoModal,
  Pedido,
  PedidoCard,
  PedidosEmptyState,
  PedidosHeader,
  usePedidoActions,
  usePedidos,
} from "@/features/pedidos";

import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";

export default function PedidosScreen() {
  const { theme } = useTheme();
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);

  const {
    conteos,
    kpis,
    pedidosUrgentes,
    pedidosFiltrados,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    recargar,
    actualizarPedidoLocal,
  } = usePedidos();

  const {
    cambiarEstado,
    marcarComoPagado,
    toggleChecklist,
    abrirWhatsapp,
    llamarCliente,
  } = usePedidoActions(actualizarPedidoLocal, recargar);

  const { configuracionRaw } = useConfiguracionTaller();

  const pedidoActivoActualizado = pedidoActivo
    ? (pedidosFiltrados.find((p) => p.id === pedidoActivo.id) ?? pedidoActivo)
    : null;

  const qrUrl =
    configuracionRaw?.qr_pago_url ??
    configuracionRaw?.qr_url ??
    configuracionRaw?.url_qr ??
    undefined;

  // Determinar qué icono y mensaje mostrar según el filtro activo
  const getEmptyStateProps = () => {
    switch (filtro) {
      case "completados":
        return {
          icono: "checkmark-done-circle-outline" as const,
          mensaje: "Sin pedidos completados",
          subtitulo: "Los pedidos finalizados aparecerán aquí automáticamente",
          accionSugerida: "Los pedidos se completan desde el detalle de cada uno"
        };
      case "en-progreso":
        return {
          icono: "time-outline" as const,
          mensaje: "Sin pedidos en progreso",
          subtitulo: "Los pedidos que estás fabricando se mostrarán aquí",
          accionSugerida: "Inicia un pedido desde el detalle para verlo aquí"
        };
      case "urgentes":
        return {
          icono: "alert-circle-outline" as const,
          mensaje: "Sin pedidos urgentes",
          subtitulo: "Los pedidos marcados como urgentes aparecerán aquí",
          accionSugerida: "Marca un pedido como urgente desde su detalle"
        };
      case "pendientes-pago":
        return {
          icono: "cash-outline" as const,
          mensaje: "Sin pedidos pendientes de pago",
          subtitulo: "Los pedidos que esperan confirmación de pago se listan aquí",
          accionSugerida: "Los pedidos se marcan como pagados desde el detalle"
        };
      default:
        return {
          icono: "file-tray-outline" as const,
          mensaje: "No hay pedidos registrados",
          subtitulo: "Comienza creando tu primer pedido desde la cotización",
          accionSugerida: "Crea un pedido desde el módulo de cotización"
        };
    }
  };

  const emptyStateProps = getEmptyStateProps();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <PedidosHeader
            theme={theme}
            totalPedidos={conteos.todos ?? 0}
            kpis={kpis}
            pedidosUrgentes={pedidosUrgentes}
            onSeleccionarPedido={setPedidoActivo}
            busqueda={busqueda}
            onCambiarBusqueda={setBusqueda}
            filtro={filtro}
            conteos={conteos}
            onCambiarFiltro={setFiltro}
          />
        }
        renderItem={({ item }) => (
          <PedidoCard
            theme={theme}
            pedido={item}
            onPress={() => setPedidoActivo(item)}
          />
        )}
        ListEmptyComponent={
          <PedidosEmptyState 
            theme={theme}
            icono={emptyStateProps.icono}
            mensaje={emptyStateProps.mensaje}
            subtitulo={emptyStateProps.subtitulo}
            accionSugerida={emptyStateProps.accionSugerida}
          />
        }
      />

      <DetallePedidoModal
        pedido={pedidoActivoActualizado}
        theme={theme}
        qrUrl={qrUrl}
        onClose={() => setPedidoActivo(null)}
        onCambiarEstado={cambiarEstado}
        onToggleChecklist={toggleChecklist}
        onMarcarPagado={marcarComoPagado}
        onLlamar={llamarCliente}
        onWhatsapp={abrirWhatsapp}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
});