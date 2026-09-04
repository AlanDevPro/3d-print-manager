// src/features/pedidos/utils/fechas.ts
// Helpers de fecha puros (sin dependencias de React ni Supabase),
// fáciles de testear de forma aislada.

import { EstadoPedido, Prioridad } from "../types";

/**
 * Calcula la prioridad visual de un pedido según su fecha de entrega.
 * - "vencido": la fecha de entrega ya pasó y el pedido no está entregado.
 * - "urgente": la entrega es hoy.
 * - "normal": cualquier otro caso (o ya entregado).
 */
export function calcularPrioridad(
  fechaISO: string | null,
  estado: EstadoPedido,
): Prioridad {
  if (estado === "entregado" || !fechaISO) return "normal";

  const entrega = new Date(fechaISO);
  const ahora = new Date();

  const finDelDiaEntrega = new Date(entrega);
  finDelDiaEntrega.setHours(23, 59, 59, 999);
  if (finDelDiaEntrega.getTime() < ahora.getTime()) return "vencido";

  const inicioDelDiaEntrega = new Date(entrega);
  inicioDelDiaEntrega.setHours(0, 0, 0, 0);
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  if (inicioDelDiaEntrega.getTime() === inicioHoy.getTime()) return "urgente";

  return "normal";
}

/**
 * Convierte una fecha_entrega (TIMESTAMPTZ de Supabase) al texto amigable
 * que se muestra en las cards ("Hoy, 18:00", "Mañana, 10:00", "23/08, 15:00").
 * Reemplaza el antiguo campo `fechaEntregaTexto` que antes se guardaba a mano.
 */
export function formatFechaEntrega(fechaISO: string | null): string {
  if (!fechaISO) return "Sin fecha";

  const fecha = new Date(fechaISO);
  const hora = fecha.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const fechaSinHora = new Date(fecha);
  fechaSinHora.setHours(0, 0, 0, 0);

  if (fechaSinHora.getTime() === hoy.getTime()) return `Hoy, ${hora}`;
  if (fechaSinHora.getTime() === manana.getTime()) return `Mañana, ${hora}`;

  const fechaCorta = fecha.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${fechaCorta}, ${hora}`;
}

/** Formatea un evento del historial para mostrarlo en el modal. */
export function formatFechaHistorial(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
