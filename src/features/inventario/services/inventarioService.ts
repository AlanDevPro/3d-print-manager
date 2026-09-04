import { supabase } from "@/services/supabase/client";
import * as Crypto from "expo-crypto";
import {
  mapFilamentoRow,
  mapFilamentoToInsertRow,
  mapImpresoraRow,
  mapImpresoraToInsertRow,
  mapPiezaStockRow,
} from "../mappers/inventarioMapper";
import type {
  Filamento,
  Impresora,
  NuevaImpresora,
  NuevoFilamento,
  PiezaStock,
} from "../types";

export type ContextoUsuario = {
  userId: string;
  empresaId: string;
  rol: "admin" | "empleado" | string;
};

const BUCKET_NAME = "empresa-assets";

/**
 * Genera un UUID compatible tanto para Web como para React Native / Expo
 */
function generarUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Crypto.randomUUID();
}

/**
 * Auxiliar para subir un archivo 'File' (Entorno Web)
 */
async function subirImagenStorageWeb(
  file: File,
  empresaId: string,
  carpeta: "filamentos" | "impresoras"
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${generarUUID()}.${fileExt}`;
  const filePath = `${empresaId}/${carpeta}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir la imagen en Web: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Auxiliar para subir una imagen desde una URI local (Entorno React Native / Expo)
 */
async function subirImagenStorageNative(
  uri: string,
  empresaId: string,
  carpeta: "filamentos" | "impresoras"
): Promise<string> {
  const fileExt = uri.split(".").pop()?.split("?")[0] || "jpg";
  const fileName = `${generarUUID()}.${fileExt}`;
  const filePath = `${empresaId}/${carpeta}/${fileName}`;

  // Se convierte la URI local a ArrayBuffer para compatibilidad móvil con Supabase
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir la imagen en React Native: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Procesa la fuente de la imagen (URI local, File de Web o URL existente)
 */
async function procesarImagen(
  origenImagen: File | string | undefined | null,
  empresaId: string,
  carpeta: "filamentos" | "impresoras"
): Promise<string | null> {
  if (!origenImagen) return null;

  if (typeof origenImagen === "string") {
    // Si la URI pertenece al almacenamiento local del dispositivo (Expo)
    if (
      origenImagen.startsWith("file://") ||
      origenImagen.startsWith("ph://") ||
      origenImagen.startsWith("content://")
    ) {
      return await subirImagenStorageNative(origenImagen, empresaId, carpeta);
    }
    // Si ya es una URL remota de Supabase o HTTP
    return origenImagen;
  }

  if (typeof File !== "undefined" && origenImagen instanceof File) {
    return await subirImagenStorageWeb(origenImagen, empresaId, carpeta);
  }

  return null;
}

export async function obtenerContextoUsuario(): Promise<ContextoUsuario> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("No hay sesión activa");

  const userId = authData.user.id;

  const { data: miembro, error: miembroError } = await supabase
    .from("empresa_miembros")
    .select("empresa_id, rol")
    .eq("user_id", userId)
    .eq("estado", "activo")
    .single();

  if (miembroError || !miembro) {
    throw new Error("El usuario no pertenece a ninguna empresa activa");
  }

  return {
    userId,
    empresaId: miembro.empresa_id,
    rol: miembro.rol,
  };
}

export async function obtenerFilamentos(
  empresaId: string
): Promise<Filamento[]> {
  const { data, error } = await supabase
    .from("filamentos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapFilamentoRow);
}

export async function crearFilamento(
  nuevo: NuevoFilamento & { imagenUrl?: string; imagenFile?: File | string },
  empresaId: string
): Promise<Filamento> {
  const origenImagen = nuevo.imagenUrl || nuevo.imagenFile;
  const imagenUrlFinal = await procesarImagen(origenImagen, empresaId, "filamentos");

  const { data, error } = await supabase
    .from("filamentos")
    .insert(mapFilamentoToInsertRow(nuevo, empresaId, imagenUrlFinal))
    .select()
    .single();

  if (error) throw error;
  return mapFilamentoRow(data);
}

export async function obtenerImpresoras(
  empresaId: string
): Promise<Impresora[]> {
  const { data, error } = await supabase
    .from("impresoras")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activa", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapImpresoraRow);
}

export async function crearImpresora(
  nueva: NuevaImpresora & { imagenUrl?: string; imagenFile?: File | string },
  empresaId: string
): Promise<Impresora> {
  const origenImagen = nueva.imagenUrl || nueva.imagenFile;
  const imagenUrlFinal = await procesarImagen(origenImagen, empresaId, "impresoras");

  const { data, error } = await supabase
    .from("impresoras")
    .insert(mapImpresoraToInsertRow(nueva, empresaId, imagenUrlFinal))
    .select()
    .single();

  if (error) throw error;
  return mapImpresoraRow(data);
}

export async function obtenerPiezasStock(
  userId: string
): Promise<PiezaStock[]> {
  const { data, error } = await supabase
    .from("piezas_stock")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPiezaStockRow);
}