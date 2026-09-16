// src/features/pedidos/types.ts

// ==========================================
// TIPOS BASE & ENUMS
// ==========================================

export type EstadoPedido = "pendiente" | "en_impresion" | "listo" | "entregado";
export type EstadoPago = "sin_pagar" | "anticipo" | "pagado";
export type MetodoPago = "transferencia" | "efectivo" | "qr";
export type TipoEnvio = "recoger" | "domicilio";
export type Prioridad = "normal" | "urgente" | "vencido";
export type TipoPago = "anticipo" | "abono" | "pago_final";
export type ResultadoIntento =
  | "pendiente"
  | "en_progreso"
  | "completado"
  | "fallido";

// ==========================================
// INTENTOS E INFORMACIÓN DE IMPRESIÓN
// ==========================================

export interface IntentoImpresion {
  id: string;
  gramosPlanificados: number;
  horasPlanificadas: number;
  gramosReales: number | null;
  horasReales: number | null;
  resultado: ResultadoIntento;
  iniciadoAt: string | null;
  finalizadoAt: string | null;
}

export interface ImpresionInfo {
  impresoraNombre: string | null;
  filamentoMaterial: string | null;
  filamentoColor: string | null;
  unidadesPieza: number;
  gramosImpresion: number;
  tiempoImpresionHoras: number;
  fechaInicioImpresion: string | null;
  fechaEstimadaListo: string | null;
  intentoActual: IntentoImpresion | null;
}

// ==========================================
// INTERFACES BASE BD (SUPABASE ROWS)
// ==========================================

export interface ClienteRow {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

export interface ImpresoraRelacionRow {
  id: string;
  modelo: string | null;
  marca: string | null;
}

export interface FilamentoRelacionRow {
  id: string;
  material: string | null;
  color: string | null;
}

export interface CotizacionItemRow {
  id: string;
  peso_gramos: number | null;
  tiempo_impresion_horas: number | null;
  cantidad: number | null;
  imagen_url: string | null; // ← nuevo
  impresoras: ImpresoraRelacionRow | null;
  filamentos: FilamentoRelacionRow | null;
}

export interface CotizacionRelacionRow {
  id: string;
  imagen_referencia_url: string | null;
  cotizacion_items?: CotizacionItemRow[] | null;
}

export interface PedidoImpresionIntentoRow {
  id: string;
  gramos_planificados: number;
  horas_planificadas: number;
  gramos_reales: number | null;
  horas_reales: number | null;
  resultado: ResultadoIntento;
  iniciado_at: string | null;
  finalizado_at: string | null;
  created_at?: string;
  impresoras: ImpresoraRelacionRow | null;
  filamentos: FilamentoRelacionRow | null;
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

  // Estimación e inicio de impresión
  fecha_inicio_impresion: string | null;
  fecha_estimada_listo: string | null;
  horas_impresion_estimadas: number | null;

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
  pedido_impresion_intentos: PedidoImpresionIntentoRow[] | null;
  pedido_checklist_items: PedidoChecklistItemRow[] | null;
  pedido_eventos: PedidoEventoRow[] | null;
  pedido_pagos: PedidoPagoRow[] | null;
  cliente_recurrente?: boolean;
}

// ==========================================
// INTERFACES MAPEADAS PARA LA APLICACIÓN
// ==========================================

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

  // Estimación e inicio de impresión
  fechaInicioImpresion: string | null;
  fechaEstimadaListo: string | null;
  horasImpresionEstimadas: number | null;

  // Detalle de impresión estandarizado
  impresion: ImpresionInfo | null;

  pago: {
    estado: EstadoPago;
    metodo: MetodoPago | null;
    tipo: TipoPago | null;
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
  imagenesCotizacion: string[];
  historial: EventoHistorial[];
}

// ==========================================
// INPUTS DE ACCIONES
// ==========================================

export interface RegistrarPagoInput {
  pedidoId: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobanteUrl?: string;
}
