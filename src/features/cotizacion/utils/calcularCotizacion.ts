import {
  ConfiguracionEmpresa,
  CotizacionMultiItemInput,
  DesglosePiezaResultado,
  ReglaMargenGanancia,
  ResultadoCotizacion,
} from "../types";

function obtenerMargenAplicable(
  reglaMargenId?: string,
  config?: ConfiguracionEmpresa,
  reglasMargen?: ReglaMargenGanancia[],
  margenOverridePct?: number,
): number {
  if (
    margenOverridePct !== undefined &&
    margenOverridePct !== null &&
    !isNaN(Number(margenOverridePct))
  ) {
    return Number(margenOverridePct);
  }

  if (reglaMargenId && reglasMargen && reglasMargen.length > 0) {
    const reglaSeleccionada = reglasMargen.find(
      (regla) => regla.id === reglaMargenId,
    );
    if (reglaSeleccionada && reglaSeleccionada.margen_ganancia_pct !== undefined) {
      return Number(reglaSeleccionada.margen_ganancia_pct);
    }
  }

  return Number(config?.margen_ganancia_defecto_pct ?? 30);
}

export function calcularCotizacion(
  item: CotizacionMultiItemInput,
  config: ConfiguracionEmpresa,
  reglasMargen?: ReglaMargenGanancia[],
  margenGananciaOverridePct?: number,
): ResultadoCotizacion {
  const {
    piezas,
    tiempo_preparacion_minutos = 0,
    tiempo_postprocesado_minutos = 0,
    impresora,
    filamento,
    porcentaje_riesgo = 0,
    precio_personalizacion = 0,
    regla_margen_id,
  } = item;

  if (!piezas || piezas.length === 0) {
    throw new Error("Debes agregar al menos una pieza para cotizar.");
  }

  // --------------------------------------------------------------------
  // Tarifas base (compartidas por todas las piezas)
  // --------------------------------------------------------------------
  const capacidadRollo = Number(filamento?.capacidad_rollo_gramos || 0);
  const costoCompraFilamento = Number(filamento?.costo_compra || 0);
  const tasaHoraHombre = Number(config?.costo_mano_obra_hora || 0);
  const vidaUtilHoras = Number(impresora?.vida_util_horas || 0);
  const costoCompraImpresora = Number(impresora?.costo_compra || 0);
  const potenciaKw = Number(impresora?.potencia_watts || 0) / 1000;
  const costoKwh = Number(config?.costo_kwh || 0);

  const horasTrabajoManual =
    ((Number(tiempo_preparacion_minutos) || 0) +
      (Number(tiempo_postprocesado_minutos) || 0)) /
    60;

  // --------------------------------------------------------------------
  // 1. COSTOS DIRECTOS POR PIEZA (misma fórmula de antes, aplicada c/u)
  // --------------------------------------------------------------------
  const piezasCalculadas = piezas.map((p, idx) => {
    const id = p.id || `pieza-${idx + 1}`;
    const cantidadNum = Math.max(1, Number(p.cantidad) || 1);
    const pesoGramosNum = Number(p.peso_gramos) || 0;
    const horasImpresionTotal =
      (Number(p.tiempo_impresion_horas) || 0) +
      (Number(p.tiempo_impresion_minutos) || 0) / 60;

    const costo_material_a =
      capacidadRollo > 0
        ? pesoGramosNum * (costoCompraFilamento / capacidadRollo)
        : 0;

    const mano_de_obra_b = horasTrabajoManual * tasaHoraHombre;

    const depreciacion_c =
      vidaUtilHoras > 0
        ? horasImpresionTotal * (costoCompraImpresora / vidaUtilHoras)
        : 0;

    const costo_energia_d = potenciaKw * horasImpresionTotal * costoKwh;

    const costo_subtotal_unit =
      costo_material_a + mano_de_obra_b + depreciacion_c + costo_energia_d;

    return {
      id,
      nombre_pieza: p.nombre_pieza || `Pieza ${idx + 1}`,
      cantidad: cantidadNum,
      peso_gramos: pesoGramosNum,
      tiempo_impresion_horas: Number(p.tiempo_impresion_horas) || 0,
      tiempo_impresion_minutos: Number(p.tiempo_impresion_minutos) || 0,
      costo_material_unit: costo_material_a,
      costo_mano_obra_unit: mano_de_obra_b,
      costo_amortizacion_unit: depreciacion_c,
      costo_energia_unit: costo_energia_d,
      costo_subtotal_unit,
      costo_material: costo_material_a * cantidadNum,
      costo_mano_obra: mano_de_obra_b * cantidadNum,
      costo_depreciacion: depreciacion_c * cantidadNum,
      costo_energia: costo_energia_d * cantidadNum,
      subtotal_directo_pieza: costo_subtotal_unit * cantidadNum,
    };
  });

  // --------------------------------------------------------------------
  // 2. SUMA de costos directos de TODAS las piezas (sin riesgo/utilidad/personalización todavía)
  // --------------------------------------------------------------------
  const subtotal_costo_directo_total = piezasCalculadas.reduce(
    (acc, p) => acc + p.subtotal_directo_pieza,
    0,
  );
  const cantidadTotalUnidades = piezasCalculadas.reduce(
    (acc, p) => acc + p.cantidad,
    0,
  );
  const pesoTotalGramos = piezasCalculadas.reduce(
    (acc, p) => acc + p.peso_gramos * p.cantidad,
    0,
  );

  // --------------------------------------------------------------------
  // 3. RIESGO (una sola vez, sobre el total)
  // --------------------------------------------------------------------
  const porcentajeRiesgoAplicado =
    porcentaje_riesgo > 0
      ? porcentaje_riesgo
      : Number(config?.tasa_fallo_defecto_pct || 0);
  const fondo_riesgo_total =
    subtotal_costo_directo_total * (porcentajeRiesgoAplicado / 100);

  const costo_base_total = subtotal_costo_directo_total + fondo_riesgo_total;

  // --------------------------------------------------------------------
  // 4. UTILIDAD y PERSONALIZACIÓN (una sola vez, sobre el total)
  // --------------------------------------------------------------------
  const porcentajeUtilidad = obtenerMargenAplicable(
    regla_margen_id,
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

  const precio_venta_base_total =
    utilidad_h > 0 ? costo_base_total / (1 - utilidad_h) : costo_base_total;

  const personalizacionNum = Number(precio_personalizacion) || 0;
  const precio_final_total = precio_venta_base_total + personalizacionNum;
  const monto_ganancia_total = precio_venta_base_total - costo_base_total;

  // --------------------------------------------------------------------
  // 5. Prorrateo informativo por pieza (riesgo/utilidad/personalización
  //    repartidos según el peso de cada pieza en el costo directo total)
  // --------------------------------------------------------------------
  const piezasResultado: DesglosePiezaResultado[] = piezasCalculadas.map((p) => {
    const proporcion =
      subtotal_costo_directo_total > 0
        ? p.subtotal_directo_pieza / subtotal_costo_directo_total
        : 0;

    const costo_fallos_pieza = fondo_riesgo_total * proporcion;
    const costo_base_pieza = p.subtotal_directo_pieza + costo_fallos_pieza;
    const monto_ganancia_pieza = monto_ganancia_total * proporcion;
    const precio_personalizacion_pieza = personalizacionNum * proporcion;
    const precio_total_pieza =
      costo_base_pieza + monto_ganancia_pieza + precio_personalizacion_pieza;

    return {
      ...p,
      proporcion_pct: proporcion * 100,
      costo_fallos_pieza,
      costo_base_pieza,
      monto_ganancia_pieza,
      precio_personalizacion_pieza,
      precio_total_pieza,
      precio_unitario_pieza: p.cantidad > 0 ? precio_total_pieza / p.cantidad : 0,
    };
  });

  // --------------------------------------------------------------------
  // 6. RETORNO
  // --------------------------------------------------------------------
  const costoMaterialTotal = piezasCalculadas.reduce((a, p) => a + p.costo_material, 0);
  const costoManoObraTotal = piezasCalculadas.reduce((a, p) => a + p.costo_mano_obra, 0);
  const costoDepreciacionTotal = piezasCalculadas.reduce((a, p) => a + p.costo_depreciacion, 0);
  const costoEnergiaTotal = piezasCalculadas.reduce((a, p) => a + p.costo_energia, 0);

  return {
    nombre_pieza: piezasCalculadas[0]?.nombre_pieza,
    cantidad: cantidadTotalUnidades,
    peso_gramos: pesoTotalGramos,
    precio_por_pieza:
      cantidadTotalUnidades > 0 ? precio_final_total / cantidadTotalUnidades : 0,
    costo_total_proyecto: precio_final_total,
    costo_directo_total: subtotal_costo_directo_total,
    costo_indirecto_total: 0,
    costo_fallos_total: fondo_riesgo_total,
    subtotal_costo_base: costo_base_total,
    monto_ganancia: monto_ganancia_total,
    monto_impuesto: 0,
    precio_final: precio_final_total,
    margen_ganancia_aplicado_pct: porcentajeUtilidad,
    precio_personalizacion: personalizacionNum,
    piezas: piezasResultado,
    desglose: {
      costo_material_unit:
        cantidadTotalUnidades > 0 ? costoMaterialTotal / cantidadTotalUnidades : 0,
      costo_filamento_unit:
        cantidadTotalUnidades > 0 ? costoMaterialTotal / cantidadTotalUnidades : 0,
      costo_energia_unit:
        cantidadTotalUnidades > 0 ? costoEnergiaTotal / cantidadTotalUnidades : 0,
      costo_amortizacion_unit:
        cantidadTotalUnidades > 0 ? costoDepreciacionTotal / cantidadTotalUnidades : 0,
      costo_mantenimiento_unit: 0,
      costo_mano_obra_unit:
        cantidadTotalUnidades > 0 ? costoManoObraTotal / cantidadTotalUnidades : 0,
      costo_subtotal_unit:
        cantidadTotalUnidades > 0
          ? subtotal_costo_directo_total / cantidadTotalUnidades
          : 0,
      costo_subtotal_item: subtotal_costo_directo_total,
      costo_material: costoMaterialTotal,
      costo_energia: costoEnergiaTotal,
      costo_depreciacion: costoDepreciacionTotal,
      costo_mano_obra: costoManoObraTotal,
      costo_fallos: fondo_riesgo_total,
      subtotal_costo_base: costo_base_total,
      subtotal_costo_directo: subtotal_costo_directo_total,
      costo_total_unidad:
        cantidadTotalUnidades > 0 ? costo_base_total / cantidadTotalUnidades : 0,
      precio_unidad_sugerido:
        cantidadTotalUnidades > 0 ? precio_final_total / cantidadTotalUnidades : 0,
      precio_total_sugerido: precio_final_total,
      margen_aplicado_pct: porcentajeUtilidad,
    },
  };
}