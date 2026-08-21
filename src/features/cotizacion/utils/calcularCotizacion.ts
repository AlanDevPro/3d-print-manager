import {
  ConfiguracionUsuario,
  CotizacionItemInput,
  ReglaMargenGanancia,
  ResultadoCotizacion,
} from "../types";

/**
 * Función auxiliar para resolver el margen de ganancia adecuado
 * evaluando prioritariamente la tabla de la base de datos `reglas_margen_ganancia`.
 */
function obtenerMargenAplicable(
  cantidad: number,
  config: ConfiguracionUsuario,
  reglasMargen?: ReglaMargenGanancia[],
  margenOverridePct?: number,
): number {
  // 1. Si el usuario modificó MANUALMENTE el margen en la UI (override explícito)
  // Solo se toma en cuenta si es un número válido mayor a 0.
  if (
    margenOverridePct !== undefined &&
    margenOverridePct !== null &&
    !isNaN(Number(margenOverridePct)) &&
    Number(margenOverridePct) > 0
  ) {
    return Number(margenOverridePct);
  }

  // 2. CONSULTA EN LAS REGLAS DE LA BASE DE DATOS (Márgenes por escala/volumen)
  // Si existen reglas traídas desde public.reglas_margen_ganancia
  if (reglasMargen && reglasMargen.length > 0) {
    const q = Number(cantidad);

    const reglaEncontrada = reglasMargen.find((regla) => {
      const min = Number(regla.cantidad_minima);
      const max =
        regla.cantidad_maxima !== null && regla.cantidad_maxima !== undefined
          ? Number(regla.cantidad_maxima)
          : null;

      // Evalúa si Q está dentro de [cantidad_minima, cantidad_maxima]
      // Ejemplo Q = 5: (5 >= 1) && (max === null || 5 <= 10) -> TRUE (Retorna 70%)
      const cumpleMinimo = q >= min;
      const cumpleMaximo = max === null || q <= max;

      return cumpleMinimo && cumpleMaximo;
    });

    if (reglaEncontrada) {
      return Number(reglaEncontrada.margen_ganancia_pct);
    }
  }

  // 3. FALLBACK: Si no hay reglas en BD para esa cantidad, usa el margen por defecto de la BD
  return Number(config?.margen_ganancia_defecto_pct || 30);
}

export function calcularCotizacion(
  item: CotizacionItemInput,
  config: ConfiguracionUsuario,
  reglasMargen?: ReglaMargenGanancia[],
  margenGananciaOverridePct?: number,
): ResultadoCotizacion {
  const {
    cantidad = 1,
    peso_gramos = 0,
    tiempo_impresion_horas = 0,
    tiempo_impresion_minutos = 0,
    impresora,
    material,
    porcentaje_riesgo = 0,
    precio_personalizacion = 0,
  } = item;

  // Conversión de datos numéricos
  const cantidadNum = Number(cantidad);
  const pesoGramosNum = Number(peso_gramos);
  const horasTotales =
    Number(tiempo_impresion_horas) + Number(tiempo_impresion_minutos) / 60;

  // --------------------------------------------------------------------------
  // 1. FÓRMULAS BASE (POR PIEZA)
  // --------------------------------------------------------------------------

  // a = Costo Filamento (Bs)
  const costo_filamento_a =
    material && material.peso_carrete_gramos > 0
      ? pesoGramosNum * (material.precio_carrete / material.peso_carrete_gramos)
      : 0;

  // b = Mano de Obra (Bs)
  const mano_de_obra_b = Number(config?.costo_mano_obra_hora || 0);

  // c = Depreciación de la máquina (Bs)
  const depreciacion_c =
    impresora && impresora.vida_util_horas > 0
      ? horasTotales * (impresora.costo_compra / impresora.vida_util_horas)
      : 0;

  // d = Costo de energía (Bs)
  const costo_energia_d = impresora
    ? (impresora.potencia_watts / 1000) *
      horasTotales *
      Number(config?.costo_kwh || 0)
    : 0;

  // e = Suma de todos los costos directos por pieza
  const costo_subtotal_e =
    costo_filamento_a + mano_de_obra_b + depreciacion_c + costo_energia_d;

  // f = Riesgo de impresión (Bs)
  const porcentajeRiesgoAplicado =
    porcentaje_riesgo > 0
      ? porcentaje_riesgo
      : Number(config?.tasa_fallo_defecto_pct || 0);
  const riesgo_f = costo_subtotal_e * (porcentajeRiesgoAplicado / 100);

  // g = Costo impresión base por pieza
  const costo_impresion_g = costo_subtotal_e + riesgo_f;

  // --------------------------------------------------------------------------
  // 2. OBTENCIÓN DEL MARGEN DE LA BASE DE DATOS
  // --------------------------------------------------------------------------

  // Obtiene el % de utilidad de public.reglas_margen_ganancia según la cantidad Q
  const porcentajeUtilidad = obtenerMargenAplicable(
    cantidadNum,
    config,
    reglasMargen,
    margenGananciaOverridePct,
  );

  const utilidad_h = porcentajeUtilidad / 100;

  if (utilidad_h >= 1) {
    throw new Error(
      "El porcentaje de utilidad no puede ser igual o mayor al 100%.",
    );
  }

  // i = Precio venta impresión (Por pieza antes de personalización)
  // Fórmula: Venta = Costo / (1 - Margen)
  const precio_venta_base_pieza = costo_impresion_g / (1 - utilidad_h);

  // Adición del trabajo de personalización
  const personalizacionNum = Number(precio_personalizacion);
  const precio_final_pieza = precio_venta_base_pieza + personalizacionNum;

  // Totales del proyecto multiplicados por Q
  const costo_directo_total = costo_subtotal_e * cantidadNum;
  const costo_fallos_total = riesgo_f * cantidadNum;
  const subtotal_costo_base = costo_impresion_g * cantidadNum;
  const precio_final_total = precio_final_pieza * cantidadNum;
  const monto_ganancia_total =
    (precio_venta_base_pieza - costo_impresion_g) * cantidadNum;

  // --------------------------------------------------------------------------
  // 3. RETORNO DE RESULTADOS
  // --------------------------------------------------------------------------
  return {
    precio_por_pieza: precio_final_pieza,
    costo_total_proyecto: precio_final_total,
    costo_directo_total,
    costo_indirecto_total: 0,
    costo_fallos_total,
    subtotal_costo_base,
    monto_ganancia: monto_ganancia_total,
    monto_impuesto: 0,
    precio_final: precio_final_total,
    margen_ganancia_aplicado_pct: porcentajeUtilidad,
    precio_personalizacion: personalizacionNum,
    desglose: {
      costo_material_unit: costo_filamento_a,
      costo_energia_unit: costo_energia_d,
      costo_amortizacion_unit: depreciacion_c,
      costo_mantenimiento_unit: 0,
      costo_mano_obra_unit: mano_de_obra_b,
      costo_subtotal_unit: costo_subtotal_e,
      costo_subtotal_item: costo_subtotal_e * cantidadNum,

      material_directo: costo_filamento_a,
      operacion_preparacion: mano_de_obra_b,
      depreciacion_maquina: depreciacion_c,
      energia: costo_energia_d,
      subtotal_operativo: costo_subtotal_e,
      porcentaje_riesgo: porcentajeRiesgoAplicado,
      fondo_riesgo: riesgo_f,
      costo_total_pieza: costo_impresion_g,
      porcentaje_utilidad: porcentajeUtilidad,
      utilidad_pieza: precio_venta_base_pieza - costo_impresion_g,
      tasa_hora_hombre: mano_de_obra_b,
    },
  };
}
