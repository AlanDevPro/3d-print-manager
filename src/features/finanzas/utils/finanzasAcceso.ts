// src/features/finanzas/utils/finanzasAcceso.ts
import { RolEmpresa } from "../types";

// Re-exportamos el tipo para que otros módulos que importen finanzasAcceso puedan usarlo
export type { RolEmpresa };

const ROLES_CON_ACCESO: RolEmpresa[] = ["admin", "empleado"];

export function puedeVerFinanzas(rol: RolEmpresa | null | undefined): boolean {
  return !!rol && ROLES_CON_ACCESO.includes(rol);
}
