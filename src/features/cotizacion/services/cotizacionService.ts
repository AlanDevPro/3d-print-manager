import { supabase } from "@/services/supabase/client";
import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";
import { File } from "expo-file-system";
import type { ResultadoCotizacion } from "../types";

interface PiezaFotoInput {
  id: string;
  fotoUri: string | null;
}

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
  piezasFotos: PiezaFotoInput[];
}

/**
 * Sube la foto de UNA pieza al bucket "empresa-assets", bajo
 * cotizacion-items/{userId}/{timestamp}_{uuid}.{ext}
 */
async function subirFotoPieza(
  userId: string,
  imagenUri: string,
): Promise<string | null> {
  try {
    const cleanUri = imagenUri.split("?")[0];
    const fileExtension = cleanUri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = fileExtension === "png" ? "image/png" : "image/jpeg";

    const fileName = `${userId}/${Date.now()}_${Crypto.randomUUID()}.${fileExtension}`;
    const filePath = `cotizacion-items/${fileName}`;

    const file = new File(imagenUri);
    const base64Data = await file.base64();
    const arrayBuffer = decode(base64Data);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("empresa-assets")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error subiendo foto de pieza a Storage:", uploadError);
      throw new Error(`Error en Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("empresa-assets")
      .getPublicUrl(uploadData.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("❌ Error detallado en subirFotoPieza:", error);
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
  piezasFotos,
}: GuardarCotizacionParams) {
  const tokenPublico = Crypto.randomUUID();

  // 1. Cabecera de la cotización
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
    })
    .select()
    .single();

  if (errorCotizacion) throw errorCotizacion;

  // 2. Subir la foto de CADA pieza en paralelo, mapeada por id
  const fotoPorPieza = new Map<string, string | null>();
  await Promise.all(
    piezasFotos.map(async ({ id, fotoUri }) => {
      if (!fotoUri) {
        fotoPorPieza.set(id, null);
        return;
      }
      const url = await subirFotoPieza(userId, fotoUri);
      fotoPorPieza.set(id, url);
    }),
  );

  // 3. Insertar renglones — convirtiendo correctamente horas y minutos a formato decimal
  const itemsAInsertar = resultado.piezas.map((pieza) => {
    // 💡 Conversión profesional: Sumamos horas enteras + minutos convertidos a fracción de hora
    const horasDecimales =
      (Number(pieza.tiempo_impresion_horas) || 0) +
      (Number(pieza.tiempo_impresion_minutos) || 0) / 60;

    return {
      cotizacion_id: cotizacion.id,
      impresora_id: impresoraId,
      filamento_id: filamentoId,
      nombre_pieza: pieza.nombre_pieza,
      cantidad: pieza.cantidad,
      peso_gramos: pieza.peso_gramos,

      // ✅ Enviamos el total combinado en formato decimal (ej: 0.25 para 15 min)
      tiempo_impresion_horas: horasDecimales,

      tiempo_preparacion_minutos: tiempoPreparacionMinutos,
      tiempo_postprocesado_minutos: tiempoPostprocesadoMinutos,
      costo_material: pieza.costo_material_unit,
      costo_energia: pieza.costo_energia_unit,
      costo_amortizacion: pieza.costo_amortizacion_unit,
      costo_mantenimiento: 0,
      costo_mano_obra: pieza.costo_mano_obra_unit,
      costo_subtotal_item: pieza.subtotal_directo_pieza,
      imagen_url: fotoPorPieza.get(pieza.id) ?? null,
    };
  });

  const { error: errorItems } = await supabase
    .from("cotizacion_items")
    .insert(itemsAInsertar);

  if (errorItems) throw errorItems;

  return cotizacion;
}
