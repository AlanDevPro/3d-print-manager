// src/features/finanzas/types.ts

export type MetodoPago = "efectivo" | "qr" | "transferencia";

export type CategoriaEgreso =
  | "material"
  | "energia"
  | "repuestos_reimpresion"
  | "mantenimiento"
  | "otro";

export type Periodo = "semana" | "mes" | "anio";

export type RolEmpresa = "admin" | "empleado" | "cliente";

export interface RangoFechas {
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Movimientos
// ---------------------------------------------------------------------------
export interface IngresoUI {
  id: string;
  concepto: string;
  clienteNombre: string;
  productoId: string | null;
  productoNombre: string;
  productoCategoria: string | null;
  monto: number;
  metodo: MetodoPago;
  fecha: string; // formateada para UI (DD/MM/YYYY)
  fechaISO: string; // YYYY-MM-DD, para cálculos y agrupaciones
}

export interface EgresoUI {
  id: string;
  concepto: string;
  categoria: CategoriaEgreso;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  fechaISO: string;
}

// ---------------------------------------------------------------------------
// Inventario / producción
// ---------------------------------------------------------------------------
export interface FilamentoStockUI {
  id: string;
  nombre: string; // marca + material + color
  color: string; // color_hex
  gramosRestantes: number;
  gramosPorRollo: number;
  umbralBajoStock: number;
}

/** Un intento de impresión ya finalizado (tabla pedido_impresion_intentos). */
export interface IntentoImpresionUI {
  id: string;
  fechaISO: string;
  gramos: number;
  horas: number;
  fallido: boolean;
}

export interface ProduccionResumenUI {
  gramos: number;
  horas: number;
  intentos: number;
  intentosFallidos: number;
  tasaFalloPct: number;
}

// ---------------------------------------------------------------------------
// Rentabilidad
// ---------------------------------------------------------------------------
export interface ProductoRentabilidadUI {
  productoId: string;
  nombre: string;
  categoria: string | null;
  ventas: number; // cantidad de ingresos asociados al producto
  totalGenerado: number;
}

export interface ProductoParetoUI extends ProductoRentabilidadUI {
  pctAcumulado: number;
}

export interface ParetoUI {
  items: ProductoParetoUI[];
  total: number;
  /** índice del último producto que forma el 80% acumulado (-1 si no hay datos) */
  indiceCorte80: number;
}

// ---------------------------------------------------------------------------
// Series y agregados
// ---------------------------------------------------------------------------
export interface MesFinancieroUI {
  clave: string; // YYYY-MM
  etiqueta: string; // Ene, Feb, ...
  ingresos: number;
  egresos: number;
  utilidad: number;
  margenPct: number;
  cantidadIngresos: number;
  ticketPromedio: number;
  gramos: number;
  horas: number;
  costoPorHora: number;
}

export interface DesgloseEgresoUI {
  label: string;
  monto: number;
  pct: number;
}

export interface CategoriaEgresoUI {
  id: CategoriaEgreso;
  label: string;
  color: string;
  monto: number;
  pct: number;
  desglose: DesgloseEgresoUI[];
}

export interface KpiUI {
  id: string;
  label: string;
  valor: string;
  deltaPct: number;
  /** true cuando bajar es bueno (ej. costo por hora) */
  invertido: boolean;
  serie: number[];
}

export interface MetaFinancieraUI {
  id: string;
  periodo: string;
  montoMeta: number;
}

export interface ConfiguracionEmpresaUI {
  moneda: string;
  costoKwh: number;
  costoManoObraHora: number;
  costoOperativoFijoMensual: number;
  horasLaborablesMes: number;
  tasaFalloDefectoPct: number;
  impuestoPct: number;
  margenGananciaDefectoPct: number;
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
  margenPct: number;
}
