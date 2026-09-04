// src/features/pedidos/services/recordatorioPdfService.ts

import {
    compartirVoucherCliente
} from "@/services/pdf/pdfGenerator";
import { Pedido } from "../types";
import { mapPedidoToRecordatorioPdfData } from "../utils/mapRecordatorioData";
import { generateRecordatorioPdfHtml } from "../utils/recordatorioPdfTemplate";

export async function generarYCompartirRecordatorioPdf(
  pedido: Pedido,
  qrUrl?: string,
): Promise<string> {
  const pdfData = mapPedidoToRecordatorioPdfData(pedido, qrUrl);
  const html = generateRecordatorioPdfHtml(pdfData);

  return await compartirVoucherCliente({
    html,
    telefonoCliente: pedido.cliente.telefono,
    nombreCliente: pedido.cliente.nombre,
    nombrePieza: pedido.pieza,
  });
}
