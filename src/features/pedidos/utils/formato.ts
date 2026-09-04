// src/features/pedidos/utils/formato.ts
// Si ya tienes un helper global de moneda en src/utils/, importa ese en su
// lugar y borra este archivo — se deja aquí para que el módulo funcione
// de forma autocontenida.

export function formatBs(valor: number): string {
  return `Bs ${valor.toFixed(2)}`;
}

/** Código legible del pedido a partir del correlativo numérico (SERIAL). */
export function formatCodigoPedido(codigoPedido: number): string {
  return `PED-${1000 + codigoPedido}`;
}
