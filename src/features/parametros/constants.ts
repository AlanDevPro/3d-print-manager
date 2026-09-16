// src/features/parametros/constants.ts
import { ConfigParametros } from "./types";

export const HORAS_LABORALES_MES = 160;

export const PARAMETROS_ESTATICOS_INICIALES: ConfigParametros = {
  tarifas: {
    monedaPrincipal: "BOB",
    tarifaElectricaKwh: 0.8,
    reglasMargen: [{ id: "1", nombre: "Margen General", porcentaje: 80 }],
  },
  manoObra: {
    tiempoInvertidoMinutos: 90, // 1.5 horas = 90 min
    sueldoMensual: 3500,
    costoHora: 3500 / HORAS_LABORALES_MES,
  },
  impresoras: [
    {
      id: "1",
      nombre: "Ender 3 V2",
      costo: 2200,
      horasImpresas: 650,
      vidaUtilHoras: 2500,
      potenciaWatts: 220,
      costoMantenimientoHora: 2,
    },
    {
      id: "2",
      nombre: "Bambu Lab P1S",
      costo: 6800,
      horasImpresas: 1200,
      vidaUtilHoras: 5000,
      potenciaWatts: 350,
      costoMantenimientoHora: 3,
    },
  ],
  envio: {
    recogidaLocal: 0,
    envioLocalDelivery: 15,
    envioNacionalCourier: 35,
  },
  pdf: {
    encabezadoPdf: "Taller 3D Sucre",
    piePaginaPdf: "Gracias por su preferencia. Cotización válida por 15 días.",
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
