import { ConfiguracionUsuario, Impresora, Material } from "@/types/database";

export type { ConfiguracionUsuario, Impresora, Material };

/**
 * Regla de margen de ganancia escalonado según la cantidad/volumen de piezas
 */
export interface ReglaMargenGanancia {
  id?: string;
  user_id?: string;
  cantidad_minima: number;
  cantidad_maxima: number | null; // null representa "en adelante" (sin límite superior)
  margen_ganancia_pct: number;
  created_at?: string;
}

/**
 * Estado del formulario de cotización (entradas como string provenientes de inputs UI)
 */
export interface CotizarFormState {
  cliente_nombre: string;
  cliente_contacto: string;
  nombre_pieza: string;
  cantidad: string;
  peso_gramos: string;
  tiempo_impresion_horas: string;
  tiempo_impresion_minutos: string;
  tiempo_preparacion_minutos: string;
  tiempo_postprocesado_minutos: string;
  impresora_id: string;
  material_id: string;
  margen_ganancia_pct: string;
  porcentaje_riesgo: string;
  precio_personalizacion: string;
  precio_mayorista: string;
  precio_minorista: string;
  imagen_referencia: string;
  notas: string;
}

/**
 * Datos numéricos procesados que recibe la función de cálculo
 */
export interface CotizacionItemInput {
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_impresion_minutos?: number;
  tiempo_preparacion_minutos?: number;
  tiempo_postprocesado_minutos?: number;
  impresora: Impresora;
  material: Material;
  porcentaje_riesgo?: number;
  precio_personalizacion?: number;
  precio_mayorista?: number;
  precio_minorista?: number;
}

/**
 * Desglose detallado de costos unitarios y operativos
 */
export interface DesgloseCostos {
  // Unidades y desglose fino
  costo_material_unit: number;
  costo_energia_unit: number;
  costo_amortizacion_unit: number;
  costo_mantenimiento_unit: number;
  costo_mano_obra_unit: number;
  costo_subtotal_unit: number;
  costo_subtotal_item: number;

  // Propiedades formateadas / resumen para tarjetas de UI
  material_directo: number;
  operacion_preparacion: number;
  depreciacion_maquina: number;
  energia: number;
  subtotal_operativo: number;
  porcentaje_riesgo: number;
  fondo_riesgo: number;
  costo_total_pieza: number;
  porcentaje_utilidad: number;
  utilidad_pieza: number;
  tasa_hora_hombre: number;
  precio_mayorista?: {
    min_pzs: number;
    precio: number;
    descuento_pct: number;
  };
  precio_distribuidor?: {
    min_pzs: number;
    precio: number;
    descuento_pct: number;
  };
}

/**
 * Resultado completo del cálculo de cotización
 */
export interface CotizacionResultado {
  precio_por_pieza: number;
  costo_total_proyecto: number;
  costo_directo_total: number;
  costo_indirecto_total: number;
  costo_fallos_total: number;
  subtotal_costo_base: number;
  monto_ganancia: number;
  monto_impuesto: number;
  precio_final: number;
  margen_ganancia_aplicado_pct: number;
  precio_personalizacion: number;
  precio_mayorista?: number;
  precio_minorista?: number;
  desglose: DesgloseCostos;
}

// Alias de exportación para mantener retrocompatibilidad
export type ResultadoCotizacion = CotizacionResultado;
