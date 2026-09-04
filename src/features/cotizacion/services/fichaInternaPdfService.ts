//src/features/cotizacion/services/fichaInternaPdfService.ts
import { generarPdfDesdeHtml } from "@/services/pdf/pdfGenerator";
import type { FichaInternaData } from "../types";
import { buildFichaInternaHtml } from "../utils/fichaInternaTemplate";

interface GenerarFichaInternaOpciones {
  fileName?: string;
  compartir?: boolean;
}

export async function generarFichaInternaPdf(
  data: FichaInternaData,
  opciones: GenerarFichaInternaOpciones = {},
): Promise<string> {
  const html = buildFichaInternaHtml(data);
  return generarPdfDesdeHtml(html, {
    fileName: opciones.fileName ?? `ficha-interna-${Date.now()}.pdf`,
    compartir: opciones.compartir,
    dialogTitle: "Compartir ficha interna",
  });
}
