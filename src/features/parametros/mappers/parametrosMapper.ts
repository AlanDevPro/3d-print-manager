import {
  ImpresoraDepreciacion,
  PARAMETROS_VACIOS,
  ParametrosOperativos,
  ReglaMargenGanancia,
  esMonedaValida,
} from "../types";

export function mapDbToParametros(
  config: any,
  impresorasDb: any[],
  reglasDb: any[],
): ParametrosOperativos {
  // 🟢 Mapeo simplificado sin rangos
  const reglasMargen: ReglaMargenGanancia[] = (reglasDb || []).map((r) => ({
    id: String(r.id ?? ""),
    nombre: String(r.nombre ?? "Sin nombre"),
    porcentaje: Number(r.margen_ganancia_pct ?? 0),
  }));

  const impresoras: ImpresoraDepreciacion[] = (impresorasDb || []).map((i) => ({
    id: String(i.id ?? ""),
    nombre: [i.marca, i.modelo].filter(Boolean).join(" ") || "Impresora 3D",
    costo: Number(i.costo_compra ?? 0),
    horasImpresas: 0,
    vidaUtilHoras: Number(i.vida_util_horas ?? 3000),
    potenciaWatts: Number(i.potencia_watts ?? 150),
    costoMantenimientoHora: Number(i.costo_mantenimiento_hora ?? 0.5),
  }));

  const monedaDb = config?.moneda ?? "BOB";
  const monedaPrincipal = esMonedaValida(monedaDb) ? monedaDb : "BOB";

  const horasMes = Number(config?.horas_laborables_mes ?? 160);
  const costoHoraBD = Number(config?.costo_mano_obra_hora ?? 0);
  const sueldoMensual = costoHoraBD > 0 ? costoHoraBD * horasMes : 0;

  const resultado: ParametrosOperativos = {
    id: config?.empresa_id ? String(config.empresa_id) : undefined,
    empresaId: config?.empresa_id ? String(config.empresa_id) : null,
    tarifas: {
      monedaPrincipal,
      tarifaElectricaKwh: Number(config?.costo_kwh ?? 0.8),
      reglasMargen,
    },
    manoObra: {
      tiempoInvertidoMinutos: 0,
      sueldoMensual,
      costoHora: costoHoraBD,
    },
    impresoras,
    envio: { ...PARAMETROS_VACIOS.envio },
    pdf: {
      ...PARAMETROS_VACIOS.pdf,
      diasValidezCotizacion: Number(config?.dias_validez_cotizacion ?? 15),
    },
    respaldo: { ...PARAMETROS_VACIOS.respaldo },
    avanzados: {
      costoOperativoFijoMensual: Number(
        config?.costo_operativo_fijo_mensual ?? 0,
      ),
      tasaFalloDefectoPct: Number(config?.tasa_fallo_defecto_pct ?? 10),
      impuestoPct: Number(config?.impuesto_pct ?? 0),
      margenGananciaDefectoPct: Number(
        config?.margen_ganancia_defecto_pct ?? 30,
      ),
    },
  };

  return resultado;
}

export function mapParametrosToDbConfig(
  empresaId: string,
  parametros: ParametrosOperativos,
) {
  const sueldo = parametros.manoObra?.sueldoMensual ?? 0;
  const horasMes = 160;
  const costoHoraManoObra =
    sueldo > 0 ? sueldo / horasMes : (parametros.manoObra?.costoHora ?? 0);

  return {
    empresa_id: empresaId,
    costo_kwh: parametros.tarifas?.tarifaElectricaKwh ?? 0.8,
    costo_mano_obra_hora: Number(costoHoraManoObra.toFixed(2)),
    horas_laborables_mes: horasMes,
    moneda: parametros.tarifas?.monedaPrincipal ?? "BOB",
    costo_operativo_fijo_mensual:
      parametros.avanzados?.costoOperativoFijoMensual ?? 0,
    tasa_fallo_defecto_pct: parametros.avanzados?.tasaFalloDefectoPct ?? 10,
    impuesto_pct: parametros.avanzados?.impuestoPct ?? 0,
    margen_ganancia_defecto_pct:
      parametros.avanzados?.margenGananciaDefectoPct ?? 30,
    updated_at: new Date().toISOString(),
  };
}

export function mapImpresoraToDb(
  empresaId: string,
  impresora: ImpresoraDepreciacion,
) {
  return {
    empresa_id: empresaId,
    costo_compra: impresora.costo,
    vida_util_horas: impresora.vidaUtilHoras,
    potencia_watts: impresora.potenciaWatts,
    costo_mantenimiento_hora: impresora.costoMantenimientoHora,
  };
}