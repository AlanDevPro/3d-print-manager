// @/features/clientes/services/clienteService.ts
import { supabase } from "@/services/supabase/client";
import {
  mapClienteToDbInsert,
  mapDbToCliente,
  mapDbToClienteResumen,
  type ClienteDbRow,
} from "../mappers/clienteMapper";
import type {
  Cliente,
  ClienteInsertInput,
  ClienteResumen,
  ClienteUpdateInput,
} from "../types";

const TABLE = "clientes";

function logSupabaseError(contexto: string, error: any, extra?: object) {
  console.error(`❌ [clienteService] Error en ${contexto}:`, error?.message, {
    code: error?.code,
    details: error?.details,
    extra,
  });
}

/**
 * Normaliza un nombre para comparación (trim, minúsculas, espacios colapsados)
 * de forma que "Juan  Pérez", "juan pérez" y " Juan Pérez " se consideren iguales.
 */
function normalizarNombre(nombre?: string | null): string {
  return (nombre ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Verifica si existe un cliente registrado con el mismo número de teléfono en la empresa.
 * Se mantiene para casos donde solo se necesita un booleano (p.ej. actualizarCliente).
 */
export async function existeTelefonoEnEmpresa(
  empresaId: string,
  telefono: string,
  excluirClienteId?: string,
): Promise<boolean> {
  const t = telefono.trim();
  if (!t) return false;

  let query = supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresaId)
    .eq("telefono", t);

  if (excluirClienteId) {
    query = query.neq("id", excluirClienteId);
  }

  const { count, error } = await query;
  if (error) {
    logSupabaseError("existeTelefonoEnEmpresa", error, { empresaId, t });
    throw error;
  }

  return (count ?? 0) > 0;
}

/**
 * Busca el cliente registrado con un teléfono dado dentro de la empresa.
 * Retorna el cliente completo si existe, o null si el teléfono está libre.
 */
export async function buscarClientePorTelefono(
  empresaId: string,
  telefono: string,
  excluirClienteId?: string,
): Promise<Cliente | null> {
  const t = telefono.trim();
  if (!t) return null;

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("telefono", t);

  if (excluirClienteId) {
    query = query.neq("id", excluirClienteId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    logSupabaseError("buscarClientePorTelefono", error, { empresaId, t });
    throw error;
  }

  return data ? mapDbToCliente(data as ClienteDbRow) : null;
}

export async function getClientesActivos(
  empresaId: string,
): Promise<ClienteResumen[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, nombre, telefono, user_id")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true });

  if (error) {
    logSupabaseError("getClientesActivos", error, { empresaId });
    throw error;
  }
  return (data as ClienteDbRow[]).map(mapDbToClienteResumen);
}

export async function getClientes(empresaId: string): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("getClientes", error, { empresaId });
    throw error;
  }
  return (data as ClienteDbRow[]).map(mapDbToCliente);
}

/**
 * Registra un cliente, evitando duplicados por teléfono:
 * - Teléfono libre            -> se inserta un cliente nuevo.
 * - Teléfono ya existe y el
 *   nombre coincide           -> es el mismo cliente (puede tener varias
 *                                cotizaciones/pedidos); NO se inserta, se
 *                                retorna el registro existente para reutilizarlo.
 * - Teléfono ya existe pero
 *   el nombre es distinto     -> conflicto real; se lanza un error y NO se
 *                                registra nada.
 */
export async function crearCliente(
  empresaId: string,
  input: ClienteInsertInput,
): Promise<Cliente> {
  const telefono = input.telefono?.trim();

  if (telefono) {
    const clienteExistente = await buscarClientePorTelefono(
      empresaId,
      telefono,
    );

    if (clienteExistente) {
      const nombreExistente = normalizarNombre(clienteExistente.nombre);
      const nombreNuevo = normalizarNombre(input.nombre);

      if (nombreExistente === nombreNuevo) {
        console.log(
          `ℹ️ [crearCliente] Teléfono "${telefono}" ya registrado para "${clienteExistente.nombre}". Reutilizando cliente existente (ID: ${clienteExistente.id}).`,
        );
        return clienteExistente;
      }

      throw new Error(
        `El número de teléfono "${telefono}" ya está registrado para "${clienteExistente.nombre}". Verifica los datos o corrige el nombre del cliente.`,
      );
    }
  }

  const payload = mapClienteToDbInsert(empresaId, input);

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    logSupabaseError("crearCliente", error, { empresaId, payload });
    throw error;
  }

  // Si el cliente cuenta con un user_id de Auth, se asegura su vinculación en empresa_miembros con el rol "cliente"
  if (input.userId) {
    const { error: miembroError } = await supabase
      .from("empresa_miembros")
      .upsert(
        {
          empresa_id: empresaId,
          user_id: input.userId,
          rol: "cliente",
          estado: "activo",
        },
        { onConflict: "empresa_id,user_id" },
      );

    if (miembroError) {
      logSupabaseError("vincularEmpresaMiembroCliente", miembroError, {
        empresaId,
        userId: input.userId,
      });
    }
  }

  return mapDbToCliente(data as ClienteDbRow);
}

export async function actualizarCliente(
  clienteId: string,
  input: ClienteUpdateInput,
  empresaId?: string,
): Promise<Cliente> {
  if (input.telefono?.trim() && empresaId) {
    const existe = await existeTelefonoEnEmpresa(
      empresaId,
      input.telefono,
      clienteId,
    );
    if (existe) {
      throw new Error(
        `El teléfono "${input.telefono}" ya pertenece a otro cliente registrado.`,
      );
    }
  }

  const cambios: Record<string, any> = {
    ...(input.nombre !== undefined && { nombre: input.nombre.trim() }),
    ...(input.telefono !== undefined && {
      telefono: input.telefono?.trim() || null,
    }),
    ...(input.direccion !== undefined && {
      direccion: input.direccion?.trim() || null,
    }),
    ...(input.notas !== undefined && { notas: input.notas?.trim() || null }),
    ...(input.userId !== undefined && { user_id: input.userId || null }),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .update(cambios)
    .eq("id", clienteId)
    .select("*")
    .single();

  if (error) {
    logSupabaseError("actualizarCliente", error, { clienteId, cambios });
    throw error;
  }

  return mapDbToCliente(data as ClienteDbRow);
}
