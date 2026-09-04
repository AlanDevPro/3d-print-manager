//src/features/finanzas/types.ts
export type MetodoPago = "efectivo" | "qr" | "transferencia";

export type CategoriaEgreso =
  | "material"
  | "energia"
  | "repuestos_reimpresion"
  | "mantenimiento"
  | "otro";

export type Periodo = "semana" | "mes";

export type RolEmpresa = "admin" | "empleado" | "cliente";

export interface IngresoUI {
  id: string;
  concepto: string;
  clienteNombre: string;
  productoNombre: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
}

export interface EgresoUI {
  id: string;
  concepto: string;
  categoria: CategoriaEgreso;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
}

export interface FilamentoStockUI {
  id: string;
  nombre: string;
  color: string;
  gramosRestantes: number;
  gramosPorRollo: number;
  umbralBajoStock?: number;
}

export interface ProductoRentabilidadUI {
  productoId: string;
  nombre: string;
  unidadesVendidas: number;
  totalGenerado: number;
}

export interface ClienteStatsUI {
  clienteId: string;
  nombre: string;
  totalPagado: number;
  pedidosTotales: number;
  recurrente: boolean;
}

export interface TendenciaMensual {
  labels: string[];
  ingresos: number[];
  egresos: number[];
}

export interface MetaFinancieraUI {
  id: string;
  periodo: string;
  montoMeta: number;
}

export interface ResumenFinancieroUI {
  totalIngresos: number;
  totalEgresos: number;
  utilidadNeta: number;
  cobrosPendientes: number;
  porMetodoIngresos: Record<MetodoPago, number>;
  porCategoriaEgresos: Record<CategoriaEgreso, number>;
  ticketPromedio: number;
  cantidadIngresos: number;
}
