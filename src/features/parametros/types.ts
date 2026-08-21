// src/features/parametros/types.ts

export type MonedaCodigo = "BOB" | "USD" | "EUR";

export interface TarifasMoneda {
  monedaPrincipal: MonedaCodigo;
  tarifaElectricaKwh: number;
  margenGananciaPct: number;
}

export interface CostosManoObra {
  disenoModelado3dHora: number;
  slicingPreparacionHora: number;
  postprocesadoAcabadoHora: number;
}

export interface DepreciacionMantenimiento {
  depreciacionMaquinaHora: number;
  fondoReservaRepuestosHora: number;
  factorFallasPct: number;
}

export interface TarifasEnvio {
  recogidaLocal: number;
  envioLocalDelivery: number;
  envioNacionalCourier: number;
}

export interface NotificacionesAlertas {
  limiteBajoStockGramos: number;
  recordatorioEntregaHoras: number;
  alertaMantenimientoImpresorasHoras: number;
}

export interface PersonalizacionPdf {
  encabezadoPdf: string;
  piePaginaPdf: string;
  mostrarDesgloseTecnicoCliente: boolean;
  diasValidezCotizacion: number;
}

export interface RespaldoExportacion {
  formatoExportacion: "csv" | "excel";
  backupNubeActivo: boolean;
  ultimoBackupIso: string | null;
}

export interface ParametrosOperativos {
  id?: string;
  userId: string;
  tarifas: TarifasMoneda;
  manoObra: CostosManoObra;
  depreciacion: DepreciacionMantenimiento;
  envio: TarifasEnvio;
  notificaciones: NotificacionesAlertas;
  pdf: PersonalizacionPdf;
  respaldo: RespaldoExportacion;
  updatedAt?: string;
}

export type SeccionParametros =
  | "tarifas"
  | "manoObra"
  | "depreciacion"
  | "envio"
  | "notificaciones"
  | "pdf"
  | "respaldo";

export const PARAMETROS_DEFAULT: Omit<ParametrosOperativos, "userId"> = {
  tarifas: {
    monedaPrincipal: "BOB",
    tarifaElectricaKwh: 0.87,
    margenGananciaPct: 40,
  },
  manoObra: {
    disenoModelado3dHora: 40,
    slicingPreparacionHora: 15,
    postprocesadoAcabadoHora: 20,
  },
  depreciacion: {
    depreciacionMaquinaHora: 2.5,
    fondoReservaRepuestosHora: 1,
    factorFallasPct: 8,
  },
  envio: {
    recogidaLocal: 0,
    envioLocalDelivery: 10,
    envioNacionalCourier: 25,
  },
  notificaciones: {
    limiteBajoStockGramos: 150,
    recordatorioEntregaHoras: 24,
    alertaMantenimientoImpresorasHoras: 200,
  },
  pdf: {
    encabezadoPdf: "",
    piePaginaPdf: "",
    mostrarDesgloseTecnicoCliente: true,
    diasValidezCotizacion: 15,
  },
  respaldo: {
    formatoExportacion: "excel",
    backupNubeActivo: true,
    ultimoBackupIso: null,
  },
};
