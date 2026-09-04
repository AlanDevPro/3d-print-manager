// Toda la comunicación con Supabase para Pedidos vive aquí.
// Los hooks NUNCA llaman a supabase.from(...) directamente: siempre pasan
// por este service, así puedes cambiar de backend sin tocar la UI.

import { supabase } from "@/services/supabase/client";
import {
  EstadoPedido,
  MetodoPago,
  PedidoRow,
  RegistrarPagoInput,
  TipoEnvio,
  TipoPago,
} from "../types";

// Select con todas las relaciones que necesita la pantalla de Pedidos.
// (clientes, checklist, historial de eventos)
export const SELECT_PEDIDO_COMPLETO = `
  id, empresa_id, creado_por, cotizacion_id, cliente_id, producto_id, codigo_pedido,
  pieza_descripcion, estado, fecha_entrega,
  pago_total, pago_anticipo_pct, pago_monto_cobrado, pago_estado,
  envio_tipo, envio_costo, envio_tracking,
  foto_final_url, created_at, updated_at,
  clientes ( id, nombre, telefono, direccion, notas ),
  pedido_checklist_items ( id, pedido_id, label, hecho, orden ),
  pedido_eventos ( id, pedido_id, texto, created_at )
`;

/**
 * Trae los pedidos de la empresa activa. El filtro por empresa_id se hace
 * explícito aquí (no se delega solo a RLS): RLS es la última línea de
 * defensa, pero el filtro de negocio siempre debe ir en la query.
 */
export async function fetchPedidos(empresaId: string): Promise<PedidoRow[]> {
  if (!empresaId) return [];

  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_PEDIDO_COMPLETO)
    .eq("empresa_id", empresaId)
    .order("fecha_entrega", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as PedidoRow[];
  return attachClienteRecurrente(rows);
}

/**
 * Marca `cliente_recurrente` en cada fila usando la vista `vista_clientes_stats`
 * (pedidos_totales > 1). Se incluye un bloque try/catch para evitar que fallos
 * secundarios de la vista bloqueen la carga global de pedidos.
 */
async function attachClienteRecurrente(
  rows: PedidoRow[],
): Promise<PedidoRow[]> {
  const clienteIds = Array.from(new Set(rows.map((r) => r.cliente_id)));
  if (clienteIds.length === 0) return rows;

  try {
    const { data, error } = await supabase
      .from("vista_clientes_stats")
      .select("cliente_id")
      .in("cliente_id", clienteIds);

    if (error) {
      console.warn("No se pudo obtener cliente_recurrente:", error.message);
      return rows;
    }

    const recurrentesPorCliente = new Map<string, boolean>(
      (data ?? []).map((r: any) => [r.cliente_id, r.recurrente]),
    );

    return rows.map((row) => ({
      ...row,
      cliente_recurrente: recurrentesPorCliente.get(row.cliente_id) ?? false,
    }));
  } catch (e) {
    console.warn("Excepción al consultar vista_clientes_stats:", e);
    return rows; // Devuelve las filas originales sin romper la ejecución
  }
}

/**
 * Cambia el estado de un pedido. El historial ("Estado cambiado a...") se
 * escribe solo en `pedido_eventos` gracias al trigger `trg_log_cambio_estado`
 * — no hace falta insertarlo manualmente.
 *
 * OJO: si intentas pasar de "pendiente" a "en_impresion" sin el anticipo
 * mínimo cobrado, Supabase rechaza el UPDATE (trigger
 * `trg_validar_anticipo`). Ese error debe mostrarse tal cual al usuario.
 */
export async function actualizarEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido,
): Promise<void> {
  const { error } = await supabase
    .from("pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", pedidoId);

  if (error) throw error;
}

/**
 * Registra un cobro (anticipo, abono o pago final). El trigger
 * `trg_procesar_pago` se encarga de:
 *  - actualizar pedidos.pago_monto_cobrado / pago_estado
 *  - crear el ingreso correspondiente en Finanzas
 *  - dejar constancia en pedido_eventos
 * Por eso este service NO actualiza esas columnas a mano.
 */
export async function registrarPagoPedido(
  input: RegistrarPagoInput,
): Promise<void> {
  const { error } = await supabase.from("pedido_pagos").insert({
    pedido_id: input.pedidoId,
    monto: input.monto,
    metodo: input.metodo,
    tipo: input.tipo,
    comprobante_url: input.comprobanteUrl ?? null,
  });

  if (error) throw error;
}

/** Atajo para "Marcar como pagado": cobra el saldo pendiente completo. */
export async function marcarPedidoComoPagado(
  pedidoId: string,
  saldoPendiente: number,
  metodo: MetodoPago,
): Promise<void> {
  const tipo: TipoPago = "pago_final";
  await registrarPagoPedido({ pedidoId, monto: saldoPendiente, metodo, tipo });
}

export async function toggleChecklistItem(
  itemId: string,
  hechoActual: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("pedido_checklist_items")
    .update({ hecho: !hechoActual })
    .eq("id", itemId);

  if (error) throw error;
}

/** Evento manual (ej. "Recordatorio de cobro enviado por WhatsApp"). */
export async function registrarEventoPedido(
  pedidoId: string,
  texto: string,
): Promise<void> {
  const { error } = await supabase
    .from("pedido_eventos")
    .insert({ pedido_id: pedidoId, texto });

  if (error) throw error;
}

// --- Crear pedido en estado "pendiente" ---

export interface CrearPedidoPendienteInput {
  empresaId: string;
  clienteId: string;
  cotizacionId?: string | null;
  productoId?: string | null;
  piezaDescripcion: string;
  pagoTotal: number;
  pagoAnticipoPct?: number;
  fechaEntrega?: string | null;
  envioTipo?: TipoEnvio;
  envioCosto?: number;
}

/**
 * Crea un pedido nuevo en estado "pendiente" vinculado a una empresa y cliente
 * (y opcionalmente a una cotización). Se usa justo después de que
 * CotizacionResumenCard guarda cliente + cotización, al presionar
 * "Enviar por WhatsApp".
 */
export async function crearPedidoPendiente(
  input: CrearPedidoPendienteInput,
): Promise<PedidoRow> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No hay una sesión de usuario activa.");
  if (!input.empresaId)
    throw new Error("Se requiere empresaId para crear un pedido.");

  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      empresa_id: input.empresaId,
      creado_por: user.id,
      cliente_id: input.clienteId,
      cotizacion_id: input.cotizacionId ?? null,
      producto_id: input.productoId ?? null,
      pieza_descripcion: input.piezaDescripcion,
      estado: "pendiente",
      fecha_entrega: input.fechaEntrega ?? null,
      pago_total: input.pagoTotal,
      pago_anticipo_pct: input.pagoAnticipoPct ?? 0,
      pago_monto_cobrado: 0,
      pago_estado: "sin_pagar",
      envio_tipo: input.envioTipo ?? "recogida",
      envio_costo: input.envioCosto ?? 0,
    })
    .select(SELECT_PEDIDO_COMPLETO)
    .single();

  if (error) throw error;
  return data as unknown as PedidoRow;
}

/**
 * Suscripción realtime simplificada a nivel de tabla `pedidos` filtrando por `empresa_id`.
 * Evita suscripciones mal configuradas en tablas secundarias sin `empresa_id`.
 */
export function suscribirCambiosPedidos(
  empresaId: string,
  onChange: () => void,
) {
  if (!empresaId) return () => {};

  const channel = supabase
    .channel(`pedidos-realtime-${empresaId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pedidos",
        filter: `empresa_id=eq.${empresaId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
