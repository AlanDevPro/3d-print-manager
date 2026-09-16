// src/features/cotizacion/types.ts
import type {
  ConfiguracionEmpresa,
  Material as Filamento,
  Impresora,
  ReglaMargenGanancia,
} from "@/features/materiales/types";

export type { ConfiguracionEmpresa, Filamento, Impresora, ReglaMargenGanancia };

// ==========================================
// FORMULARIO
// ==========================================

export interface PiezaFormState {
  id: string;
  nombre_pieza: string;
  peso_gramos: string;
  cantidad: string;
  tiempo_impresion_horas: string;
  tiempo_impresion_minutos: string;
  foto_pieza: string;
}

export interface CotizarFormState {
  cliente_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  impresora_id: string;
  filamento_id: string;
  regla_margen_id: string;
  margen_ganancia_pct: string;
  porcentaje_riesgo: string;
  precio_personalizacion: string;
  precio_mayorista: string;
  precio_minorista: string;
  tiempo_preparacion_minutos: string;
  tiempo_postprocesado_minutos: string;
  imagen_referencia: string;
  notas: string;
}

// ==========================================
// ENTRADA DE CÁLCULO (multi-pieza)
// ==========================================

export interface PiezaCotizacionInput {
  id: string;
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_impresion_minutos?: number;
}

export interface CotizacionMultiItemInput {
  piezas: PiezaCotizacionInput[];
  tiempo_preparacion_minutos?: number;
  tiempo_postprocesado_minutos?: number;
  impresora: Impresora;
  filamento: Filamento;
  porcentaje_riesgo?: number;
  precio_personalizacion?: number;
  regla_margen_id?: string;
  precio_mayorista?: number;
  precio_minorista?: number;
}

export interface EspecificacionesTecnicas {
  materialNombre: string;
  materialColor?: string;
  impresoraNombre: string;
  pesoGramos: number;
  tiempoImpresionHoras: number;
  tiempoImpresionMinutos: number;
  porcentajeRiesgo: number;
  personalizado: boolean;
  precioPersonalizacion?: number;
  imagenUri?: string;
}

// ==========================================
// RESULTADO
// ==========================================

export interface DetalleDesgloseCotizacion {
  costo_material_unit: number;
  costo_filamento_unit?: number;
  costo_energia_unit: number;
  costo_amortizacion_unit: number;
  costo_mantenimiento_unit: number;
  costo_mano_obra_unit: number;
  costo_subtotal_unit?: number;
  costo_subtotal_item: number;
  costo_material?: number;
  costo_energia?: number;
  costo_depreciacion?: number;
  costo_mantenimiento?: number;
  costo_mano_obra?: number;
  costo_fallos?: number;
  costo_operativo_fijo?: number;
  subtotal_costo_base?: number;
  subtotal_costo_directo?: number;
  costo_total_unidad?: number;
  precio_unidad_sugerido?: number;
  precio_total_sugerido?: number;
  margen_aplicado_pct?: number;
}

/** Desglose y precio sugerido de UNA pieza dentro de la cotización general */
export interface DesglosePiezaResultado {
  id: string;
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_impresion_minutos: number;

  // Costos unitarios (por 1 unidad de esta pieza)
  costo_material_unit: number;
  costo_mano_obra_unit: number;
  costo_amortizacion_unit: number;
  costo_energia_unit: number;
  costo_subtotal_unit: number;

  // Costos totales de esta pieza (unitario * cantidad)
  costo_material: number;
  costo_mano_obra: number;
  costo_depreciacion: number;
  costo_energia: number;
  subtotal_directo_pieza: number;

  // Proporción de esta pieza dentro del costo directo total del proyecto
  proporcion_pct: number;

  // Prorrateo de riesgo/utilidad/personalización (informativo, no se vuelve a sumar al total)
  costo_fallos_pieza: number;
  costo_base_pieza: number;
  monto_ganancia_pieza: number;
  precio_personalizacion_pieza: number;
  precio_total_pieza: number;
  precio_unitario_pieza: number;
}

export interface ResultadoCotizacion {
  nombre_pieza?: string; // compat: nombre de la 1ra pieza (para PDFs/voucher)
  cantidad?: number; // total de unidades sumando todas las piezas
  peso_gramos?: number; // total de gramos (peso * cantidad, sumado)
  tiempo_impresion_horas?: number;
  tiempo_impresion_minutos?: number;
  precio_por_pieza?: number;
  costo_total_proyecto?: number;
  costo_directo_total: number;
  costo_indirecto_total: number;
  costo_fallos_total: number;
  subtotal_costo_base: number;
  monto_ganancia: number;
  monto_impuesto: number;
  precio_final: number;
  margen_ganancia_aplicado_pct: number;
  desglose: DetalleDesgloseCotizacion;
  precio_personalizacion?: number;
  precio_minorista?: number;
  precio_mayorista?: number;
  /** NUEVO: desglose individual de cada pieza cotizada */
  piezas: DesglosePiezaResultado[];
}

// ==========================================
// VOUCHER / PDF (sin cambios)
// ==========================================

export interface VoucherPricingTier {
  label: string;
  conditionLabel?: string;
  price: number;
  discountLabel?: string;
}

export interface VoucherItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VoucherPolicy {
  label: string;
  text: string;
}

export interface VoucherEspecificaciones {
  materialNombre?: string;
  materialColor?: string;
}

export interface VoucherData {
  companyName: string;
  companyTagline: string;
  documentTitle: string;
  issueDateLabel: string;
  validityLabel?: string;
  logoUri?: string;
  productImageUri?: string;
  unitPriceLabel: string;
  unitPrice: number;
  especificaciones?: VoucherEspecificaciones;
  pricingTiers?: VoucherPricingTier[];
  items: VoucherItem[];
  policies: VoucherPolicy[];
  footerNote: string;
  websiteUrl?: string;
  currencySymbol: string;
}