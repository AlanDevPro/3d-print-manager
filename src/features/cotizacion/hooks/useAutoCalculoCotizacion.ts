// src/features/cotizacion/hooks/useAutoCalculoCotizacion.ts
import { useEffect, useState } from "react";
import { validarCotizacionForm } from "@/features/cotizacion/utils/validarCotizacionForm";
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import type { ReglaMargen } from "@/features/cotizacion/types/formTypes";

interface UseAutoCalculoCotizacionParams {
  form: UseCotizacionReturn["form"];
  piezas: UseCotizacionReturn["piezas"];
  updateField: UseCotizacionReturn["updateField"];
  calcular: UseCotizacionReturn["calcular"];
  reglasMargen: ReglaMargen[];
  esPersonalizado: boolean;
}

export function useAutoCalculoCotizacion({
  form,
  piezas,
  updateField,
  calcular,
  reglasMargen,
  esPersonalizado,
}: UseAutoCalculoCotizacionParams) {
  const [validationError, setValidationError] = useState<string | null>(null);

  // 1. Aplica la regla de margen predeterminada si el usuario aún no eligió una
  useEffect(() => {
    if (
      (!form.regla_margen_id || !form.margen_ganancia_pct) &&
      reglasMargen.length > 0
    ) {
      const reglaDefault =
        reglasMargen.find((r) => r.es_predeterminado) || reglasMargen[0];
      if (reglaDefault) {
        updateField(
          "margen_ganancia_pct",
          String(reglaDefault.margen_ganancia_pct)
        );
        updateField("regla_margen_id", reglaDefault.id);
      }
    }
  }, [reglasMargen, form.regla_margen_id, form.margen_ganancia_pct, updateField]);

  // 2. Auto-cálculo con debounce enfocado ÚNICAMENTE en parámetros de cotización técnica
  useEffect(() => {
    const timer = setTimeout(() => {
      // Validamos los parámetros requeridos antes de lanzar la cotización
      const errorEncontrado = validarCotizacionForm(
        form,
        piezas,
        esPersonalizado
      );
      setValidationError(errorEncontrado);

      // Ejecutar el cálculo ignorando si existe o no imagen_referencia
      if (!errorEncontrado) {
        calcular();
      }
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Dependencias estrictas del cálculo técnico y matemático
    form.filamento_id,
    form.impresora_id,
    form.porcentaje_riesgo,
    form.precio_personalizacion,
    form.margen_ganancia_pct,
    form.regla_margen_id,
    form.tiempo_preparacion_minutos,
    form.tiempo_postprocesado_minutos,
    esPersonalizado,
    // Serialización limpia de piezas para evitar re-renderizados infinitos por referencia
    JSON.stringify(piezas),
    // NOTA: Se excluyen intencionalmente metadatos que no afectan el cálculo técnico:
    // - form.imagen_referencia (evita resetear el cálculo al tomar/subir fotos)
    // - form.nombre_cliente
    // - form.telefono_cliente
  ]);

  return { validationError };
}