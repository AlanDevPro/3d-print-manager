// ============================================================================
// TIPOS QUE REFLEJAN LAS TABLAS DE SUPABASE
// ============================================================================

export interface ConfiguracionUsuario {
  user_id: string;
  costo_kwh: number;
  costo_mano_obra_hora: number;
  costo_operativo_fijo_mensual: number;
  horas_laborables_mes: number;
  tasa_fallo_defecto_pct: number;
  impuesto_pct: number;
  margen_ganancia_defecto_pct: number;
  moneda: string;
  updated_at: string;
}

export interface Impresora {
  id: string;
  user_id: string;
  nombre: string;
  costo_compra: number;
  vida_util_horas: number;
  potencia_watts: number;
  costo_mantenimiento_hora: number;
  activa: boolean;
  created_at: string;
}

export interface Material {
  id: string;
  user_id: string;
  marca: string | null;
  tipo: string;
  color: string | null;
  peso_carrete_gramos: number;
  precio_carrete: number;
  activo: boolean;
  created_at: string;
}

/**
 * Márgenes de ganancia por escalas de volumen de producción.
 * Refleja la tabla public.reglas_margen_ganancia
 */
export interface ReglaMargenGanancia {
  id: string;
  user_id: string;
  cantidad_minima: number;
  cantidad_maxima: number | null; // null = "en adelante" (sin límite superior)
  margen_ganancia_pct: number;
  created_at?: string;
}

export type EstadoCotizacion =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "completada";

export interface Cotizacion {
  id: string;
  user_id: string;
  codigo_cotizacion: number;
  cliente_nombre: string;
  cliente_contacto: string | null;
  costo_directo_total: number;
  costo_indirecto_total: number;
  costo_fallos_total: number;
  subtotal_costo_base: number;
  monto_ganancia: number;
  monto_impuesto: number;
  precio_final: number;
  margen_ganancia_aplicado_pct: number;
  estado: EstadoCotizacion;
  notas: string | null;
  created_at: string;
}

export interface CotizacionItem {
  id: string;
  cotizacion_id: string;
  impresora_id: string | null;
  material_id: string | null;
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_preparacion_minutos: number;
  tiempo_postprocesado_minutos: number;
  costo_material: number;
  costo_energia: number;
  costo_amortizacion: number;
  costo_mantenimiento: number;
  costo_mano_obra: number;
  costo_subtotal_item: number;
  created_at: string;
}
