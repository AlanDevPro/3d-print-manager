// src/features/pedidos/utils/mapRecordatorioData.ts

import { Pedido } from "../types";
import { RecordatorioPdfData } from "./recordatorioPdfTemplate";

export function mapPedidoToRecordatorioPdfData(
  pedido: Pedido,
  qrUrlFallback?: string,
): RecordatorioPdfData {
  const montoTotal = pedido.pago.total;
  const montoAnticipo =
    (montoTotal * (pedido.pago.anticipoPorcentaje || 0)) / 100;
  const saldoPendiente = Math.max(0, montoTotal - pedido.pago.montoCobrado);

  const fechaActual = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    codigoPedido: pedido.codigo,
    clienteNombre: pedido.cliente.nombre,
    piezaDescripcion: pedido.pieza,
    montoTotal,
    montoAnticipo,
    saldoPendiente,
    qrUrl: qrUrlFallback,
    fechaEmision: fechaActual,
  };
}
