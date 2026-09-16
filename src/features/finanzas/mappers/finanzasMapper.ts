// src/features/finanzas/mappers/finanzasMapper.ts
//
// Traducen las filas crudas de Supabase a los tipos que consume la UI.
// Cada campo corresponde a una columna real del esquema.

import { CATEGORIAS_EGRESO, RESULTADOS_FALLIDOS } from "../constantes";
import {
  CategoriaEgreso,
  ConfiguracionEmpresaUI,
  EgresoUI,
  FilamentoStockUI,
  IngresoUI,
  IntentoImpresionUI,
  MetaFinancieraUI,
  MetodoPago,
} from "../types";
import { formatearFecha } from "../utils/finanzasFormato";

const num = (v: any, porDefecto = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : porDefecto;
};

function normalizarMetodo(valor: any): MetodoPago {
  return valor === "qr" || valor === "transferencia" ? valor : "efectivo";
}

function normalizarCategoriaEgreso(valor: any): CategoriaEgreso {
  return CATEGORIAS_EGRESO.includes(valor) ? valor : "otro";
}

/** ingresos + join a clientes(nombre) y catalogo_productos(nombre, categoria) */
export function mapIngresoDesdeDB(row: any): IngresoUI {
  const fechaISO = (row.fecha ?? "").slice(0, 10);
  return {
    id: row.id,
    concepto: row.concepto ?? "Venta",
    clienteNombre: row.clientes?.nombre ?? "Cliente mostrador",
    productoId: row.producto_id ?? null,
    productoNombre: row.catalogo_productos?.nombre ?? "Sin producto",
    productoCategoria: row.catalogo_productos?.categoria ?? null,
    monto: num(row.monto),
    metodo: normalizarMetodo(row.metodo),
    fecha: formatearFecha(fechaISO),
    fechaISO,
  };
}

export function mapEgresoDesdeDB(row: any): EgresoUI {
  const fechaISO = (row.fecha ?? "").slice(0, 10);
  return {
    id: row.id,
    concepto: row.concepto ?? "",
    categoria: normalizarCategoriaEgreso(row.categoria),
    monto: num(row.monto),
    metodo: normalizarMetodo(row.metodo),
    fecha: formatearFecha(fechaISO),
    fechaISO,
  };
}

/** filamentos: la tabla NO tiene columna `nombre`, se arma con marca/material/color */
export function mapFilamentoDesdeDB(row: any): FilamentoStockUI {
  const nombre = [row.marca, row.material, row.color].filter(Boolean).join(" ");
  return {
    id: row.id,
    nombre: nombre || "Filamento sin identificar",
    color: row.color_hex ?? "#CCCCCC",
    gramosRestantes: num(row.stock_gramos),
    gramosPorRollo: num(row.capacidad_rollo_gramos, 1000) || 1000,
    umbralBajoStock: num(row.umbral_bajo_stock, 0),
  };
}

/** pedido_impresion_intentos: fuente real de gramos y horas impresas */
export function mapIntentoImpresionDesdeDB(row: any): IntentoImpresionUI {
  const fecha = row.finalizado_at ?? row.iniciado_at ?? row.created_at ?? "";
  return {
    id: row.id,
    fechaISO: String(fecha).slice(0, 10),
    gramos: num(row.gramos_reales ?? row.gramos_planificados),
    horas: num(row.horas_reales ?? row.horas_planificadas),
    fallido: RESULTADOS_FALLIDOS.has(String(row.resultado ?? "").toLowerCase()),
  };
}

export function mapMetaFinancieraDesdeDB(row: any): MetaFinancieraUI {
  return {
    id: row.id,
    periodo: row.periodo,
    montoMeta: num(row.monto_meta),
  };
}

export function mapConfiguracionEmpresaDesdeDB(
  row: any,
): ConfiguracionEmpresaUI {
  return {
    moneda: row?.moneda ?? "Bs",
    costoKwh: num(row?.costo_kwh),
    costoManoObraHora: num(row?.costo_mano_obra_hora),
    costoOperativoFijoMensual: num(row?.costo_operativo_fijo_mensual),
    horasLaborablesMes: num(row?.horas_laborables_mes, 160),
    tasaFalloDefectoPct: num(row?.tasa_fallo_defecto_pct),
    impuestoPct: num(row?.impuesto_pct),
    margenGananciaDefectoPct: num(row?.margen_ganancia_defecto_pct),
  };
}
