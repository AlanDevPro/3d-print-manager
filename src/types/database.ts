//src/types/database.ts
// ============================================================================
// TIPOS QUE REFLEJAN LAS TABLAS DE SUPABASE (VERIFICADO CONTRA information_schema)
// ============================================================================

export type RolUsuario = "admin" | "empleado" | "cliente";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  telefono: string | null;
  plan: string;
  verificado: boolean;
  rol: RolUsuario;
  updated_at: string;
  created_at: string;
}

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

// 👇 Verificado 1:1 contra tu information_schema para "impresoras"
export interface Impresora {
  id: string;
  user_id: string;
  modelo: string;
  marca: string;
  costo_compra: number;
  vida_util_horas: number;
  potencia_watts: number;
  costo_mantenimiento_hora: number;
  horas_uso_total: number;
  estado: string;
  pedido_actual: string | null;
  fecha_adquisicion: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

// 👇 Verificado 1:1 contra tu information_schema para "filamentos"
// (la tabla ya no se llama "materiales")
export interface Filamento {
  id: string;
  user_id: string;
  marca: string;
  material: string;
  color: string;
  color_hex: string;
  stock_gramos: number;
  capacidad_rollo_gramos: number;
  costo_compra: number;
  proveedor: string;
  fecha_compra: string;
  umbral_bajo_stock: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PiezaStock {
  id: string;
  user_id: string;
  cotizacion_id: string | null;
  nombre: string;
  cantidad: number;
  asignada: boolean;
  cliente: string | null;
  fecha_impresion: string;
  precio_venta: number;
  created_at: string;
  updated_at: string;
}

export interface ReglaMargenGanancia {
  id: string;
  user_id: string;
  cantidad_minima: number;
  cantidad_maxima: number | null;
  margen_ganancia_pct: number;
  created_at: string;
}

export interface Empresa {
  id: string;
  creado_por: string | null;
  logo_url: string | null;
  nombre_comercial: string;
  nit: string | null;
  razon_social: string | null;
  direccion_fiscal: string | null;
  ciudad: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  sitio_web: string | null;
  garantia: string | null;
  es_singleton: boolean;
  created_at: string;
  updated_at: string;
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

// ============================================================================
// VALORES DE ESTADO INICIAL / ESTRUCTURAS VACÍAS
// ============================================================================

export const PROFILE_VACIO: Profile = {
  id: "",
  email: "",
  full_name: null,
  avatar_url: null,
  telefono: null,
  plan: "free",
  verificado: false,
  rol: "cliente",
  created_at: "",
  updated_at: "",
};

export const EMPRESA_VACIA: Empresa = {
  id: "",
  creado_por: null,
  logo_url: null,
  nombre_comercial: "JEDD3DLAB",
  nit: null,
  razon_social: null,
  direccion_fiscal: null,
  ciudad: "Sucre, Chuquisaca",
  whatsapp: "+591 76688760",
  instagram: "@jedd3dlab",
  facebook: null,
  sitio_web: null,
  garantia:
    "Ofrecemos 15 días de garantía por defectos de impresión atribuibles al taller. No cubre daños por mal uso, exposición al sol o cargas mecánicas fuera de especificación.",
  es_singleton: true,
  created_at: "",
  updated_at: "",
};
