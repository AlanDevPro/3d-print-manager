// src/features/auth/types.ts
import type { RolUsuario } from "@/types/database";

// Re-exportamos el tipo para que useAccount y otros módulos puedan importarlo desde este archivo
export type { RolUsuario };

export interface AccountInfo {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  avatarUrl: string | null;
  rol: RolUsuario;
  empresaId?: string;
}

export const ACCOUNT_VACIA: AccountInfo = {
  id: "",
  nombre: "",
  email: "",
  telefono: "",
  avatarUrl: null,
  rol: "cliente",
};
