// app/(tabs)/pedidos.tsx
// Panel de pedidos — JEDD3DLAB

import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";
import {
  DetallePedidoModal,
  Pedido,
  PedidoCard,
  PedidosEmptyState,
  PedidosHeader,
  usePedidoActions,
  usePedidos,
} from "@/features/pedidos";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    cargando,
  } = usePedidos();

  // Desestructuración de acciones requeridas por la vista y el modal
  const {
    cambiarEstado,
    marcarComoPagado,
    confirmarVerificacionPago,
    toggleChecklist,
    abrirWhatsapp,
    llamarCliente,
    cargandoConfirmacion,
  } = usePedidoActions(actualizarPedidoLocal, recargar);

  const { configuracionRaw } = useConfiguracionTaller();

  const pedidoActivoActualizado = pedidoActivo
    ? (pedidosFiltrados.find((p) => p.id === pedidoActivo.id) ?? pedidoActivo)
    : null;

  const getEmptyStateProps = () => {
    switch (filtro) {
      case "entregado":
        return {
          icono: "checkmark-done-circle-outline" as const,
          mensaje: "Sin pedidos completados",
          subtitulo: "Los pedidos finalizados aparecerán aquí automáticamente",
          accionSugerida:
            "Los pedidos se completan desde el detalle de cada uno",
        };
      case "en_impresion":
        return {
          icono: "time-outline" as const,
          mensaje: "Sin pedidos en progreso",
          subtitulo: "Los pedidos que estás fabricando se mostrarán aquí",
          accionSugerida: "Inicia un pedido desde el detalle para verlo aquí",
        };
      case "listo":
        return {
          icono: "alert-circle-outline" as const,
          mensaje: "Sin pedidos urgentes",
          subtitulo: "Los pedidos marcados como urgentes aparecerán aquí",
          accionSugerida: "Marca un pedido como urgente desde su detalle",
        };
      case "pendiente":
        return {
          icono: "cash-outline" as const,
          mensaje: "Sin pedidos pendientes de pago",
          subtitulo:
            "Los pedidos que esperan confirmación de pago se listan aquí",
          accionSugerida: "Los pedidos se marcan como pagados desde el detalle",
        };
      default:
        return {
          icono: "file-tray-outline" as const,
          mensaje: "No hay pedidos registrados",
          subtitulo: "Comienza creando tu primer pedido desde la cotización",
          accionSugerida: "Crea un pedido desde el módulo de cotización",
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
        refreshing={cargando}
        onRefresh={recargar}
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
        onClose={() => setPedidoActivo(null)}
        onCambiarEstado={cambiarEstado}
        onToggleChecklist={toggleChecklist}
        onVerificarPago={confirmarVerificacionPago}
        onLlamar={llamarCliente}
        onWhatsapp={abrirWhatsapp}
        cargandoConfirmacion={cargandoConfirmacion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
});
