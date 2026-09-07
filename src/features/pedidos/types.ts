export type EstadoPedido = "pendiente" | "en_impresion" | "listo" | "entregado";
export type EstadoPago = "sin_pagar" | "anticipo" | "pagado";
export type MetodoPago = "transferencia" | "efectivo" | "qr";
export type TipoEnvio = "recoger" | "domicilio";
export type Prioridad = "normal" | "urgente" | "vencido";
export type TipoPago = "anticipo" | "abono" | "pago_final";

export interface ClienteRow {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

export interface CotizacionRelacionRow {
  id: string;
  imagen_referencia_url: string | null;
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

export interface PedidoPagoRow {
  id: string;
  pedido_id: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobante_url?: string | null;
  verificado?: boolean;
  created_at: string;
}

export interface PedidoRow {
  id: string;
  empresa_id: string;
  creado_por: string;
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
  cotizaciones: CotizacionRelacionRow | null;
  pedido_checklist_items: PedidoChecklistItemRow[] | null;
  pedido_eventos: PedidoEventoRow[] | null;
  pedido_pagos: PedidoPagoRow[] | null;
  cliente_recurrente?: boolean;
}

export interface EventoHistorial {
  id: string;
  fecha: string;
  texto: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hecho: boolean;
}

export interface Pedido {
  id: string;
  codigo: string;
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
    comprobanteUrl: string | null;
    verificado: boolean;
  };
  envio: {
    tipo: TipoEnvio;
    costo: number;
    tracking: string;
    checklist: ChecklistItem[];
  };
  fotoFinalUrl: string | null;
  fotoCotizacionUrl: string | null;
  historial: EventoHistorial[];
}

export interface RegistrarPagoInput {
  pedidoId: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobanteUrl?: string;
}