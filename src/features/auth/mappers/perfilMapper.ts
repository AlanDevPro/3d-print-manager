// src/features/auth/mappers/perfilMapper.ts
import type { Profile, RolUsuario } from "@/types/database";
import type { AccountInfo } from "../types";

export function mapDbToAccount(
  perfil: Profile | null,
  authUserId: string,
  authEmail: string | null,
  empresaMiembro?: { empresa_id: string; rol: string } | null,
): AccountInfo {
  return {
    id: authUserId,
    nombre: perfil?.full_name ?? "",
    email: perfil?.email || authEmail || "",
    telefono: perfil?.telefono ?? "",
    avatarUrl: perfil?.avatar_url ?? null,
    rol: (empresaMiembro?.rol as RolUsuario) ?? "cliente",
    empresaId: empresaMiembro?.empresa_id,
  };
}

export function mapAccountToDb(info: Partial<AccountInfo>): Partial<Profile> {
  return {
    ...(info.nombre !== undefined && { full_name: info.nombre }),
    ...(info.telefono !== undefined && { telefono: info.telefono }),
    ...(info.avatarUrl !== undefined && { avatar_url: info.avatarUrl }),
  };
}
