import { supabase } from "@/services/supabase/client";
import { CotizacionItemInput, ResultadoCotizacion } from "../types";

interface GuardarCotizacionParams {
  userId: string;
  clienteNombre: string;
  clienteContacto: string | null;
  notas: string | null;
  item: CotizacionItemInput;
  resultado: ResultadoCotizacion;
}

export async function guardarCotizacion({
  userId,
  clienteNombre,
  clienteContacto,
  notas,
  item,
  resultado,
}: GuardarCotizacionParams) {
  const { data: cotizacion, error: errorCotizacion } = await supabase
    .from("cotizaciones")
    .insert({
      user_id: userId,
      cliente_nombre: clienteNombre,
      cliente_contacto: clienteContacto,
      costo_directo_total: resultado.costo_directo_total,
      costo_indirecto_total: resultado.costo_indirecto_total,
      costo_fallos_total: resultado.costo_fallos_total,
      subtotal_costo_base: resultado.subtotal_costo_base,
      monto_ganancia: resultado.monto_ganancia,
      monto_impuesto: resultado.monto_impuesto,
      precio_final: resultado.precio_final,
      margen_ganancia_aplicado_pct: resultado.margen_ganancia_aplicado_pct,
      estado: "pendiente",
      notas,
    })
    .select()
    .single();

  if (errorCotizacion) throw errorCotizacion;

  const { error: errorItem } = await supabase.from("cotizacion_items").insert({
    cotizacion_id: cotizacion.id,
    impresora_id: item.impresora.id,
    material_id: item.material.id,
    nombre_pieza: item.nombre_pieza,
    cantidad: item.cantidad,
    peso_gramos: item.peso_gramos,
    tiempo_impresion_horas: item.tiempo_impresion_horas,
    tiempo_preparacion_minutos: item.tiempo_preparacion_minutos,
    tiempo_postprocesado_minutos: item.tiempo_postprocesado_minutos,
    costo_material: resultado.desglose.costo_material_unit,
    costo_energia: resultado.desglose.costo_energia_unit,
    costo_amortizacion: resultado.desglose.costo_amortizacion_unit,
    costo_mantenimiento: resultado.desglose.costo_mantenimiento_unit,
    costo_mano_obra: resultado.desglose.costo_mano_obra_unit,
    costo_subtotal_item: resultado.desglose.costo_subtotal_item,
  });

  if (errorItem) throw errorItem;

  return cotizacion;
}
