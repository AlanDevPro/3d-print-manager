import { supabase } from "@/services/supabase/client";
import * as Crypto from "expo-crypto";
import type { ResultadoCotizacion } from "../types";

interface GuardarCotizacionParams {
  userId: string;
  empresaId?: string;
  clienteId: string | null;
  clienteNombre: string;
  clienteContacto: string | null;
  notas: string | null;
  impresoraId: string;
  filamentoId: string;
  tiempoPreparacionMinutos: number;
  tiempoPostprocesadoMinutos: number;
  costoDisenoTotal?: number; // Nueva propiedad opcional para el costo de diseño/personalización
  resultado: ResultadoCotizacion;
  imagenUri?: string | null; // URI local de la imagen seleccionada o capturada
}

/**
 * Función auxiliar para subir la imagen a Supabase Storage en Expo/React Native.
 */
async function subirImagenReferencia(
  userId: string,
  imagenUri: string
): Promise<string | null> {
  try {
    // 1. Obtener la extensión del archivo
    const fileExtension = imagenUri.split(".").pop()?.toLowerCase() || "jpeg";
    const fileName = `${userId}/${Date.now()}_${Crypto.randomUUID()}.${fileExtension}`;
    const filePath = `cotizaciones/${fileName}`;

    // 2. Convertir la URI local en ArrayBuffer compatible con React Native / Expo
    const response = await fetch(imagenUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // 3. Subir el archivo al bucket "empresa-assets"
    const { error: uploadError } = await supabase.storage
      .from("empresa-assets")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir la imagen al Storage:", uploadError.message);
      throw uploadError;
    }

    // 4. Obtener y retornar la URL pública
    const { data: publicUrlData } = supabase.storage
      .from("empresa-assets")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error en subirImagenReferencia:", error);
    throw error;
  }
}

export async function guardarCotizacion({
  userId,
  empresaId,
  clienteId,
  clienteNombre,
  clienteContacto,
  notas,
  impresoraId,
  filamentoId,
  tiempoPreparacionMinutos,
  tiempoPostprocesadoMinutos,
  costoDisenoTotal = 0,
  resultado,
  imagenUri,
}: GuardarCotizacionParams) {
  // Generar token único para el voucher público (compatible con Expo Go / React Native)
  const tokenPublico = Crypto.randomUUID();

  // Subir imagen a Storage si fue proporcionada
  let imagenReferenciaUrl: string | null = null;
  if (imagenUri) {
    imagenReferenciaUrl = await subirImagenReferencia(userId, imagenUri);
  }

  // 1. Cabecera de la cotización con costo_diseno_total, token_publico e imagen_referencia_url
  const { data: cotizacion, error: errorCotizacion } = await supabase
    .from("cotizaciones")
    .insert({
      creado_por: userId,
      empresa_id: empresaId ?? null,
      cliente_id: clienteId,
      cliente_nombre: clienteNombre,
      cliente_contacto: clienteContacto,
      costo_directo_total: resultado.costo_directo_total,
      costo_indirecto_total: resultado.costo_indirecto_total,
      costo_fallos_total: resultado.costo_fallos_total,
      costo_diseno_total: costoDisenoTotal,
      subtotal_costo_base: resultado.subtotal_costo_base,
      monto_ganancia: resultado.monto_ganancia,
      monto_impuesto: resultado.monto_impuesto,
      precio_final: resultado.precio_final,
      margen_ganancia_aplicado_pct: resultado.margen_ganancia_aplicado_pct,
      estado: "pendiente",
      notas,
      token_publico: tokenPublico,
      imagen_referencia_url: imagenReferenciaUrl,
    })
    .select()
    .single();

  if (errorCotizacion) throw errorCotizacion;

  // 2. Un renglón por cada pieza cotizada
  const itemsAInsertar = resultado.piezas.map((pieza) => ({
    cotizacion_id: cotizacion.id,
    impresora_id: impresoraId,
    filamento_id: filamentoId,
    nombre_pieza: pieza.nombre_pieza,
    cantidad: pieza.cantidad,
    peso_gramos: pieza.peso_gramos,
    tiempo_impresion_horas: pieza.tiempo_impresion_horas,
    tiempo_preparacion_minutos: tiempoPreparacionMinutos,
    tiempo_postprocesado_minutos: tiempoPostprocesadoMinutos,
    costo_material: pieza.costo_material_unit,
    costo_energia: pieza.costo_energia_unit,
    costo_amortizacion: pieza.costo_amortizacion_unit,
    costo_mantenimiento: 0,
    costo_mano_obra: pieza.costo_mano_obra_unit,
    costo_subtotal_item: pieza.subtotal_directo_pieza,
  }));

  const { error: errorItems } = await supabase
    .from("cotizacion_items")
    .insert(itemsAInsertar);

  if (errorItems) throw errorItems;

  return cotizacion;
}