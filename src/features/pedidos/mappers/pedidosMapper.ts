// src/features/pedidos/mappers/pedidosMapper.ts
// Única puerta de entrada entre el esquema de Supabase y la UI.
// Si mañana cambias una columna en la base de datos, SOLO tocas este archivo
// (y types.ts) — los componentes nunca ven snake_case.

import { ChecklistItem, EventoHistorial, Pedido, PedidoRow } from "../types";
import { formatFechaEntrega } from "../utils/fechas";
import { formatCodigoPedido } from "../utils/formato";

function mapChecklist(row: PedidoRow): ChecklistItem[] {
  return (row.pedido_checklist_items ?? [])
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((item) => ({
      id: item.id,
      label: item.label,
      hecho: item.hecho,
    }));
}

function mapHistorial(row: PedidoRow): EventoHistorial[] {
  return (row.pedido_eventos ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .map((evento) => ({
      id: evento.id,
      fecha: evento.created_at,
      texto: evento.texto,
    }));
}

export function mapPedidoFromDb(row: PedidoRow): Pedido {
  return {
    id: row.id,
    codigo: formatCodigoPedido(row.codigo_pedido),
    cotizacionId: row.cotizacion_id,
    cliente: {
      id: row.clientes?.id ?? row.cliente_id,
      nombre: row.clientes?.nombre ?? "Cliente sin nombre",
      telefono: row.clientes?.telefono ?? "",
      direccion: row.clientes?.direccion ?? "",
      notas: row.clientes?.notas ?? "",
      // Viene de la vista `vista_clientes_stats` (pedidos_totales > 1).
      // Ver pedidosService.ts -> fetchClientesRecurrentes().
      recurrente: row.cliente_recurrente ?? false,
    },
    pieza: row.pieza_descripcion,
    estado: row.estado,
    fechaEntregaTexto: formatFechaEntrega(row.fecha_entrega),
    fechaEntregaISO: row.fecha_entrega ?? "",
    pago: {
      estado: row.pago_estado,
      // El método de pago "actual" se toma del último pago registrado;
      // si aún no hay pagos, no hay método que mostrar.
      metodo: null,
      anticipoPorcentaje: row.pago_anticipo_pct,
      total: row.pago_total,
      montoCobrado: row.pago_monto_cobrado,
    },
    envio: {
      tipo: row.envio_tipo,
      costo: row.envio_costo ?? 0,
      tracking: row.envio_tracking ?? "",
      checklist: mapChecklist(row),
    },
    fotoFinalUrl: row.foto_final_url,
    historial: mapHistorial(row),
  };
}

export function mapPedidosFromDb(rows: PedidoRow[]): Pedido[] {
  return rows.map(mapPedidoFromDb);
}
