export type SubPestanaInventario = "filamentos" | "piezas" | "impresoras";

export type EstadoImpresora = "imprimiendo" | "inactiva" | "mantenimiento";

export type Filamento = {
  id: string;
  marca: string;
  tipo: string;
  color: string;
  colorHex: string;
  capacidadRolloGramos: number;
  costoCompra: number;
  stockGramos: number;
  umbralBajoStock: number;
  fechaCompra: string | null;
  proveedor: string;
  activo: boolean;
  imagenUrl: string | null;
};

export type NuevoFilamento = Omit<Filamento, "id" | "activo" | "imagenUrl"> & {
  imagenFile?: File | string | null;
  imagenUrl?: File | string | null;
};

export type Impresora = {
  id: string;
  modelo: string;
  marca: string;
  estado: EstadoImpresora;
  pedidoActual: string | null;
  horasUsoTotal: number;
  vidaUtilHoras: number;
  consumoWatts: number;
  costoMantenimientoHora: number;
  costoAdquisicion: number;
  fechaAdquisicion: string | null;
  activa: boolean;
  imagenUrl: string | null;
};

export type NuevaImpresora = {
  modelo: string;
  marca: string;
  costoAdquisicion: number;
  vidaUtilHoras: number;
  consumoWatts: number;
  costoMantenimientoHora: number;
  imagenUrl?: File | string | null;
  imagenFile?: File | string | null;
};

export type PiezaStock = {
  id: string;
  nombre: string;
  cantidad: number;
  precioVenta: number;
  umbralStockBajo: number;
  bajoStock: boolean;
  imagenUrl: string | null;
};
