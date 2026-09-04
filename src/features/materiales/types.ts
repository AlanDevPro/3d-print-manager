//src/features/materiales/types.ts

/* ============================================================================
   ENTIDADES BASE DE LA BASE DE DATOS (ESQUEMA MULTITENANT)
   ============================================================================ */

export interface ConfiguracionEmpresa {
  empresa_id: string;
  costo_kwh: number;
  costo_mano_obra_hora: number;
  costo_operativo_fijo_mensual: number;
  horas_laborables_mes: number;
  tasa_fallo_defecto_pct: number;
  impuesto_pct: number;
  margen_ganancia_defecto_pct: number;
  moneda: string;
  qr_pago_url: string | null;
  qr_pago_titular: string | null;
  updated_at: string;
}

export interface Filamento {
  id: string;
  empresa_id: string;
  marca: string;
  material: string;
  color: string;
  color_hex?: string | null;
  capacidad_rollo_gramos: number;
  costo_compra: number;
  stock_gramos: number;
  proveedor?: string | null;
  fecha_compra?: string | null;
  umbral_bajo_stock?: number | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Impresora {
  id: string;
  empresa_id: string;
  marca: string;
  modelo: string;
  costo_compra: number;
  vida_util_horas: number;
  potencia_watts: number;
  costo_mantenimiento_hora: number;
  horas_uso_total: number;
  estado: string;
  pedido_actual?: string | null;
  fecha_adquisicion?: string | null;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReglaMargenGanancia {
  id: string;
  empresa_id: string;
  nombre: string;
  margen_ganancia_pct: number;
  created_at?: string;
}

// Alias para mantener compatibilidad con el módulo de cotizaciones
export type Material = Filamento;

/* ============================================================================
   PAYLOADS E INTERFACES DE ENTRADA / SALIDA
   ============================================================================ */

/**
 * Payload para crear/actualizar un Filamento
 */
export interface FilamentoInput {
  marca: string;
  material: string;
  color: string;
  color_hex?: string;
  capacidad_rollo_gramos: number;
  costo_compra: number;
  stock_gramos: number;
  proveedor?: string;
  fecha_compra?: string;
  umbral_bajo_stock?: number;
  activo?: boolean;
}

/**
 * Payload para crear/actualizar una Impresora
 */
export interface ImpresoraInput {
  marca: string;
  modelo: string;
  costo_compra: number;
  vida_util_horas: number;
  potencia_watts: number;
  costo_mantenimiento_hora: number;
  horas_uso_total?: number;
  estado?: string;
  pedido_actual?: string | null;
  fecha_adquisicion?: string;
  activa?: boolean;
}

export interface DatosTallerBase {
  filamentos: Filamento[];
  impresoras: Impresora[];
  configuracion: ConfiguracionEmpresa;
  reglasMargen: ReglaMargenGanancia[];
}
