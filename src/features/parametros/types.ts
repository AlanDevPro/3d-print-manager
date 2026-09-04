export const MONEDAS_DISPONIBLES = ["BOB", "USD", "EUR"] as const;

export type MonedaCodigo = (typeof MONEDAS_DISPONIBLES)[number];

export interface DetalleMoneda {
  codigo: MonedaCodigo;
  simbolo: string;
  nombre: string;
}

export const METADATA_MONEDAS: Record<MonedaCodigo, DetalleMoneda> = {
  BOB: { codigo: "BOB", simbolo: "Bs.", nombre: "Boliviano" },
  USD: { codigo: "USD", simbolo: "$", nombre: "Dólar Estadounidense" },
  EUR: { codigo: "EUR", simbolo: "€", nombre: "Euro" },
};

// 🟢 Nuevo modelo adaptado a la tabla sin rangos
export interface ReglaMargenGanancia {
  id: string;
  nombre: string;
  porcentaje: number;
}

export interface TarifasMoneda {
  monedaPrincipal?: MonedaCodigo;
  tarifaElectricaKwh?: number;
  reglasMargen?: ReglaMargenGanancia[];
}

export interface CostosManoObra {
  tiempoInvertidoMinutos?: number;
  sueldoMensual?: number;
  costoHora?: number;
}

export interface ImpresoraDepreciacion {
  id: string;
  nombre: string;
  costo: number;
  horasImpresas: number;
  vidaUtilHoras: number;
  potenciaWatts: number;
  costoMantenimientoHora: number;
}

export interface TarifasEnvio {
  recogidaLocal?: number;
  envioLocalDelivery?: number;
  envioNacionalCourier?: number;
}

export interface PersonalizacionPdf {
  encabezadoPdf?: string;
  piePaginaPdf?: string;
  mostrarDesgloseTecnicoCliente?: boolean;
  diasValidezCotizacion?: number;
}

export interface RespaldoExportacion {
  backupNubeActivo?: boolean;
}

export interface ParametrosAvanzados {
  costoOperativoFijoMensual?: number;
  tasaFalloDefectoPct?: number;
  impuestoPct?: number;
  margenGananciaDefectoPct?: number;
}

export interface EspecificacionMaquina {
  id: string;
  nombre: string;
  potenciaWatts?: number;
  [key: string]: unknown;
}

export interface ConfigParametros {
  tarifas?: TarifasMoneda;
  manoObra?: CostosManoObra;
  impresoras?: ImpresoraDepreciacion[];
  envio?: TarifasEnvio;
  pdf?: PersonalizacionPdf;
  respaldo?: RespaldoExportacion;
  avanzados?: ParametrosAvanzados;
  costo_mano_obra_hora?: number;
}

export type ParametrosOperativos = ConfigParametros & {
  id?: string;
  empresaId?: string | null;
  updatedAt?: string;
};

export const PARAMETROS_VACIOS: ConfigParametros = {
  tarifas: {
    monedaPrincipal: "BOB",
    tarifaElectricaKwh: 0.8,
    reglasMargen: [],
  },
  manoObra: {
    tiempoInvertidoMinutos: 0,
    sueldoMensual: 0,
    costoHora: 0,
  },
  impresoras: [],
  envio: {
    recogidaLocal: 0,
    envioLocalDelivery: 0,
    envioNacionalCourier: 0,
  },
  pdf: {
    encabezadoPdf: "",
    piePaginaPdf: "",
    mostrarDesgloseTecnicoCliente: false,
    diasValidezCotizacion: 15,
  },
  respaldo: {
    backupNubeActivo: true,
  },
  avanzados: {
    costoOperativoFijoMensual: 0,
    tasaFalloDefectoPct: 10,
    impuestoPct: 0,
    margenGananciaDefectoPct: 30,
  },
};

export function esMonedaValida(codigo: string): codigo is MonedaCodigo {
  return MONEDAS_DISPONIBLES.includes(codigo as MonedaCodigo);
}