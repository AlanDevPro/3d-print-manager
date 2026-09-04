// src/features/auth/services/perfilService.ts
import { supabase } from "@/services/supabase/client";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

export type RolUsuario = "admin" | "empleado" | "cliente" | "propietario";

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  avatarUrl?: string;
  telefono?: string;
  rol?: RolUsuario;
  empresaId?: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  telefono: string | null;
}

const PROFILE_SELECT_COLUMNS = "id, full_name, email, avatar_url, telefono";

function mapDbRowToProfile(
  row: ProfileRow,
  rol: RolUsuario = "cliente",
  empresaId?: string,
): UserProfile {
  return {
    id: row.id,
    full_name: row.full_name ?? "",
    email: row.email ?? "",
    avatarUrl: row.avatar_url ?? "",
    telefono: row.telefono ?? "",
    rol,
    empresaId,
  };
}

/**
 * Subir o reemplazar la foto de perfil en el bucket 'empresa-assets' dentro de 'avatars/'.
 * Mantiene un único archivo por usuario (sobrescribe usando `upsert: true`).
 */
export async function uploadAvatar(
  userId: string,
  localUri: string,
): Promise<string> {
  if (
    !localUri.startsWith("file://") &&
    !localUri.startsWith("ph://") &&
    !localUri.startsWith("content://")
  ) {
    return localUri;
  }

  // Lectura del archivo local en Base64
  const base64Data = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const extensionRaw = localUri.split(".").pop()?.toLowerCase() ?? "jpeg";
  const fileExt = extensionRaw === "jpg" ? "jpeg" : extensionRaw;

  // Ruta fija por usuario sin Date.now() para reutilizar y sobrescribir el mismo archivo
  const filePath = `avatars/user_${userId}.${fileExt}`;

  // Subida al Storage de Supabase con sobrescritura activada (upsert: true)
  const { error: uploadError } = await supabase.storage
    .from("empresa-assets")
    .upload(filePath, decode(base64Data), {
      contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error al subir avatar a Storage:", uploadError);
    throw new Error(`Storage: ${uploadError.message}`);
  }

  // Obtención de la URL pública
  const { data: publicUrlData } = supabase.storage
    .from("empresa-assets")
    .getPublicUrl(filePath);

  // Parámetro de timestamp para invalidar la caché del componente Image en React Native
  return `${publicUrlData.publicUrl}?t=${Date.now()}`;
}

/**
 * Obtiene el perfil del usuario activo incluyendo su rol en la empresa.
 */
export const getProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error al obtener perfil:", profileError);
    throw new Error(`profiles: ${profileError.message}`);
  }

  if (!profileData) return null;

  // Obtener rol y empresa vinculada desde empresa_miembros
  const { data: miembroData } = await supabase
    .from("empresa_miembros")
    .select("empresa_id, rol")
    .eq("user_id", userId)
    .eq("estado", "activo")
    .maybeSingle();

  const rol = (miembroData?.rol as RolUsuario) ?? "cliente";
  const empresaId = miembroData?.empresa_id ?? undefined;

  return mapDbRowToProfile(
    profileData as unknown as ProfileRow,
    rol,
    empresaId,
  );
};

/**
 * Actualiza los datos del perfil en la tabla `profiles`.
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> => {
  const dbUpdates: Partial<ProfileRow> = {
    ...(updates.full_name !== undefined && { full_name: updates.full_name }),
    ...(updates.email !== undefined && { email: updates.email }),
    ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
    ...(updates.telefono !== undefined && { telefono: updates.telefono }),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...dbUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(PROFILE_SELECT_COLUMNS)
    .single();

  if (error) {
    console.error("Error al actualizar perfil:", error);
    throw new Error(`profiles: ${error.message}`);
  }

  return mapDbRowToProfile(
    data as unknown as ProfileRow,
    updates.rol ?? "cliente",
    updates.empresaId,
  );
};
