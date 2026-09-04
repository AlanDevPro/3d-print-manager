// src/features/pedidos/hooks/usePedidoActions.ts
// Acciones que mutan un pedido. Reciben `actualizarPedidoLocal` de usePedidos
// para reflejar el cambio al instante (optimista) y luego confirman/corrigen
// contra Supabase. Si la base de datos rechaza el cambio (ej. el trigger de
// anticipo mínimo), se revierte el estado local y se expone el error.

import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { estadoConfig } from "../constants";
import {
    actualizarEstadoPedido,
    marcarPedidoComoPagado,
    toggleChecklistItem as toggleChecklistItemService,
} from "../services/pedidosService";
import { EstadoPedido, MetodoPago, Pedido } from "../types";

export function usePedidoActions(
  actualizarPedidoLocal: (id: string, cambios: Partial<Pedido>) => void,
  recargar: () => Promise<void>,
) {
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const cambiarEstado = useCallback(
    async (pedido: Pedido, nuevoEstado: EstadoPedido) => {
      const estadoAnterior = pedido.estado;
      actualizarPedidoLocal(pedido.id, { estado: nuevoEstado });
      try {
        setErrorAccion(null);
        await actualizarEstadoPedido(pedido.id, nuevoEstado);
        // El historial ("Estado cambiado a...") lo escribe el trigger en la BD;
        // recargamos para traer ese evento nuevo al modal.
        await recargar();
      } catch (e: any) {
        // Revierte: probablemente faltó el anticipo mínimo (trigger de la BD).
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
    cambiarEstado,
    marcarComoPagado,
    toggleChecklist,
    abrirWhatsapp,
    llamarCliente,
    estadoConfig,
  };
}
