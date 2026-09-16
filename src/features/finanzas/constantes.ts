// src/features/finanzas/constantes.ts
import { CategoriaEgreso, MetodoPago } from "./types";

/** Orden fijo en el que se muestran las categorías de egreso. */
export const CATEGORIAS_EGRESO: CategoriaEgreso[] = [
  "material",
  "energia",
  "repuestos_reimpresion",
  "mantenimiento",
  "otro",
];

export const LABEL_CATEGORIA_EGRESO: Record<CategoriaEgreso, string> = {
  material: "Material",
  energia: "Energía",
  repuestos_reimpresion: "Repuestos / Reimpresión",
  mantenimiento: "Mantenimiento",
  otro: "Otros",
};

export const COLOR_CATEGORIA_EGRESO: Record<CategoriaEgreso, string> = {
  material: "#3B82F6",
  energia: "#F59E0B",
  repuestos_reimpresion: "#EF4444",
  mantenimiento: "#8B5CF6",
  otro: "#64748B",
};

export const METODOS_PAGO: MetodoPago[] = ["efectivo", "qr", "transferencia"];

export const LABEL_METODO_PAGO: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  transferencia: "Transferencia",
};

export const LABEL_PERIODO = {
  semana: "Semana",
  mes: "Mes",
  anio: "Año",
} as const;

/** Valores de `pedido_impresion_intentos.resultado` que cuentan como fallo. */
export const RESULTADOS_FALLIDOS = new Set([
  "fallido",
  "fallo",
  "fallida",
  "error",
  "cancelado",
  "descartado",
]);

/** Paleta semántica de los gráficos (independiente del theme claro/oscuro). */
export const PALETA_GRAFICOS = {
  ingresos: "#22C55E",
  egresos: "#EF4444",
  margen: "#3B82F6",
  acumulado: "#F59E0B",
  destacado: "#22C55E",
  neutro: "#3B82F6",
  positivo: "#22C55E",
  negativo: "#EF4444",
  positivoBg: "rgba(34,197,94,0.14)",
  negativoBg: "rgba(239,68,68,0.14)",
};

/** Cantidad de meses que alimentan los sparklines y el gráfico de tendencia. */
export const MESES_SERIE = 6;
