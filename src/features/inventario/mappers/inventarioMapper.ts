import type {
  Filamento,
  Impresora,
  NuevaImpresora,
  NuevoFilamento,
  PiezaStock,
} from "../types";

type FilamentoRow = {
  id: string;
  marca: string | null;
  material: string;
  color: string | null;
  color_hex: string | null;
  capacidad_rollo_gramos: number;
  costo_compra: number;
  stock_gramos: number;
  umbral_bajo_stock: number | null;
  fecha_compra: string | null;
  proveedor: string | null;
  activo: boolean | null;
  empresa_id: string;
  imagen_url: string | null;
};

type ImpresoraRow = {
  id: string;
  marca: string | null;
  modelo: string;
  estado: string | null;
  pedido_actual: string | null;
  horas_uso_total: number | null;
  vida_util_horas: number;
  potencia_watts: number;
  costo_mantenimiento_hora: number;
  costo_compra: number;
  fecha_adquisicion: string | null;
  activa: boolean | null;
  empresa_id: string;
  imagen_url: string | null;
};

type PiezaStockRow = {
  id: string;
  nombre: string;
  cantidad: number;
  precio_venta: number;
  asignada: boolean | null;
  cliente: string | null;
  fecha_impresion: string | null;
  imagen_url?: string | null;
};

export function mapFilamentoRow(row: FilamentoRow): Filamento {
  return {
    id: row.id,
    marca: row.marca ?? "—",
    tipo: row.material,
    color: row.color ?? "—",
    colorHex: row.color_hex ?? "#999999",
    capacidadRolloGramos: Number(row.capacidad_rollo_gramos),
    costoCompra: Number(row.costo_compra),
    stockGramos: Number(row.stock_gramos),
    umbralBajoStock: Number(row.umbral_bajo_stock ?? 200),
    fechaCompra: row.fecha_compra,
    proveedor: row.proveedor ?? "—",
    activo: row.activo ?? true,
    imagenUrl: row.imagen_url ?? null,
  };
}

export function mapFilamentoToInsertRow(
  nuevo: NuevoFilamento,
  empresaId: string,
  imagenUrl: string | null = null
) {
  return {
    empresa_id: empresaId,
    marca: nuevo.marca,
    material: nuevo.tipo,
    color: nuevo.color,
    color_hex: nuevo.colorHex,
    capacidad_rollo_gramos: nuevo.capacidadRolloGramos,
    costo_compra: nuevo.costoCompra,
    stock_gramos: nuevo.stockGramos,
    umbral_bajo_stock: nuevo.umbralBajoStock,
    fecha_compra: nuevo.fechaCompra,
    proveedor: nuevo.proveedor,
    imagen_url: imagenUrl,
  };
}

export function mapImpresoraRow(row: ImpresoraRow): Impresora {
  return {
    id: row.id,
    modelo: row.modelo,
    marca: row.marca ?? "—",
    estado: (row.estado as Impresora["estado"]) ?? "disponible",
    pedidoActual: row.pedido_actual,
    horasUsoTotal: Number(row.horas_uso_total ?? 0),
    vidaUtilHoras: row.vida_util_horas,
    consumoWatts: Number(row.potencia_watts),
    costoMantenimientoHora: Number(row.costo_mantenimiento_hora),
    costoAdquisicion: Number(row.costo_compra),
    fechaAdquisicion: row.fecha_adquisicion,
    activa: row.activa ?? true,
    imagenUrl: row.imagen_url ?? null,
  };
}

export function mapImpresoraToInsertRow(
  nueva: NuevaImpresora,
  empresaId: string,
  imagenUrl: string | null = null
) {
  return {
    empresa_id: empresaId,
    modelo: nueva.modelo,
    marca: nueva.marca,
    costo_compra: nueva.costoAdquisicion,
    vida_util_horas: nueva.vidaUtilHoras,
    potencia_watts: nueva.consumoWatts,
    costo_mantenimiento_hora: nueva.costoMantenimientoHora,
    imagen_url: imagenUrl,
  };
}

export function mapPiezaStockRow(row: PiezaStockRow): PiezaStock {
  const umbralDefecto = 2;
  return {
    id: row.id,
    nombre: row.nombre,
    cantidad: row.cantidad,
    precioVenta: Number(row.precio_venta ?? 0),
    umbralStockBajo: umbralDefecto,
    bajoStock: row.cantidad <= umbralDefecto,
    imagenUrl: row.imagen_url ?? null,
  };
}