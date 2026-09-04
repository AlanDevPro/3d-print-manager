// src/features/pedidos/types.ts
// Tipos de dominio del módulo Pedidos.
// - Los tipos "Row" reflejan las columnas reales de Supabase (snake_case).
// - Los tipos "UI" son los que consumen los componentes (camelCase),
//   y se obtienen siempre a través del mapper (ver mappers/pedidosMapper.ts).

// ---------------------------------------------------------------------------
// Enums / uniones de estado
// ---------------------------------------------------------------------------
export type EstadoPedido = "pendiente" | "en_impresion" | "listo" | "entregado";
export type EstadoPago = "sin_pagar" | "anticipo" | "pagado";
export type MetodoPago = "transferencia" | "efectivo" | "qr";
export type TipoEnvio = "recogida" | "domicilio" | "transporte";
export type Prioridad = "normal" | "urgente" | "vencido";
export type TipoPago = "anticipo" | "abono" | "pago_final";

// ---------------------------------------------------------------------------
// Filas crudas de Supabase (tal cual las devuelve la query con joins)
// ---------------------------------------------------------------------------
export interface ClienteRow {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

export interface PedidoChecklistItemRow {
  id: string;
  pedido_id: string;
  label: string;
  hecho: boolean;
  orden: number;
}

export interface PedidoEventoRow {
  id: string;
  pedido_id: string;
  texto: string;
  created_at: string;
}

// Fila de `pedidos` con sus relaciones embebidas (select anidado de Supabase)
export interface PedidoRow {
  id: string;
  empresa_id: string;
  creado_por: string; // antes: user_id (la columna real es creado_por)
  cotizacion_id: string | null;
  cliente_id: string;
  producto_id: string | null;
  codigo_pedido: number;

  pieza_descripcion: string;
  estado: EstadoPedido;
  fecha_entrega: string | null;

  pago_total: number;
  pago_anticipo_pct: number;
  pago_monto_cobrado: number;
  pago_estado: EstadoPago;

  envio_tipo: TipoEnvio;
  envio_costo: number | null;
  envio_tracking: string | null;

  foto_final_url: string | null;
  created_at: string;
  updated_at: string;

  clientes: ClienteRow | null;
  pedido_checklist_items: PedidoChecklistItemRow[] | null;
  pedido_eventos: PedidoEventoRow[] | null;
  cliente_recurrente?: boolean;
}

// ---------------------------------------------------------------------------
// Tipos de UI (los que usan los componentes/pantalla)
// ---------------------------------------------------------------------------
export interface EventoHistorial {
  id: string;
  fecha: string; // ISO
  texto: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hecho: boolean;
}

export interface Pedido {
  id: string;
  codigo: string; // ej. PED-1042 (derivado de codigo_pedido)
  cotizacionId: string | null;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    direccion: string;
    notas: string;
    recurrente: boolean;
  };
  pieza: string;
  estado: EstadoPedido;
  fechaEntregaTexto: string;
  fechaEntregaISO: string;
  pago: {
    estado: EstadoPago;
    metodo: MetodoPago | null;
    anticipoPorcentaje: number;
    total: number;
    montoCobrado: number;
  };
  envio: {
    tipo: TipoEnvio;
    costo: number;
    tracking: string;
    checklist: ChecklistItem[];
  };
  fotoFinalUrl: string | null;
  historial: EventoHistorial[];
}

// Payload para registrar un cobro (ver services/pedidosService.ts -> registrarPago)
export interface RegistrarPagoInput {
  pedidoId: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobanteUrl?: string;
}
