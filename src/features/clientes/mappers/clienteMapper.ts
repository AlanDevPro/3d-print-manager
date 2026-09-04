// @/features/clientes/mappers/clienteMapper.ts
import type { Cliente, ClienteInsertInput, ClienteResumen } from "../types";

export interface ClienteDbRow {
  id: string;
  empresa_id: string;
  user_id: string | null;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbToCliente(row: ClienteDbRow): Cliente {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    userId: row.user_id,
    nombre: row.nombre,
    telefono: row.telefono,
    direccion: row.direccion,
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDbToClienteResumen(row: ClienteDbRow): ClienteResumen {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono ?? undefined,
    userId: row.user_id,
  };
}

export function mapClienteToDbInsert(
  empresaId: string,
  input: ClienteInsertInput,
) {
  return {
    empresa_id: empresaId,
    user_id: input.userId || null,
    nombre: input.nombre.trim(),
    telefono: input.telefono?.trim() || null,
    direccion: input.direccion?.trim() || null,
    notas: input.notas?.trim() || null,
  };
}
