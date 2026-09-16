// src/features/cotizacion/hooks/useAutoCalculoCotizacion.ts
import { useEffect, useRef } from "react";

import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";

interface UseAutoCalculoCotizacionParams {
  /** Solo se calcula cuando la validación secuencial está 100% completa */
  habilitado: boolean;
  form: UseCotizacionReturn["form"];
  piezas: UseCotizacionReturn["piezas"];
  calcular: UseCotizacionReturn["calcular"];
  /** ms de espera tras el último cambio antes de recalcular */
  debounceMs?: number;
}

/**
 * Motor de cálculo en tiempo real.
 *
 * Reglas:
 *  - NUNCA calcula si `habilitado` es false (evita cotizar sin filamento/impresora).
 *  - Calcula una sola vez por combinación de datos (firma), incluso si `calcular`
 *    falla, para no entrar en un bucle de reintentos cada 350 ms.
 *  - La firma incluye TODOS los campos que en useCotizacion invalidan el
 *    resultado (setResultado(null)), incluida la foto de cada pieza.
 */
export function useAutoCalculoCotizacion({
  habilitado,
  form,
  piezas,
  calcular,
  debounceMs = 350,
}: UseAutoCalculoCotizacionParams) {
  const firma = JSON.stringify({
    filamento_id: form.filamento_id,
    impresora_id: form.impresora_id,
    regla_margen_id: form.regla_margen_id,
    margen_ganancia_pct: form.margen_ganancia_pct,
    porcentaje_riesgo: form.porcentaje_riesgo,
    precio_personalizacion: form.precio_personalizacion,
    precio_mayorista: form.precio_mayorista,
    precio_minorista: form.precio_minorista,
    tiempo_preparacion_minutos: form.tiempo_preparacion_minutos,
    tiempo_postprocesado_minutos: form.tiempo_postprocesado_minutos,
    piezas: piezas.map((p) => ({
      id: p.id,
      nombre_pieza: p.nombre_pieza,
      peso_gramos: p.peso_gramos,
      cantidad: p.cantidad,
      tiempo_impresion_horas: p.tiempo_impresion_horas,
      tiempo_impresion_minutos: p.tiempo_impresion_minutos,
      foto_pieza: p.foto_pieza,
    })),
  });

  const firmaIntentada = useRef<string | null>(null);
  const calcularRef = useRef(calcular);

  useEffect(() => {
    calcularRef.current = calcular;
  }, [calcular]);

  useEffect(() => {
    if (!habilitado) {
      firmaIntentada.current = null;
      return;
    }

    if (firmaIntentada.current === firma) return;

    const timer = setTimeout(() => {
      firmaIntentada.current = firma;
      calcularRef.current();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [habilitado, firma, debounceMs]);
}
