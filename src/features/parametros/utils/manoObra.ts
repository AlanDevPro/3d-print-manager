// src/features/parametros/utils/manoObra.ts
export const HORAS_LABORALES_MES = 160;

export interface ManoObraInput {
  tiempoInvertidoMinutos: number;
  sueldoMensual: number;
}

export interface ManoObraResultado {
  costoPorHora: number;
  precioManoObraPorImpresion: number;
}

export function calcularCostoManoObra({
  tiempoInvertidoMinutos,
  sueldoMensual,
}: ManoObraInput): ManoObraResultado {
  const costoPorHora =
    sueldoMensual > 0 ? sueldoMensual / HORAS_LABORALES_MES : 0;
  const precioManoObraPorImpresion =
    costoPorHora * tiempoInvertidoMinutos * (1 / 60);

  return { costoPorHora, precioManoObraPorImpresion };
}
