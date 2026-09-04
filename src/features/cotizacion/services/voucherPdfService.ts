// src/features/cotizacion/services/voucherPdfService.ts
import { generarPdfDesdeHtml } from "@/services/pdf/pdfGenerator";
import type { VoucherData } from "../types";
import { buildVoucherHtml } from "../utils/voucherTemplate";

interface GenerarVoucherOpciones {
  fileName?: string;
  compartir?: boolean;
}

export async function generarVoucherPdf(
  data: VoucherData,
  opciones: GenerarVoucherOpciones = {},
): Promise<string> {
  const html = buildVoucherHtml(data);
  return generarPdfDesdeHtml(html, {
    fileName: opciones.fileName ?? `voucher-${Date.now()}.pdf`,
    compartir: opciones.compartir,
    dialogTitle: "Compartir cotización",
  });
}
