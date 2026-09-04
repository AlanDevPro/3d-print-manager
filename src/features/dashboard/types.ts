// src/features/dashboard/types.ts

// ---------------------------------------------------------------------------
// Tipos "crudos" — reflejan filas de Supabase (ver src/types/database.ts)
// ---------------------------------------------------------------------------
export type ImpresoraRow = {
  id: string;
  modelo: string;
  marca: string | null;
  activa: boolean;
  estado: string | null; // 'disponible' | 'imprimiendo' | 'mantenimiento'
  empresa_id: string;
};

export type CotizacionRow = {
  id: string;
  codigo_cotizacion: number;
  cliente_nombre: string;
  precio_final: number;
  estado: "pendiente" | "aceptada" | "rechazada" | "completada";
  created_at: string;
  empresa_id: string;
};

export type ProductoCatalogoRow = {
  id: string;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio_referencia: number | null;
  tiempo_impresion_horas: number | null;
  peso_gramos: number | null;
  imagen_url: string | null;
  stock_terminado: number;
  umbral_stock_bajo: number;
  activo: boolean;
  empresa_id: string;
};

export type IngresoRow = {
  monto: number;
  fecha: string;
};

// ---------------------------------------------------------------------------
// Tipos de UI — lo que consumen los componentes
// ---------------------------------------------------------------------------
export type ImpresoraUI = {
  id: string;
  nombre: string;
  activa: boolean;
  enUso: boolean;
};

export type EstadoCotizacion = CotizacionRow["estado"];

export type CotizacionUI = {
  id: string;
  codigo: number;
  clienteNombre: string;
  precioFinal: number;
  estado: EstadoCotizacion;
  createdAt: string;
};

export type ModeloUI = {
  id: string;
  nombre: string;
  categoria: string | null;
  imagenUrl: string | null;
  tiempoHoras: number;
  pesoGramos: number;
  precioReferencia: number;
  stockTerminado: number;
  stockBajo: boolean;
};

export type DashboardKpis = {
  cotizacionesPendientes: number;
  ingresosMes: number;
  impresorasEnUso: number;
  impresorasTotal: number;
};
