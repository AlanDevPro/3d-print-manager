import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { estadoConfig } from "../constants";
import {
  actualizarEstadoPedido,
  marcarPedidoComoPagado,
  toggleChecklistItem as toggleChecklistItemService,
  verificarPagoPedido as verificarPagoPedidoService,
} from "../services/pedidosService";
import { EstadoPedido, MetodoPago, Pedido } from "../types";

export function usePedidoActions(
  actualizarPedidoLocal: (id: string, cambios: Partial<Pedido>) => void,
  recargar: () => Promise<void>,
) {
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [cargandoConfirmacion, setCargandoConfirmacion] = useState(false);

  const cambiarEstado = useCallback(
    async (pedido: Pedido, nuevoEstado: EstadoPedido) => {
      const estadoAnterior = pedido.estado;
      actualizarPedidoLocal(pedido.id, { estado: nuevoEstado });
      try {
        setErrorAccion(null);
        await actualizarEstadoPedido(pedido.id, nuevoEstado);
        await recargar();
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, { estado: estadoAnterior });
        setErrorAccion(
          e.message?.includes("anticipo")
            ? e.message
            : "No se pudo cambiar el estado del pedido.",
        );
      }
    },
    [actualizarPedidoLocal, recargar],
  );

  const marcarComoPagado = useCallback(
    async (pedido: Pedido, metodo: MetodoPago = "efectivo") => {
      const saldo = pedido.pago.total - pedido.pago.montoCobrado;
      if (saldo <= 0) return;
      actualizarPedidoLocal(pedido.id, {
        pago: {
          ...pedido.pago,
          estado: "pagado",
          montoCobrado: pedido.pago.total,
        },
      });
      try {
        setErrorAccion(null);
        await marcarPedidoComoPagado(pedido.id, saldo, metodo);
        await recargar();
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, { pago: pedido.pago });
        setErrorAccion("No se pudo registrar el pago.");
      }
    },
    [actualizarPedidoLocal, recargar],
  );

  const confirmarVerificacionPago = useCallback(
  async (pedido: Pedido) => {
    if (pedido.pago.verificado) return; // ya verificado, no vuelve a ejecutar

    const estadoAnterior = pedido.estado;
    const pagoAnterior = pedido.pago;
    const checklistAnterior = pedido.envio.checklist;

    const montoAnticipo =
      Math.round(pedido.pago.total * (pedido.pago.anticipoPorcentaje / 100) * 100) / 100;

    // Actualización optimista local: refleja lo que hará la función SQL
    actualizarPedidoLocal(pedido.id, {
      estado: estadoAnterior === "pendiente" ? "en_impresion" : estadoAnterior,
      pago: {
        ...pedido.pago,
        verificado: true,
        estado: "anticipo",
        montoCobrado: montoAnticipo,
      },
      envio: {
        ...pedido.envio,
        checklist: checklistAnterior.map((item, index) =>
          index === 0 ? { ...item, hecho: true } : item
        ),
      },
    });

    try {
      setCargandoConfirmacion(true);
      setErrorAccion(null);

      await verificarPagoPedidoService(pedido.id);
      await recargar();

      Alert.alert(
        "Pago verificado",
        "El anticipo fue verificado. El pedido pasó a producción."
      );
    } catch (e: any) {
      actualizarPedidoLocal(pedido.id, {
        estado: estadoAnterior,
        pago: pagoAnterior,
        envio: { ...pedido.envio, checklist: checklistAnterior },
      });
      const msg = e.message || "No se pudo verificar el pago.";
      setErrorAccion(msg);
      Alert.alert("Error", msg);
    } finally {
      setCargandoConfirmacion(false);
    }
  },
  [actualizarPedidoLocal, recargar]
);

  const toggleChecklist = useCallback(
    async (pedido: Pedido, itemId: string) => {
      const checklistAnterior = pedido.envio.checklist;
      const item = checklistAnterior.find((c) => c.id === itemId);
      if (!item) return;

      const nuevoChecklist = checklistAnterior.map((c) =>
        c.id === itemId ? { ...c, hecho: !c.hecho } : c,
      );
      actualizarPedidoLocal(pedido.id, {
        envio: { ...pedido.envio, checklist: nuevoChecklist },
      });

      try {
        setErrorAccion(null);
        await toggleChecklistItemService(itemId, item.hecho);
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, {
          envio: { ...pedido.envio, checklist: checklistAnterior },
        });
        setErrorAccion("No se pudo actualizar el checklist.");
      }
    },
    [actualizarPedidoLocal],
  );

  const abrirWhatsapp = useCallback((pedido: Pedido, mensaje: string) => {
    const numero = pedido.cliente.telefono.replace(/[^\d+]/g, "");
    Linking.openURL(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
    );
  }, []);

  const llamarCliente = useCallback((pedido: Pedido) => {
    Linking.openURL(`tel:${pedido.cliente.telefono}`);
  }, []);

  return {
    errorAccion,
    cargandoConfirmacion,
    cambiarEstado,
    marcarComoPagado,
    confirmarVerificacionPago,
    toggleChecklist,
    abrirWhatsapp,
    llamarCliente,
    estadoConfig,
  };
}