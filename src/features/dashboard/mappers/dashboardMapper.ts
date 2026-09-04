// src/features/dashboard/mappers/dashboardMapper.ts
import {
  CotizacionRow,
  CotizacionUI,
  ImpresoraRow,
  ImpresoraUI,
  ModeloUI,
  ProductoCatalogoRow,
} from "../types";

export function mapImpresoraToUI(row: ImpresoraRow): ImpresoraUI {
  return {
    id: row.id,
    nombre: row.marca ? `${row.marca} ${row.modelo}` : row.modelo,
    activa: row.activa,
    enUso: row.activa && row.estado === "imprimiendo",
  };
}

export function mapCotizacionToUI(row: CotizacionRow): CotizacionUI {
  return {
    id: row.id,
    codigo: row.codigo_cotizacion,
    clienteNombre: row.cliente_nombre,
    precioFinal: row.precio_final,
    estado: row.estado,
    createdAt: row.created_at,
  };
}

export function mapProductoToUI(row: ProductoCatalogoRow): ModeloUI {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    imagenUrl: row.imagen_url,
    tiempoHoras: row.tiempo_impresion_horas ?? 0,
    pesoGramos: row.peso_gramos ?? 0,
    precioReferencia: row.precio_referencia ?? 0,
    stockTerminado: row.stock_terminado,
    stockBajo: row.stock_terminado <= row.umbral_stock_bajo,
  };
}
