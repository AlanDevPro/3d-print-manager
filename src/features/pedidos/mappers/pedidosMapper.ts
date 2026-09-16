import {
  ImpresionInfo,
  IntentoImpresion,
  Pedido,
  PedidoImpresionIntentoRow,
  PedidoRow,
  ResultadoIntento,
} from "../types";
import { formatCodigoPedido, formatFechaEntrega } from "../utils/formato";

function elegirIntentoRelevante(
  intentos: PedidoImpresionIntentoRow[] | null | undefined,
): PedidoImpresionIntentoRow | null {
  if (!intentos || intentos.length === 0) return null;

  const enProgreso = intentos.find((i) => i.resultado === "en_progreso");
  if (enProgreso) return enProgreso;

  const pendiente = intentos.find((i) => i.resultado === "pendiente");
  if (pendiente) return pendiente;

  // Sin intento activo: mostrar el más reciente (completado o fallido).
  return [...intentos].sort((a, b) => {
    const fechaA = new Date(a.created_at ?? a.iniciado_at ?? 0).getTime();
    const fechaB = new Date(b.created_at ?? b.iniciado_at ?? 0).getTime();
    return fechaB - fechaA;
  })[0];
}

function extraerImagenesCotizacion(row: PedidoRow): string[] {
  const items = row.cotizaciones?.cotizacion_items ?? [];
  const urls = items
    .map((item) => (item as any).imagen_url as string | null)
    .filter((url): url is string => Boolean(url));
  // sin duplicados
  return Array.from(new Set(urls));
}

export function mapPedidoFromDb(row: PedidoRow): Pedido {
  const pagos = row.pedido_pagos ?? [];
  const pagosOrdenados = [...pagos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const ultimoPago = pagosOrdenados.length > 0 ? pagosOrdenados[0] : null;

  const totalPagadoCalculado = pagos.reduce(
    (acc, pago) => acc + Number(pago.monto ?? 0),
    0,
  );

  const montoCobradoFinal =
    Number(row.pago_monto_cobrado) > 0
      ? Number(row.pago_monto_cobrado)
      : totalPagadoCalculado;

  // ── Datos reales de impresión: piezas de la cotización + intento actual ──
  const items = row.cotizaciones?.cotizacion_items ?? [];
  const primerItem = items[0] ?? null;

  const unidadesPieza =
    items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0) || 1;
  const gramosTotalesCotizacion = items.reduce(
    (acc, it) =>
      acc + (Number(it.peso_gramos) || 0) * (Number(it.cantidad) || 0),
    0,
  );
  const horasTotalesCotizacion = items.reduce(
    (acc, it) =>
      acc +
      (Number(it.tiempo_impresion_horas) || 0) * (Number(it.cantidad) || 0),
    0,
  );

  const intentoRelevante = elegirIntentoRelevante(
    row.pedido_impresion_intentos,
  );

  const intentoActual: IntentoImpresion | null = intentoRelevante
    ? {
        id: intentoRelevante.id,
        gramosPlanificados: Number(intentoRelevante.gramos_planificados) || 0,
        horasPlanificadas: Number(intentoRelevante.horas_planificadas) || 0,
        gramosReales:
          intentoRelevante.gramos_reales != null
            ? Number(intentoRelevante.gramos_reales)
            : null,
        horasReales:
          intentoRelevante.horas_reales != null
            ? Number(intentoRelevante.horas_reales)
            : null,
        resultado: intentoRelevante.resultado as ResultadoIntento,
        iniciadoAt: intentoRelevante.iniciado_at ?? "",
        finalizadoAt: intentoRelevante.finalizado_at,
      }
    : null;

  const impresoraRef =
    intentoRelevante?.impresoras ?? primerItem?.impresoras ?? null;
  const filamentoRef =
    intentoRelevante?.filamentos ?? primerItem?.filamentos ?? null;

  const impresoraNombre = impresoraRef
    ? [impresoraRef.marca, impresoraRef.modelo]
        .filter(Boolean)
        .join(" ")
        .trim() || null
    : null;

  const impresion: ImpresionInfo = {
    impresoraNombre,
    filamentoMaterial: filamentoRef?.material ?? null,
    filamentoColor: filamentoRef?.color ?? null,
    unidadesPieza,
    gramosImpresion:
      intentoActual?.gramosPlanificados || gramosTotalesCotizacion,
    tiempoImpresionHoras:
      intentoActual?.horasPlanificadas ||
      horasTotalesCotizacion ||
      row.horas_impresion_estimadas ||
      0,
    fechaInicioImpresion: row.fecha_inicio_impresion ?? null,
    fechaEstimadaListo: row.fecha_estimada_listo ?? null,
    intentoActual,
  };

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

    fechaInicioImpresion: row.fecha_inicio_impresion,
    fechaEstimadaListo: row.fecha_estimada_listo,
    horasImpresionEstimadas: row.horas_impresion_estimadas,

    impresion,

    pago: {
      estado: row.pago_estado,
      metodo: ultimoPago?.metodo ?? null,
      tipo: ultimoPago?.tipo ?? null,
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
    imagenesCotizacion: extraerImagenesCotizacion(row),
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
