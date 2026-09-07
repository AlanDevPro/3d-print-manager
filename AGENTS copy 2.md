import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { estadoConfig } from "../constants";
import {
  actualizarEstadoPedido,
  marcarPedidoComoPagado,
  toggleChecklistItem as toggleChecklistItemService,
  verificarPagoPedido as verificarPagoPedidoService,
} from "../services/pedidosService";
import { EstadoPedido, MetodoPago, Pedido } from "../types";

export function usePedidoActions(
  actualizarPedidoLocal: (id: string, cambios: Partial<Pedido>) => void,
  recargar: () => Promise<void>,
) {
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [cargandoConfirmacion, setCargandoConfirmacion] = useState(false);

  const cambiarEstado = useCallback(
    async (pedido: Pedido, nuevoEstado: EstadoPedido) => {
      const estadoAnterior = pedido.estado;
      actualizarPedidoLocal(pedido.id, { estado: nuevoEstado });
      try {
        setErrorAccion(null);
        await actualizarEstadoPedido(pedido.id, nuevoEstado);
        await recargar();
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, { estado: estadoAnterior });
        setErrorAccion(
          e.message?.includes("anticipo")
            ? e.message
            : "No se pudo cambiar el estado del pedido.",
        );
      }
    },
    [actualizarPedidoLocal, recargar],
  );

  const marcarComoPagado = useCallback(
    async (pedido: Pedido, metodo: MetodoPago = "efectivo") => {
      const saldo = pedido.pago.total - pedido.pago.montoCobrado;
      if (saldo <= 0) return;
      actualizarPedidoLocal(pedido.id, {
        pago: {
          ...pedido.pago,
          estado: "pagado",
          montoCobrado: pedido.pago.total,
        },
      });
      try {
        setErrorAccion(null);
        await marcarPedidoComoPagado(pedido.id, saldo, metodo);
        await recargar();
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, { pago: pedido.pago });
        setErrorAccion("No se pudo registrar el pago.");
      }
    },
    [actualizarPedidoLocal, recargar],
  );

  const confirmarVerificacionPago = useCallback(
  async (pedido: Pedido) => {
    if (pedido.pago.verificado) return; // ya verificado, no vuelve a ejecutar

    const estadoAnterior = pedido.estado;
    const pagoAnterior = pedido.pago;
    const checklistAnterior = pedido.envio.checklist;

    const montoAnticipo =
      Math.round(pedido.pago.total * (pedido.pago.anticipoPorcentaje / 100) * 100) / 100;

    // Actualización optimista local: refleja lo que hará la función SQL
    actualizarPedidoLocal(pedido.id, {
      estado: estadoAnterior === "pendiente" ? "en_impresion" : estadoAnterior,
      pago: {
        ...pedido.pago,
        verificado: true,
        estado: "anticipo",
        montoCobrado: montoAnticipo,
      },
      envio: {
        ...pedido.envio,
        checklist: checklistAnterior.map((item, index) =>
          index === 0 ? { ...item, hecho: true } : item
        ),
      },
    });

    try {
      setCargandoConfirmacion(true);
      setErrorAccion(null);

      await verificarPagoPedidoService(pedido.id);
      await recargar();

      Alert.alert(
        "Pago verificado",
        "El anticipo fue verificado. El pedido pasó a producción."
      );
    } catch (e: any) {
      actualizarPedidoLocal(pedido.id, {
        estado: estadoAnterior,
        pago: pagoAnterior,
        envio: { ...pedido.envio, checklist: checklistAnterior },
      });
      const msg = e.message || "No se pudo verificar el pago.";
      setErrorAccion(msg);
      Alert.alert("Error", msg);
    } finally {
      setCargandoConfirmacion(false);
    }
  },
  [actualizarPedidoLocal, recargar]
);

  const toggleChecklist = useCallback(
    async (pedido: Pedido, itemId: string) => {
      const checklistAnterior = pedido.envio.checklist;
      const item = checklistAnterior.find((c) => c.id === itemId);
      if (!item) return;

      const nuevoChecklist = checklistAnterior.map((c) =>
        c.id === itemId ? { ...c, hecho: !c.hecho } : c,
      );
      actualizarPedidoLocal(pedido.id, {
        envio: { ...pedido.envio, checklist: nuevoChecklist },
      });

      try {
        setErrorAccion(null);
        await toggleChecklistItemService(itemId, item.hecho);
      } catch (e: any) {
        actualizarPedidoLocal(pedido.id, {
          envio: { ...pedido.envio, checklist: checklistAnterior },
        });
        setErrorAccion("No se pudo actualizar el checklist.");
      }
    },
    [actualizarPedidoLocal],
  );

  const abrirWhatsapp = useCallback((pedido: Pedido, mensaje: string) => {
    const numero = pedido.cliente.telefono.replace(/[^\d+]/g, "");
    Linking.openURL(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
    );
  }, []);

  const llamarCliente = useCallback((pedido: Pedido) => {
    Linking.openURL(`tel:${pedido.cliente.telefono}`);
  }, []);

  return {
    errorAccion,
    cargandoConfirmacion,
    cambiarEstado,
    marcarComoPagado,
    confirmarVerificacionPago,
    toggleChecklist,
    abrirWhatsapp,
    llamarCliente,
    estadoConfig,
  };
}



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






import { Pedido, PedidoRow } from "../types";
import { formatCodigoPedido, formatFechaEntrega } from "../utils/formato";

export function mapPedidoFromDb(row: PedidoRow): Pedido {
  // 1. Obtener los pagos ordenados de más reciente a más antiguo
  const pagos = row.pedido_pagos ?? [];
  const pagosOrdenados = [...pagos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const ultimoPago = pagosOrdenados.length > 0 ? pagosOrdenados[0] : null;

  // 2. Calcular la suma total cobrada a partir del historial de pagos
  const totalPagadoCalculado = pagos.reduce(
    (acc, pago) => acc + Number(pago.monto ?? 0),
    0
  );

  // Si pago_monto_cobrado en BD viene en 0 o null, usaremos el total calculado de la relación
  const montoCobradoFinal =
    Number(row.pago_monto_cobrado) > 0
      ? Number(row.pago_monto_cobrado)
      : totalPagadoCalculado;

  return {
    id: row.id,
    codigo: formatCodigoPedido(row.codigo_pedido),
    cotizacionId: row.cotizacion_id,
    cliente: {
      id: row.clientes?.id ?? row.cliente_id,
      nombre: row.clientes?.nombre ?? "Cliente sin nombre",
      telefono: row.clientes?.telefono ?? "",
      direccion: row.clientes?.direccion ?? "",
      notas: row.clientes?.notas ?? "",
      recurrente: row.cliente_recurrente ?? false,
    },
    pieza: row.pieza_descripcion,
    estado: row.estado,
    fechaEntregaTexto: formatFechaEntrega(row.fecha_entrega),
    fechaEntregaISO: row.fecha_entrega ?? "",
    pago: {
      estado: row.pago_estado,
      metodo: ultimoPago?.metodo ?? null,
      anticipoPorcentaje: Number(row.pago_anticipo_pct ?? 0),
      total: Number(row.pago_total ?? 0),
      montoCobrado: montoCobradoFinal,
      comprobanteUrl: ultimoPago?.comprobante_url ?? null,
      verificado: ultimoPago?.verificado ?? false,
    },
    envio: {
      tipo: row.envio_tipo,
      costo: Number(row.envio_costo ?? 0),
      tracking: row.envio_tracking ?? "",
      checklist: (row.pedido_checklist_items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        hecho: item.hecho,
      })),
    },
    fotoFinalUrl: row.foto_final_url,
    fotoCotizacionUrl: row.cotizaciones?.imagen_referencia_url ?? null,
    historial: (row.pedido_eventos ?? []).map((e) => ({
      id: e.id,
      fecha: e.created_at,
      texto: e.texto,
    })),
  };
}

export function mapPedidosFromDb(rows: PedidoRow[]): Pedido[] {
  return rows.map(mapPedidoFromDb);
}



export type EstadoPedido = "pendiente" | "en_impresion" | "listo" | "entregado";
export type EstadoPago = "sin_pagar" | "anticipo" | "pagado";
export type MetodoPago = "transferencia" | "efectivo" | "qr";
export type TipoEnvio = "recoger" | "domicilio";
export type Prioridad = "normal" | "urgente" | "vencido";
export type TipoPago = "anticipo" | "abono" | "pago_final";

export interface ClienteRow {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

export interface CotizacionRelacionRow {
  id: string;
  imagen_referencia_url: string | null;
}

export interface PedidoChecklistItemRow {
  id: string;
  pedido_id: string;
  label: string;
  hecho: boolean;
  orden: number;
}

export interface PedidoEventoRow {
  id: string;
  pedido_id: string;
  texto: string;
  created_at: string;
}

export interface PedidoPagoRow {
  id: string;
  pedido_id: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobante_url?: string | null;
  verificado?: boolean;
  created_at: string;
}

export interface PedidoRow {
  id: string;
  empresa_id: string;
  creado_por: string;
  cotizacion_id: string | null;
  cliente_id: string;
  producto_id: string | null;
  codigo_pedido: number;

  pieza_descripcion: string;
  estado: EstadoPedido;
  fecha_entrega: string | null;

  pago_total: number;
  pago_anticipo_pct: number;
  pago_monto_cobrado: number;
  pago_estado: EstadoPago;

  envio_tipo: TipoEnvio;
  envio_costo: number | null;
  envio_tracking: string | null;

  foto_final_url: string | null;
  created_at: string;
  updated_at: string;

  clientes: ClienteRow | null;
  cotizaciones: CotizacionRelacionRow | null;
  pedido_checklist_items: PedidoChecklistItemRow[] | null;
  pedido_eventos: PedidoEventoRow[] | null;
  pedido_pagos: PedidoPagoRow[] | null;
  cliente_recurrente?: boolean;
}

export interface EventoHistorial {
  id: string;
  fecha: string;
  texto: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hecho: boolean;
}

export interface Pedido {
  id: string;
  codigo: string;
  cotizacionId: string | null;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    direccion: string;
    notas: string;
    recurrente: boolean;
  };
  pieza: string;
  estado: EstadoPedido;
  fechaEntregaTexto: string;
  fechaEntregaISO: string;
  pago: {
    estado: EstadoPago;
    metodo: MetodoPago | null;
    anticipoPorcentaje: number;
    total: number;
    montoCobrado: number;
    comprobanteUrl: string | null;
    verificado: boolean;
  };
  envio: {
    tipo: TipoEnvio;
    costo: number;
    tracking: string;
    checklist: ChecklistItem[];
  };
  fotoFinalUrl: string | null;
  fotoCotizacionUrl: string | null;
  historial: EventoHistorial[];
}

export interface RegistrarPagoInput {
  pedidoId: string;
  monto: number;
  metodo: MetodoPago;
  tipo: TipoPago;
  comprobanteUrl?: string;
}

, [
  {
    "tabla": "catalogo_productos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "categoria",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "descripcion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "precio_referencia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "tiempo_impresion_horas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "peso_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "filamento_sugerido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "impresora_sugerida_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "stock_terminado",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "umbral_stock_bajo",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "activo",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "clientes",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "telefono",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "direccion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "clientes",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_kwh",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_mano_obra_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_operativo_fijo_mensual",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "horas_laborables_mes",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "tasa_fallo_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "impuesto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "margen_ganancia_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "moneda",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_titular",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "impresora_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "filamento_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "nombre_pieza",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cantidad",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "peso_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_impresion_horas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_preparacion_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_postprocesado_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_material",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_energia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_amortizacion",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mantenimiento",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mano_obra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_subtotal_item",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "codigo_cotizacion",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_contacto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_directo_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_indirecto_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_fallos_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "subtotal_costo_base",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_ganancia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_impuesto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "precio_final",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "margen_ganancia_aplicado_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "token_publico",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "voucher_data",
    "tipo_dato": "jsonb",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "imagen_referencia_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_diseno_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "categoria",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "concepto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "filamento_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "impresora_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "fecha",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "rol",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "logo_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nombre_comercial",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nit",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "razon_social",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "direccion_fiscal",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ciudad",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "whatsapp",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "instagram",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "facebook",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "sitio_web",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "garantia",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "es_singleton",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ubicacion_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "material",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "capacidad_rollo_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "activo",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color_hex",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "stock_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "proveedor",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "fecha_compra",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "umbral_bajo_stock",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "filamentos",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "modelo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "vida_util_horas",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "potencia_watts",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_mantenimiento_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "activa",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "horas_uso_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "pedido_actual",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "fecha_adquisicion",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "impresoras",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "concepto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "fecha",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "metas_financieras",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "periodo",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "monto_meta",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "label",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "hecho",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "orden",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "texto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "comprobante_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "fecha",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "verificado",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "codigo_pedido",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pieza_descripcion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "fecha_entrega",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_anticipo_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_monto_cobrado",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_costo",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tracking",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "foto_final_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "profiles",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "email",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "full_name",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "avatar_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "telefono",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "margen_ganancia_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "nombre",
    "tipo_dato": "character varying",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  }
]



si tengo estos codigos y esos datos en mis tablas quiero que me des las logoca profesional y automaticamente para que un pedido ya esta en estado en_impresion quiero que tomes la duracion de impresion de mi cotizacion_items te todos mis cotizacion para que en base a esas horas pueda estimar mi tiempo de impresion para cambiar de estado automaticamente mi pedido de estado: "en_impresion" a "listo_para_entrega" con un margen de esperar de 15 minutos para que despues de esos 15 min empice la cuenta regresiva de mi pedido para que cuando termine el tiempo por decir el tiempo es ede 3 horas, 12 minutos automaticamente despues de ese tiempo quieor que me cambies mi estado de "en_impresion" a "listo_para_entrega"  y quiero ademas notificar que la impresion ya esta lista para entregar dame mis codigos completos con ese flujo profesional para actualizar, insertar, datos de mis pedidos como pedido_eventos, pedido_checklist_items y todo lo relacionado con mi cambio de estado de mi pedido  