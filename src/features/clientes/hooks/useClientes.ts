// @/features/clientes/hooks/useClientes.ts
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { useCallback, useEffect, useState } from "react";
import {
  actualizarCliente as actualizarClienteService,
  crearCliente as crearClienteService,
  existeTelefonoEnEmpresa,
  getClientesActivos,
} from "../services/clienteService";
import type { ClienteInsertInput, ClienteResumen } from "../types";

export function useClientes() {
  const { empresaId, cargando: cargandoEmpresa } = useEmpresa();
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback(async () => {
    if (!empresaId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await getClientesActivos(empresaId);
      setClientes(data);
    } catch (e: any) {
      console.error("❌ [useClientes] Error cargando clientes:", e);
      setError(e.message ?? "Error cargando clientes");
    } finally {
      setCargando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    if (!cargandoEmpresa) {
      cargarClientes();
    }
  }, [cargarClientes, cargandoEmpresa]);

  const crearCliente = useCallback(
    async (input: ClienteInsertInput): Promise<ClienteResumen> => {
      if (!empresaId) {
        throw new Error(
          "No hay empresa seleccionada. No se puede crear el cliente.",
        );
      }
      const nuevo = await crearClienteService(empresaId, input);
      const resumen: ClienteResumen = {
        id: nuevo.id,
        nombre: nuevo.nombre,
        telefono: nuevo.telefono ?? undefined,
        userId: nuevo.userId,
      };
      setClientes((prev) => [resumen, ...prev]);
      return resumen;
    },
    [empresaId],
  );

  const actualizarCliente = useCallback(
    async (
      clienteId: string,
      input: Partial<ClienteInsertInput>,
    ): Promise<ClienteResumen> => {
      const actualizado = await actualizarClienteService(
        clienteId,
        input,
        empresaId ?? undefined,
      );
      const resumen: ClienteResumen = {
        id: actualizado.id,
        nombre: actualizado.nombre,
        telefono: actualizado.telefono ?? undefined,
        userId: actualizado.userId,
      };
      setClientes((prev) =>
        prev.map((c) => (c.id === resumen.id ? resumen : c)),
      );
      return resumen;
    },
    [empresaId],
  );

  const guardarCliente = useCallback(
    async (cliente: {
      id?: string;
      nombre: string;
      telefono: string;
      userId?: string;
    }): Promise<string> => {
      if (!cliente.nombre?.trim()) {
        throw new Error("Falta el nombre del cliente.");
      }
      if (!cliente.telefono?.trim()) {
        throw new Error("Falta el teléfono del cliente.");
      }

      if (cliente.id) {
        const actualizado = await actualizarCliente(cliente.id, {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          userId: cliente.userId,
        });
        return actualizado.id;
      }

      const nuevo = await crearCliente({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        userId: cliente.userId,
      });
      return nuevo.id;
    },
    [crearCliente, actualizarCliente],
  );

  const buscarPorTelefono = useCallback(
    (telefono: string): ClienteResumen | undefined => {
      const t = telefono.trim();
      if (!t) return undefined;
      return clientes.find((c) => c.telefono === t);
    },
    [clientes],
  );

  const validarTelefono = useCallback(
    async (telefono: string, clienteIdActual?: string): Promise<boolean> => {
      if (!empresaId) return false;
      return existeTelefonoEnEmpresa(empresaId, telefono, clienteIdActual);
    },
    [empresaId],
  );

  return {
    clientes,
    cargando: cargando || cargandoEmpresa,
    error,
    recargar: cargarClientes,
    crearCliente,
    actualizarCliente,
    guardarCliente,
    buscarPorTelefono,
    validarTelefono,
  };
}

export type UseClientesReturn = ReturnType<typeof useClientes>;
