import {
  ClienteStatsUI,
  EgresoUI,
  FilamentoStockUI,
  IngresoUI,
  MetaFinancieraUI,
  ProductoRentabilidadUI,
} from "../types";

function formatearFecha(fechaISO: string): string {
  if (!fechaISO) return "";
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

export function mapIngresoDesdeDB(row: any): IngresoUI {
  return {
    id: row.id,
    concepto: row.concepto,
    clienteNombre: row.clientes?.nombre ?? "Cliente mostrador",
    productoNombre: row.catalogo_productos?.nombre ?? "Otro",
    monto: Number(row.monto ?? 0),
    metodo: row.metodo,
    fecha: formatearFecha(row.fecha),
  };
}

export function mapEgresoDesdeDB(row: any): EgresoUI {
  return {
    id: row.id,
    concepto: row.concepto,
    categoria: row.categoria,
    monto: Number(row.monto ?? 0),
    metodo: row.metodo,
    fecha: formatearFecha(row.fecha),
  };
}

export function mapFilamentoDesdeDB(row: any): FilamentoStockUI {
  const componentesNombre = [row.marca, row.material, row.color]
    .filter(Boolean)
    .join(" ");

  const nombreConsolidado = row.nombre ?? componentesNombre;

  return {
    id: row.id,
    nombre: nombreConsolidado || "Filamento sin nombre",
    color: row.color_hex ?? "#CCCCCC",
    gramosRestantes: Number(row.stock_gramos ?? row.gramos_restantes ?? 0),
    gramosPorRollo: Number(
      row.capacidad_rollo_gramos ?? row.gramos_por_rollo ?? 1000,
    ),
    umbralBajoStock: Number(row.umbral_bajo_stock ?? 200),
  };
}

export function mapProductoRentabilidadDesdeDB(
  row: any,
): ProductoRentabilidadUI {
  return {
    productoId: row.producto_id ?? row.id,
    nombre: row.nombre ?? "Producto no especificado",
    unidadesVendidas: Number(
      row.unidades_vendidas ?? row.cantidad_vendida ?? 0,
    ),
    totalGenerado: Number(
      row.total_generado ?? row.total_ventas ?? row.total_ingresos ?? 0,
    ),
  };
}

export function mapClienteStatsDesdeDB(row: any): ClienteStatsUI {
  return {
    clienteId: row.cliente_id ?? row.id,
    nombre: row.nombre ?? "Sin nombre",
    totalPagado: Number(row.total_gastado ?? row.total_pagado ?? 0), // Resuelto: Lee total_gastado de la vista
    pedidosTotales: Number(row.total_pedidos ?? row.pedidos_totales ?? 0),
    recurrente: !!row.recurrente,
  };
}

export function mapMetaFinancieraDesdeDB(row: any): MetaFinancieraUI {
  return {
    id: row.id,
    periodo: row.periodo,
    montoMeta: Number(row.monto_meta ?? 0),
  };
}
