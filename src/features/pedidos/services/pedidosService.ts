import { supabase } from "@/services/supabase/client";
import {
  EstadoPedido,
  MetodoPago,
  PedidoRow,
  RegistrarPagoInput,
  TipoPago,
} from "../types";


export const SELECT_PEDIDO_COMPLETO = `
  id, empresa_id, creado_por, cotizacion_id, cliente_id, producto_id, codigo_pedido,
  pieza_descripcion, estado, fecha_entrega,
  pago_total, pago_anticipo_pct, pago_monto_cobrado, pago_estado,
  envio_tipo, envio_costo, envio_tracking,
  foto_final_url, created_at, updated_at,
  clientes ( id, nombre, telefono, direccion, notas ),
  cotizaciones ( id, imagen_referencia_url ),
  pedido_checklist_items ( id, pedido_id, label, hecho, orden ),
  pedido_eventos ( id, pedido_id, texto, created_at ),
  pedido_pagos ( id, pedido_id, monto, metodo, tipo, comprobante_url, verificado, created_at )
`;

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
      (data ?? []).map((r: any) => [r.cliente_id, Boolean(r.recurrente)]),
    );

    return rows.map((row) => ({
      ...row,
      cliente_recurrente: recurrentesPorCliente.get(row.cliente_id) ?? false,
    }));
  } catch (e) {
    console.warn("Excepción al consultar vista_clientes_stats:", e);
    return rows;
  }
}

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

export async function registrarPagoPedido(
  input: RegistrarPagoInput,
): Promise<void> {
  // Guardrail: Asegura que nunca entre un monto <= 0 a la BD
  if (
    typeof input.monto !== "number" ||
    isNaN(input.monto) ||
    input.monto <= 0
  ) {
    throw new Error(
      `El monto a registrar debe ser un número positivo mayor a 0. Recibido: ${input.monto}`,
    );
  }

  const { error } = await supabase.from("pedido_pagos").insert({
    pedido_id: input.pedidoId,
    monto: input.monto,
    metodo: input.metodo,
    tipo: input.tipo,
    comprobante_url: input.comprobanteUrl ?? null,
    verificado: false, // Por defecto entra pendiente hasta ser verificado
  });

  if (error) throw error;
}

/**
 * Marca el saldo pendiente registrando un nuevo pago y verificándolo de forma atómica.
 */
export async function marcarPedidoComoPagado(
  pedidoId: string,
  saldoPendiente: number,
  metodo: MetodoPago,
): Promise<void> {
  if (saldoPendiente <= 0) {
    console.warn(
      `[marcarPedidoComoPagado] El pedido ${pedidoId} ya no tiene saldo pendiente por pagar (${saldoPendiente}).`,
    );
    return;
  }

  const tipo: TipoPago = "pago_final";
  
  // 1. Registrar el pago final pendiente
  await registrarPagoPedido({ pedidoId, monto: saldoPendiente, metodo, tipo });
  
  // 2. Verificar el pago recién ingresado
  await verificarPagoPedido(pedidoId);
}

/**
 * Llama al RPC que actualiza el estado del pago pendiente (`verificado = true`) 
 * sin sobreescribir el monto ni crear un duplicado en `pedido_pagos`.
 */
export async function verificarPagoPedido(pedidoId: string): Promise<void> {
  if (!pedidoId) {
    throw new Error("El ID del pedido es requerido para verificar el pago.");
  }

  const { error } = await supabase.rpc("verificar_pago_pedido", {
    p_pedido_id: pedidoId,
  });

  if (error) {
    throw new Error(`Error al verificar el pago: ${error.message}`);
  }
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

export async function registrarEventoPedido(
  pedidoId: string,
  texto: string,
): Promise<void> {
  const { error } = await supabase
    .from("pedido_eventos")
    .insert({ pedido_id: pedidoId, texto });

  if (error) throw error;
}

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
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pedido_pagos",
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}