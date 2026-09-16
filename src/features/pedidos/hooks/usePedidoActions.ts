//src/features/pedidos/hooks/usePedidoActions.ts
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { estadoConfig } from "../constants";
import {
  actualizarEstadoPedido,
  marcarPedidoComoPagado,
  metodoRequiereComprobante,
  toggleChecklistItem as toggleChecklistItemService,
  verificarPagoPedido as verificarPagoPedidoService,
} from "../services/pedidosService";
import { EstadoPedido, MetodoPago, Pedido } from "../types";

export function usePedidoActions(
  actualizarPedidoLocal: (id: string, cambios: Partial<Pedido>) => void,
  recargar: () => Promise<void>,
  // Callback opcional invocado cuando un pago se verifica con éxito.
  // Permite que la pantalla dueña del filtro/modal reaccione (cerrar el
  // detalle y filtrar por "en_impresion") sin acoplar este hook a esa UI.
  onPagoVerificado?: (pedido: Pedido) => void,
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
      if (pedido.pago.verificado) return;

      // ── Validación previa: no se puede verificar sin comprobante cuando
      //    el método de pago lo requiere. No se toca la BD si esto falla. ──
      if (
        metodoRequiereComprobante(pedido.pago.metodo) &&
        !pedido.pago.comprobanteUrl
      ) {
        const msg =
          "No se puede verificar este pago: todavía no existe un comprobante subido por el cliente.";
        setErrorAccion(msg);
        Alert.alert("Falta comprobante", msg);
        return;
      }

      const estadoAnterior = pedido.estado;
      const pagoAnterior = pedido.pago;
      const checklistAnterior = pedido.envio.checklist;
      const comprobanteUrlAEliminar = pedido.pago.comprobanteUrl;

      const montoAnticipo =
        Math.round(
          pedido.pago.total * (pedido.pago.anticipoPorcentaje / 100) * 100,
        ) / 100;

      const nuevoEstado: EstadoPedido = "en_impresion";

      // Optimista: en cuanto se actualiza este estado local, la UI
      // (PagoSeccion) reemplaza el botón por el banner "Pago del anticipo
      // verificado correctamente" de inmediato. El modal se cierra solo
      // unos segundos después (ver DetallePedidoModal), así que ya no
      // dependemos de un Alert nativo para comunicar el éxito.
      actualizarPedidoLocal(pedido.id, {
        estado: nuevoEstado,
        pago: {
          ...pedido.pago,
          verificado: true,
          estado: "anticipo",
          montoCobrado: montoAnticipo,
          // Ojo: esto es optimista. Si la eliminación real falla, más abajo
          // no revertimos este campo porque el pago SÍ queda verificado;
          // solo avisamos que el comprobante quedó pendiente de limpiar a mano.
          comprobanteUrl: null,
        },
        envio: {
          ...pedido.envio,
          checklist: checklistAnterior.map((item, index) =>
            index === 0 ? { ...item, hecho: true } : item,
          ),
        },
      });

      try {
        setCargandoConfirmacion(true);
        setErrorAccion(null);

        const resultado = await verificarPagoPedidoService(
          pedido.id,
          pedido.pago.metodo,
          comprobanteUrlAEliminar,
        );

        await recargar();

        const { comprobante } = resultado;

        // El éxito "normal" ya se comunica con el banner inline en
        // PagoSeccion, así que aquí solo alertamos cuando hay algo que el
        // usuario deba revisar manualmente (el comprobante no se pudo
        // eliminar). Duplicar el aviso con un Alert nativo en el caso
        // exitoso solo interrumpe el cierre automático del modal.
        if (
          comprobante.intentoEliminacion &&
          !(comprobante.eliminadoDeStorage && comprobante.eliminadoDeBD)
        ) {
          const detalle = [comprobante.errorStorage, comprobante.errorBD]
            .filter(Boolean)
            .join(" / ");

          console.warn(
            `[confirmarVerificacionPago] Comprobante no eliminado para pedido ${pedido.id}:`,
            detalle,
          );

          Alert.alert(
            "Pago verificado (revisar comprobante)",
            `El anticipo fue verificado y el pedido pasó a producción, pero no se pudo eliminar el comprobante automáticamente. Bórralo manualmente en Supabase.\n\nDetalle técnico: ${
              detalle || "desconocido"
            }`,
          );
        }

        onPagoVerificado?.({ ...pedido, estado: nuevoEstado });
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
    [actualizarPedidoLocal, recargar, onPagoVerificado],
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