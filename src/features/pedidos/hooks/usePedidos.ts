// Toda la lógica de datos que antes vivía dentro de PedidosScreen.
// La pantalla queda reducida a "conectar hooks con componentes".

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { estadoConfig, ESTADOS } from "../constants";
import { mapPedidosFromDb } from "../mappers/pedidosMapper";
import {
  fetchPedidos,
  suscribirCambiosPedidos,
} from "../services/pedidosService";
import { EstadoPedido, Pedido } from "../types";
import { calcularPrioridad } from "../utils/fechas";

export function usePedidos() {
  const { empresaId } = useEmpresaActual();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");

  const cargarPedidos = useCallback(async () => {
    if (!empresaId) {
      setCargando(false);
      return;
    }
    try {
      setError(null);
      const rows = await fetchPedidos(empresaId);
      setPedidos(mapPedidosFromDb(rows));
    } catch (e: any) {
      // 🚨 Diagnóstico en consola Metro/Debugger
      console.error("Error cargando pedidos en Supabase:", e);
      setError(e.message ?? "No se pudieron cargar los pedidos");
    } finally {
      setCargando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    cargarPedidos();
    if (!empresaId) return;

    const unsubscribe = suscribirCambiosPedidos(empresaId, cargarPedidos);
    return unsubscribe;
  }, [empresaId, cargarPedidos]);

  // Actualiza un pedido en memoria sin esperar al refetch (UI optimista).
  const actualizarPedidoLocal = useCallback(
    (id: string, cambios: Partial<Pedido>) => {
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
      );
    },
    [],
  );

  const conteos = useMemo(() => {
    const base: Record<string, number> = { todos: pedidos.length };
    ESTADOS.forEach(
      (e) => (base[e.key] = pedidos.filter((p) => p.estado === e.key).length),
    );
    return base;
  }, [pedidos]);

  const kpis = useMemo(() => {
    const activos = pedidos.filter((p) => p.estado !== "entregado");
    const cobroPendiente = pedidos.reduce(
      (acc, p) => acc + (p.pago.total - p.pago.montoCobrado),
      0,
    );
    const entregasHoy = pedidos.filter(
      (p) => calcularPrioridad(p.fechaEntregaISO, p.estado) === "urgente",
    ).length;
    const vencidos = pedidos.filter(
      (p) => calcularPrioridad(p.fechaEntregaISO, p.estado) === "vencido",
    ).length;
    return { activos: activos.length, cobroPendiente, entregasHoy, vencidos };
  }, [pedidos]);

  const pedidosUrgentes = useMemo(
    () =>
      pedidos
        .filter((p) => {
          const pr = calcularPrioridad(p.fechaEntregaISO, p.estado);
          return pr === "urgente" || pr === "vencido";
        })
        .sort(
          (a, b) =>
            new Date(a.fechaEntregaISO).getTime() -
            new Date(b.fechaEntregaISO).getTime(),
        ),
    [pedidos],
  );

  const pedidosFiltrados = useMemo(() => {
    let lista =
      filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (p) =>
          p.cliente.nombre.toLowerCase().includes(q) ||
          p.pieza.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q),
      );
    }
    return lista;
  }, [pedidos, filtro, busqueda]);

  return {
    pedidos,
    cargando,
    error,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    conteos,
    kpis,
    pedidosUrgentes,
    pedidosFiltrados,
    recargar: cargarPedidos,
    actualizarPedidoLocal,
    estadoConfig,
  };
}
