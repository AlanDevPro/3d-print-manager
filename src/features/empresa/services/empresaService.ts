import type { EmpresaInfo } from "@/features/empresa/types";
import { supabase } from "@/services/supabase/client";
import type { Empresa } from "@/types/database";
import { decode } from "base64-arraybuffer";
// Importación de API Legacy para compatibilidad con Expo SDK 54+
import * as FileSystem from "expo-file-system/legacy";

/**
 * Sube o reemplaza la imagen del logo en el bucket 'empresa-assets' de Supabase Storage
 * utilizando una ruta fija por empresa (upsert). Evita la acumulación de archivos innecesarios.
 */
export async function subirLogoEmpresa(
  uriLocal: string,
  empresaId: string,
): Promise<string> {
  // 1. Si la URI ya es una URL remota, se retorna intacta
  if (
    !uriLocal.startsWith("file://") &&
    !uriLocal.startsWith("ph://") &&
    !uriLocal.startsWith("content://")
  ) {
    return uriLocal;
  }

  // 2. Leer el archivo local temporal en formato base64
  const base64Data = await FileSystem.readAsStringAsync(uriLocal, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 3. Extensión y mimeType normalizados
  const extensionRaw = uriLocal.split(".").pop()?.toLowerCase() ?? "jpeg";
  const fileExt = extensionRaw === "png" ? "png" : "jpeg";

  // 4. Ruta FIJA basada en el ID de la empresa (sin Date.now() para permitir el reemplazo automático)
  const targetId = empresaId || "singleton";
  const filePath = `logos/logo_${targetId}.${fileExt}`;

  // 5. Subir decodificando el Base64 a ArrayBuffer con upsert: true y cacheControl revalidado
  const { error: uploadError } = await supabase.storage
    .from("empresa-assets")
    .upload(filePath, decode(base64Data), {
      contentType: `image/${fileExt}`,
      cacheControl: "0", // Evita que la CDN/App mantenga en cache la imagen previa tras un cambio
      upsert: true, // Reemplaza el archivo si ya existe en la misma ruta
    });

  if (uploadError) {
    throw new Error(
      `Error al subir o reemplazar el logo en Storage: ${uploadError.message}`,
    );
  }

  // 6. Obtener la URL pública permanente
  const { data: publicUrlData } = supabase.storage
    .from("empresa-assets")
    .getPublicUrl(filePath);

  // 7. Retornar la URL agregando un query parameter de cache busting
  // para forzar la recarga en la interfaz sin modificar la ruta en la BD
  return `${publicUrlData.publicUrl}?t=${Date.now()}`;
}

/**
 * Obtiene el registro de la empresa por ID o el singleton predeterminado.
 */
export async function obtenerEmpresa(
  empresaId?: string,
): Promise<Empresa | null> {
  let query = supabase.from("empresas").select("*");

  if (empresaId) {
    query = query.eq("id", empresaId);
  } else {
    query = query.eq("es_singleton", true);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(
      `Error al obtener los datos de la empresa: ${error.message}`,
    );
  }

  return data;
}

/**
 * Mapea la información enviada desde la UI (camelCase), procesa la subida/reemplazo del logo
 * si es una ruta local y persiste el registro en la base de datos (snake_case).
 */
export async function guardarEmpresaService(
  info: EmpresaInfo,
  empresaIdActiva?: string | null,
): Promise<Empresa> {
  let logoUrlFinal = info.logoUrl;

  const targetId = info.id || empresaIdActiva || "singleton";

  // Si la URI es un archivo local temporal, procesar el reemplazo en Storage
  if (
    logoUrlFinal &&
    (logoUrlFinal.startsWith("file://") ||
      logoUrlFinal.startsWith("ph://") ||
      logoUrlFinal.startsWith("content://"))
  ) {
    logoUrlFinal = await subirLogoEmpresa(logoUrlFinal, targetId);
  }

  // Obtener la sesión del usuario actual para asociar el creador (requerido para RLS)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Mapeo explícito de camelCase (UI) a snake_case (Supabase DB)
  const payload: Partial<Empresa> = {
    ...(info.id || empresaIdActiva ? { id: info.id || empresaIdActiva! } : {}),
    nombre_comercial: info.nombreComercial,
    nit: info.nit,
    razon_social: info.razonSocial,
    direccion_fiscal: info.direccionFiscal,
    ciudad: info.ciudad,
    whatsapp: info.whatsapp,
    instagram: info.instagram,
    facebook: info.facebook,
    sitio_web: info.sitioWeb,
    garantia: info.garantia,
    logo_url: logoUrlFinal,
    creado_por: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("empresas")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Error en base de datos al guardar empresa: ${error.message}`,
    );
  }

  return data;
}
