// src/services/supabase/parametros.ts
import {
    PARAMETROS_DEFAULT,
    ParametrosOperativos,
} from "../../features/parametros/types";
import { supabase } from "./client";

const TABLA = "parametros_taller";

// Convierte snake_case (Supabase) -> camelCase (app)
function mapRowToParametros(row: any): ParametrosOperativos {
  return {
    id: row.id,
    userId: row.user_id,
    tarifas: {
      monedaPrincipal: row.moneda_principal,
      tarifaElectricaKwh: row.tarifa_electrica_kwh,
      margenGananciaPct: row.margen_ganancia_pct,
    },
    manoObra: {
      disenoModelado3dHora: row.diseno_modelado_3d_hora,
      slicingPreparacionHora: row.slicing_preparacion_hora,
      postprocesadoAcabadoHora: row.postprocesado_acabado_hora,
    },
    depreciacion: {
      depreciacionMaquinaHora: row.depreciacion_maquina_hora,
      fondoReservaRepuestosHora: row.fondo_reserva_repuestos_hora,
      factorFallasPct: row.factor_fallas_pct,
    },
    envio: {
      recogidaLocal: row.recogida_local,
      envioLocalDelivery: row.envio_local_delivery,
      envioNacionalCourier: row.envio_nacional_courier,
    },
    notificaciones: {
      limiteBajoStockGramos: row.limite_bajo_stock_gramos,
      recordatorioEntregaHoras: row.recordatorio_entrega_horas,
      alertaMantenimientoImpresorasHoras:
        row.alerta_mantenimiento_impresoras_horas,
    },
    pdf: {
      encabezadoPdf: row.encabezado_pdf ?? "",
      piePaginaPdf: row.pie_pagina_pdf ?? "",
      mostrarDesgloseTecnicoCliente: row.mostrar_desglose_tecnico_cliente,
      diasValidezCotizacion: row.dias_validez_cotizacion,
    },
    respaldo: {
      formatoExportacion: row.formato_exportacion,
      backupNubeActivo: row.backup_nube_activo,
      ultimoBackupIso: row.ultimo_backup_iso,
    },
    updatedAt: row.updated_at,
  };
}

// Convierte camelCase (app) -> snake_case (Supabase) para upsert
function mapParametrosToRow(p: ParametrosOperativos) {
  return {
    user_id: p.userId,
    moneda_principal: p.tarifas.monedaPrincipal,
    tarifa_electrica_kwh: p.tarifas.tarifaElectricaKwh,
    margen_ganancia_pct: p.tarifas.margenGananciaPct,
    diseno_modelado_3d_hora: p.manoObra.disenoModelado3dHora,
    slicing_preparacion_hora: p.manoObra.slicingPreparacionHora,
    postprocesado_acabado_hora: p.manoObra.postprocesadoAcabadoHora,
    depreciacion_maquina_hora: p.depreciacion.depreciacionMaquinaHora,
    fondo_reserva_repuestos_hora: p.depreciacion.fondoReservaRepuestosHora,
    factor_fallas_pct: p.depreciacion.factorFallasPct,
    recogida_local: p.envio.recogidaLocal,
    envio_local_delivery: p.envio.envioLocalDelivery,
    envio_nacional_courier: p.envio.envioNacionalCourier,
    limite_bajo_stock_gramos: p.notificaciones.limiteBajoStockGramos,
    recordatorio_entrega_horas: p.notificaciones.recordatorioEntregaHoras,
    alerta_mantenimiento_impresoras_horas:
      p.notificaciones.alertaMantenimientoImpresorasHoras,
    encabezado_pdf: p.pdf.encabezadoPdf,
    pie_pagina_pdf: p.pdf.piePaginaPdf,
    mostrar_desglose_tecnico_cliente: p.pdf.mostrarDesgloseTecnicoCliente,
    dias_validez_cotizacion: p.pdf.diasValidezCotizacion,
    formato_exportacion: p.respaldo.formatoExportacion,
    backup_nube_activo: p.respaldo.backupNubeActivo,
    ultimo_backup_iso: p.respaldo.ultimoBackupIso,
  };
}

export async function obtenerParametros(
  userId: string,
): Promise<ParametrosOperativos> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    // No existen parámetros aún: devolver defaults sin persistir
    return { ...PARAMETROS_DEFAULT, userId };
  }

  return mapRowToParametros(data);
}

export async function guardarParametros(
  parametros: ParametrosOperativos,
): Promise<ParametrosOperativos> {
  const row = mapParametrosToRow(parametros);

  const { data, error } = await supabase
    .from(TABLA)
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;

  return mapRowToParametros(data);
}
