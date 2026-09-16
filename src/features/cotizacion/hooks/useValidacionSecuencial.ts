// src/features/cotizacion/hooks/useValidacionSecuencial.ts
import { useMemo } from "react";

import {
    validarSecuenciaCotizacion,
    type EntradaValidacion,
    type ResultadoValidacionSecuencial,
} from "@/features/cotizacion/utils/validarSecuenciaCotizacion";

export function useValidacionSecuencial(
  entrada: EntradaValidacion,
): ResultadoValidacionSecuencial {
  const {
    form,
    piezas,
    materiales,
    impresoras,
    reglasMargen,
    esPersonalizado,
  } = entrada;

  return useMemo(
    () =>
      validarSecuenciaCotizacion({
        form,
        piezas,
        materiales,
        impresoras,
        reglasMargen,
        esPersonalizado,
      }),
    [form, piezas, materiales, impresoras, reglasMargen, esPersonalizado],
  );
}
