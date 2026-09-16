// src/features/inventario/services/inventarioService.ts
import { supabase } from "@/services/supabase/client";
import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";
import { File as ExpoFile } from "expo-file-system"; // <--- Alias para evitar colisión de tipos
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

function generarUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Crypto.randomUUID();
}

async function subirImagenStorageWeb(
  file: globalThis.File, // <--- Usamos explícitamente el File global del navegador/web
  empresaId: string,
  carpeta: "filamentos" | "impresoras",
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

async function subirImagenStorageNative(
  uri: string,
  empresaId: string,
  carpeta: "filamentos" | "impresoras",
): Promise<string> {
  const cleanUri = uri.split("?")[0];
  const fileExt = cleanUri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${generarUUID()}.${fileExt}`;
  const filePath = `${empresaId}/${carpeta}/${fileName}`;
  const mimeType = fileExt === "png" ? "image/png" : "image/jpeg";

  // Usamos el alias ExpoFile para manipular archivos locales en React Native
  const file = new ExpoFile(uri);
  const base64Data = await file.base64();
  const arrayBuffer = decode(base64Data);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, arrayBuffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Error al subir la imagen en React Native: ${uploadError.message}`,
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

async function procesarImagen(
  origenImagen: globalThis.File | string | undefined | null, // <--- Tipado seguro con globalThis.File
  empresaId: string,
  carpeta: "filamentos" | "impresoras",
): Promise<string | null> {
  if (!origenImagen) return null;

  if (typeof origenImagen === "string") {
    if (
      origenImagen.startsWith("file://") ||
      origenImagen.startsWith("ph://") ||
      origenImagen.startsWith("content://")
    ) {
      return await subirImagenStorageNative(origenImagen, empresaId, carpeta);
    }
    return origenImagen;
  }

  if (
    typeof globalThis.File !== "undefined" &&
    origenImagen instanceof globalThis.File
  ) {
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
  empresaId: string,
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
  nuevo: NuevoFilamento,
  empresaId: string,
): Promise<Filamento> {
  const origenImagen = nuevo.imagenUrl || nuevo.imagenFile;
  const imagenUrlFinal = await procesarImagen(
    origenImagen as any, // Cast seguro para tolerar la polivalencia de tipos UI
    empresaId,
    "filamentos",
  );

  const { data, error } = await supabase
    .from("filamentos")
    .insert(mapFilamentoToInsertRow(nuevo, empresaId, imagenUrlFinal))
    .select()
    .single();

  if (error) throw error;
  return mapFilamentoRow(data);
}

export async function obtenerImpresoras(
  empresaId: string,
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
  nueva: NuevaImpresora,
  empresaId: string,
): Promise<Impresora> {
  const origenImagen = nueva.imagenUrl || nueva.imagenFile;
  const imagenUrlFinal = await procesarImagen(
    origenImagen as any, // Cast seguro para tolerar la polivalencia de tipos UI
    empresaId,
    "impresoras",
  );

  const { data, error } = await supabase
    .from("impresoras")
    .insert(mapImpresoraToInsertRow(nueva, empresaId, imagenUrlFinal))
    .select()
    .single();

  if (error) throw error;
  return mapImpresoraRow(data);
}

export async function obtenerPiezasStock(
  userId: string,
): Promise<PiezaStock[]> {
  const { data, error } = await supabase
    .from("piezas_stock")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPiezaStockRow);
}
