// src/features/parametros/hooks/useCalculoManoObra.ts
import { useMemo } from "react";
import { calcularCostoManoObra } from "../utils/manoObra";

export function useCalculoManoObra(
  tiempoInvertidoMinutos: number,
  sueldoMensual: number,
) {
  return useMemo(
    () => calcularCostoManoObra({ tiempoInvertidoMinutos, sueldoMensual }),
    [tiempoInvertidoMinutos, sueldoMensual],
  );
}
