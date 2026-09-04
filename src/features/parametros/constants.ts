// src/features/parametros/constants.ts
import { ParametrosState } from "./types";

export const HORAS_LABORALES_MES = 160;

export const PARAMETROS_ESTATICOS_INICIALES: ParametrosState = {
  tarifas: {
    monedaPrincipal: "BOB",
    tarifaElectricaKwh: 0.8,
    rangosUtilidad: [{ id: "1", minimo: 1, maximo: 19, porcentaje: 80 }],
  },
  manoObra: {
    tiempoInvertidoMinutos: 90, // 1.5 horas = 90 min
    sueldoMensual: 3500,
  },
  impresoras: [
    {
      id: "1",
      nombre: "Ender 3 V2",
      costo: 2200,
      horasImpresas: 650,
      vidaUtilHoras: 2500,
    },
    {
      id: "2",
      nombre: "Bambu Lab P1S",
      costo: 6800,
      horasImpresas: 1200,
      vidaUtilHoras: 5000,
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
};
