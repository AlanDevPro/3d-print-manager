// src/features/pedidos/services/pedidosService.ts

import { supabase } from "@/services/supabase/client";
import { AppState } from "react-native";
import {
  EstadoPedido,
  MetodoPago,
  PedidoRow,
  RegistrarPagoInput,
  TipoPago,
} from "../types";

const BUCKET_COMPROBANTES = "empresa-assets";

// ── Tipos para reportar el resultado de la limpieza de comprobantes ──────
export interface ResultadoEliminacionComprobante {
  intentoEliminacion: boolean; // Había una URL para intentar borrar
  eliminadoDeStorage: boolean;
  eliminadoDeBD: boolean;
  rutaStorage: string | null;
  errorStorage?: string;
  errorBD?: string;
}

export interface ResultadoVerificacionPago {
  comprobante: ResultadoEliminacionComprobante;
}

// ── Helper: qué métodos exigen comprobante subido por el cliente ─────────
export function metodoRequiereComprobante(
  metodo?: MetodoPago | string | null,
): boolean {
  if (!metodo) return false;
  const m = metodo.toLowerCase();
  return m.includes("qr") || m.includes("transferencia");
}

// ── Consultas SELECT integradas ──────────────────────────────────────────
export const SELECT_PEDIDO_IMPRESION = `
  fecha_inicio_impresion, fecha_estimada_listo, horas_impresion_estimadas,
  cotizaciones (
    id,
    imagen_referencia_url,
    cotizacion_items (
      id, peso_gramos, tiempo_impresion_horas, cantidad, imagen_url,
      impresoras ( id, modelo, marca ),
      filamentos ( id, material, color )
    )
  ),
  pedido_impresion_intentos (
    id, gramos_planificados, horas_planificadas, gramos_reales,
    horas_reales, resultado, iniciado_at, finalizado_at, created_at,
    impresoras ( id, modelo, marca ),
    filamentos ( id, material, color )
  )
`;

export const SELECT_PEDIDO_COMPLETO = `
  id, empresa_id, creado_por, cotizacion_id, cliente_id, producto_id, codigo_pedido,
  pieza_descripcion, estado, fecha_entrega,
  pago_total, pago_anticipo_pct, pago_monto_cobrado, pago_estado,
  envio_tipo, envio_costo, envio_tracking,
  foto_final_url, created_at, updated_at,
  clientes ( id, nombre, telefono, direccion, notas ),
  pedido_checklist_items ( id, pedido_id, label, hecho, orden ),
  pedido_eventos ( id, pedido_id, texto, created_at ),
  pedido_pagos ( id, pedido_id, monto, metodo, tipo, comprobante_url, verificado, created_at ),
  ${SELECT_PEDIDO_IMPRESION}
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

// ── Servicios específicos de Impresión y Empresa ─────────────────────────
export async function fetchImpresionInfo(pedidoId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_PEDIDO_IMPRESION)
    .eq("id", pedidoId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchEmpresaContacto(empresaId: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("ubicacion_url")
    .eq("id", empresaId)
    .single();

  if (error) throw error;

  const { data: config, error: errorConfig } = await supabase
    .from("configuracion_empresa")
    .select("qr_pago_url")
    .eq("empresa_id", empresaId)
    .single();

  if (errorConfig) throw errorConfig;

  return {
    ubicacionUrl: data?.ubicacion_url ?? null,
    qrPagoUrl: config?.qr_pago_url ?? null,
  };
}

// ── Procedimientos Almacenados (RPCs) de Flujo de Producción ────────────
export async function iniciarImpresionPedido(pedidoId: string) {
  const { data, error } = await supabase.rpc("iniciar_impresion_pedido", {
    p_pedido_id: pedidoId,
  });

  if (error)
    throw new Error(`No se pudo iniciar la impresión: ${error.message}`);
  return data;
}

export async function finalizarImpresionPedido(pedidoId: string) {
  const { error } = await supabase.rpc("finalizar_impresion_pedido", {
    p_pedido_id: pedidoId,
  });

  if (error)
    throw new Error(`No se pudo finalizar la impresión: ${error.message}`);
}

export async function fallarImpresionPedido(
  pedidoId: string,
  gramosReales: number,
  horasReales: number,
) {
  const { error } = await supabase.rpc("fallar_impresion_pedido", {
    p_pedido_id: pedidoId,
    p_gramos_reales: gramosReales,
    p_horas_reales: horasReales,
  });

  if (error)
    throw new Error(
      `No se pudo registrar el fallo de impresión: ${error.message}`,
    );
}

export async function confirmarEntregaPedido(
  pedidoId: string,
  metodo: MetodoPago,
) {
  const { error } = await supabase.rpc("confirmar_entrega_pedido", {
    p_pedido_id: pedidoId,
    p_metodo: metodo,
  });

  if (error)
    throw new Error(`No se pudo confirmar la entrega: ${error.message}`);
}

// ── Estado y Pagos ───────────────────────────────────────────────────────
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
    verificado: false,
  });

  if (error) throw error;
}

export async function marcarPedidoComoPagado(
  pedidoId: string,
  saldoPendiente: number,
  metodo: MetodoPago,
): Promise<ResultadoVerificacionPago | void> {
  if (saldoPendiente <= 0) {
    console.warn(
      `[marcarPedidoComoPagado] El pedido ${pedidoId} ya no tiene saldo pendiente por pagar (${saldoPendiente}).`,
    );
    return;
  }

  const tipo: TipoPago = "pago_final";

  await registrarPagoPedido({ pedidoId, monto: saldoPendiente, metodo, tipo });
  return await verificarPagoPedido(pedidoId, metodo);
}

function extraerRutaStorage(url: string): string | null {
  const marcador = `/${BUCKET_COMPROBANTES}/`;
  const idx = url.indexOf(marcador);
  if (idx === -1) return null;
  return url.slice(idx + marcador.length).split("?")[0];
}

export async function eliminarComprobantePago(
  pedidoId: string,
  comprobanteUrl: string | null | undefined,
): Promise<ResultadoEliminacionComprobante> {
  if (!comprobanteUrl) {
    return {
      intentoEliminacion: false,
      eliminadoDeStorage: false,
      eliminadoDeBD: false,
      rutaStorage: null,
    };
  }

  const resultado: ResultadoEliminacionComprobante = {
    intentoEliminacion: true,
    eliminadoDeStorage: false,
    eliminadoDeBD: false,
    rutaStorage: extraerRutaStorage(comprobanteUrl),
  };

  if (resultado.rutaStorage) {
    const { error: errorStorage } = await supabase.storage
      .from(BUCKET_COMPROBANTES)
      .remove([resultado.rutaStorage]);

    if (errorStorage) {
      resultado.errorStorage = errorStorage.message;
      console.warn(
        `[eliminarComprobantePago] Falló el borrado en storage (ruta: ${resultado.rutaStorage}):`,
        errorStorage.message,
      );
    } else {
      resultado.eliminadoDeStorage = true;
    }
  } else {
    resultado.errorStorage = `No se pudo extraer la ruta de storage desde la URL: ${comprobanteUrl}`;
    console.warn("[eliminarComprobantePago]", resultado.errorStorage);
  }

  const { error: errorDb, data: filasActualizadas } = await supabase
    .from("pedido_pagos")
    .update({ comprobante_url: null })
    .eq("pedido_id", pedidoId)
    .eq("comprobante_url", comprobanteUrl)
    .select("id");

  if (errorDb) {
    resultado.errorBD = errorDb.message;
    console.warn(
      "[eliminarComprobantePago] Falló la limpieza de comprobante_url en BD:",
      errorDb.message,
    );
  } else if (!filasActualizadas || filasActualizadas.length === 0) {
    resultado.errorBD =
      "No se encontró ninguna fila en pedido_pagos con ese comprobante_url para limpiar.";
    console.warn("[eliminarComprobantePago]", resultado.errorBD);
  } else {
    resultado.eliminadoDeBD = true;
  }

  return resultado;
}

export async function verificarPagoPedido(
  pedidoId: string,
  metodo?: MetodoPago | string | null,
  comprobanteUrl?: string | null,
): Promise<ResultadoVerificacionPago> {
  if (!pedidoId) {
    throw new Error("El ID del pedido es requerido para verificar el pago.");
  }

  if (metodoRequiereComprobante(metodo) && !comprobanteUrl) {
    throw new Error(
      "No se puede verificar este pago: el método requiere un comprobante y todavía no existe ninguna imagen subida por el cliente.",
    );
  }

  const { error } = await supabase.rpc("verificar_pago_pedido", {
    p_pedido_id: pedidoId,
  });

  if (error) {
    throw new Error(`Error al verificar el pago: ${error.message}`);
  }

  const comprobante = await eliminarComprobantePago(pedidoId, comprobanteUrl);

  if (
    comprobante.intentoEliminacion &&
    (!comprobante.eliminadoDeStorage || !comprobante.eliminadoDeBD)
  ) {
    console.warn(
      `[verificarPagoPedido] ⚠️ Pedido ${pedidoId}: el pago se verificó pero el comprobante NO se eliminó correctamente.`,
      comprobante,
    );
  }

  return { comprobante };
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

// ── Suscripción Realtime optimizada con control de AppState ────────────
export function suscribirCambiosPedidos(
  empresaId: string,
  onChange: () => void,
) {
  if (!empresaId) return () => {};

  const filtroEmpresa = `empresa_id=eq.${empresaId}`;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  const crearCanal = () => {
    // Si ya existe una instancia previa, nos aseguriamos de limpiarla
    if (channel) {
      supabase.removeChannel(channel);
    }

    channel = supabase
      .channel(`pedidos-realtime-${empresaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: filtroEmpresa,
        },
        onChange,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedido_pagos",
          filter: filtroEmpresa,
        },
        onChange,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedido_checklist_items",
          filter: filtroEmpresa,
        },
        onChange,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedido_eventos",
          filter: filtroEmpresa,
        },
        onChange,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedido_impresion_intentos",
        },
        onChange,
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Conectado a pedidos-realtime-${empresaId}`);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.log(
            `[Realtime] Canal experimentó un fallo de transporte (${status}), reconectando y forzando refetch...`,
          );
          onChange();
        }
      });
  };

  // Inicializar la conexión en el arranque
  crearCanal();

  // Escuchar cuando la app cambia de estado (Background <-> Active)
  const appStateSubscription = AppState.addEventListener(
    "change",
    (nextAppState) => {
      if (nextAppState === "active") {
        // Al volver a la app, reiniciamos el canal limpiamente y recargamos datos
        crearCanal();
        onChange();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // Al mandar la app al fondo, cerramos el socket ordenadamente para evitar errores innecesarios
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
      }
    },
  );

  // Retornar función de limpieza completa (remueve listener de AppState y canal de Supabase)
  return () => {
    appStateSubscription.remove();
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}
