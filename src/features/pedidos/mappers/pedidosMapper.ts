import { Pedido, PedidoRow } from "../types";
import { formatCodigoPedido, formatFechaEntrega } from "../utils/formato";

export function mapPedidoFromDb(row: PedidoRow): Pedido {
  // 1. Obtener los pagos ordenados de más reciente a más antiguo
  const pagos = row.pedido_pagos ?? [];
  const pagosOrdenados = [...pagos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const ultimoPago = pagosOrdenados.length > 0 ? pagosOrdenados[0] : null;

  // 2. Calcular la suma total cobrada a partir del historial de pagos
  const totalPagadoCalculado = pagos.reduce(
    (acc, pago) => acc + Number(pago.monto ?? 0),
    0
  );

  // Si pago_monto_cobrado en BD viene en 0 o null, usaremos el total calculado de la relación
  const montoCobradoFinal =
    Number(row.pago_monto_cobrado) > 0
      ? Number(row.pago_monto_cobrado)
      : totalPagadoCalculado;

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
      recurrente: row.cliente_recurrente ?? false,
    },
    pieza: row.pieza_descripcion,
    estado: row.estado,
    fechaEntregaTexto: formatFechaEntrega(row.fecha_entrega),
    fechaEntregaISO: row.fecha_entrega ?? "",

    // Campos mapeados para la estimación e inicio de impresión
    fechaInicioImpresion: row.fecha_inicio_impresion,
    fechaEstimadaListo: row.fecha_estimada_listo,
    horasImpresionEstimadas: row.horas_impresion_estimadas,

    pago: {
      estado: row.pago_estado,
      metodo: ultimoPago?.metodo ?? null,
      anticipoPorcentaje: Number(row.pago_anticipo_pct ?? 0),
      total: Number(row.pago_total ?? 0),
      montoCobrado: montoCobradoFinal,
      comprobanteUrl: ultimoPago?.comprobante_url ?? null,
      verificado: ultimoPago?.verificado ?? false,
    },
    envio: {
      tipo: row.envio_tipo,
      costo: Number(row.envio_costo ?? 0),
      tracking: row.envio_tracking ?? "",
      checklist: (row.pedido_checklist_items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        hecho: item.hecho,
      })),
    },
    fotoFinalUrl: row.foto_final_url,
    fotoCotizacionUrl: row.cotizaciones?.imagen_referencia_url ?? null,
    historial: (row.pedido_eventos ?? []).map((e) => ({
      id: e.id,
      fecha: e.created_at,
      texto: e.texto,
    })),
  };
}

export function mapPedidosFromDb(rows: PedidoRow[]): Pedido[] {
  return rows.map(mapPedidoFromDb);
}