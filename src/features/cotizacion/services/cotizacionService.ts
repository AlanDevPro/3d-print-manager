import { supabase } from "@/services/supabase/client";
import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";
import { File } from "expo-file-system";
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
  costoDisenoTotal?: number;
  resultado: ResultadoCotizacion;
  imagenUri?: string | null;
}

/**
 * Subida profesional de imágenes desde React Native / Expo Go a Supabase Storage
 * Utilizando la API moderna de Expo FileSystem (Clase File)
 */
async function subirImagenReferencia(
  userId: string,
  imagenUri: string
): Promise<string | null> {
  try {
    // 1. Obtener extensión y MIME type adecuado
    const cleanUri = imagenUri.split("?")[0];
    const fileExtension = cleanUri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = fileExtension === "png" ? "image/png" : "image/jpeg";

    // Generar ruta única en el Storage
    const fileName = `${userId}/${Date.now()}_${Crypto.randomUUID()}.${fileExtension}`;
    const filePath = `cotizaciones/${fileName}`;

    // 2. Instanciar el archivo local usando la API moderna File
    const file = new File(imagenUri);

    // 3. Obtener el contenido Base64 de la instancia
    const base64Data = await file.base64();

    // 4. Convertir Base64 a ArrayBuffer para compatibilidad total con Supabase JS
    const arrayBuffer = decode(base64Data);

    // 5. Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("empresa-assets")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error de Supabase Storage:", uploadError);
      throw new Error(`Error en Storage: ${uploadError.message}`);
    }

    // 6. Obtener la URL pública del archivo subido
    const { data: publicUrlData } = supabase.storage
      .from("empresa-assets")
      .getPublicUrl(uploadData.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("❌ Error detallado en subirImagenReferencia:", error);
    return null;
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
  const tokenPublico = Crypto.randomUUID();

  // Subir imagen a Storage si fue proporcionada una URI válida
  let imagenReferenciaUrl: string | null = null;
  if (imagenUri) {
    imagenReferenciaUrl = await subirImagenReferencia(userId, imagenUri);
  }

  // 1. Guardar la cabecera de la cotización
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

  // 2. Insertar renglones de la cotización
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