// src/features/pedidos/utils/formato.ts

export function formatBs(valor: number): string {
  return `Bs ${(valor ?? 0).toFixed(2)}`;
}

/** Código legible del pedido a partir del correlativo numérico (SERIAL). */
export function formatCodigoPedido(codigoPedido: number | string | null | undefined): string {
  if (codigoPedido === null || codigoPedido === undefined) return "PED-0000";
  const num = Number(codigoPedido);
  if (isNaN(num)) return `PED-${codigoPedido}`;
  return `PED-${1000 + num}`;
}

/** Formatea una fecha ISO a texto legible (ej: "12 sep. 2026"). */
export function formatFechaEntrega(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "Sin fecha";

  try {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return "Fecha inválida";

    return new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(fecha);
  } catch {
    return "Fecha inválida";
  }
}