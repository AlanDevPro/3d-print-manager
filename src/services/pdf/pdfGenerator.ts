// src/services/pdf/pdfGenerator.ts

import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface GenerarPdfOpciones {
  fileName?: string;
  compartir?: boolean;
  dialogTitle?: string;
}

/**
 * Convierte una URL remota de imagen (HTTP/HTTPS) a un String Base64 Data URI.
 * Esto resuelve el problema de renderizado bloqueado o fallido en motores de impresión nativos.
 */
export async function urlToBase64(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (err) => {
        console.error("❌ [pdfGenerator] Error en FileReader:", err);
        reject(err);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(
      "❌ [pdfGenerator] Error convirtiendo imagen a Base64:",
      error,
    );
    return null;
  }
}

/**
 * Escanea el HTML recibido, busca las etiquetas <img src="..."> con URLs remotas,
 * las descarga y las reemplaza por su equivalente Data URI en Base64.
 */
export async function prepararHtmlConImagenesBase64(
  html: string,
): Promise<string> {
  if (!html) return html;

  // Regex para detectar atributos src con protocolo http/https
  const regexImgSrc = /src=["'](https?:\/\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  const urlsUnicas = new Set<string>();

  while ((match = regexImgSrc.exec(html)) !== null) {
    if (match[1]) {
      urlsUnicas.add(match[1]);
    }
  }

  if (urlsUnicas.size === 0) {
    return html;
  }

  let htmlProcesado = html;

  for (const url of Array.from(urlsUnicas)) {
    console.log(
      "⏳ [pdfGenerator] Procesando e inyectando imagen Base64 para:",
      url,
    );
    const base64 = await urlToBase64(url);
    if (base64) {
      // Reemplaza todas las ocurrencias de esta URL por la cadena Base64
      htmlProcesado = htmlProcesado.split(url).join(base64);
    }
  }

  return htmlProcesado;
}

/**
 * Genera un archivo PDF a partir del HTML entregado, asegurando que las imágenes
 * externas queden incrustadas sincrónicamente en Base64.
 */
export async function generarPdfDesdeHtml(
  html: string,
  opciones: GenerarPdfOpciones = {},
): Promise<string> {
  const {
    fileName = `Cotizacion_${Date.now()}.pdf`,
    compartir = false,
    dialogTitle = "Compartir documento",
  } = opciones;

  console.log(
    "⏳ [pdfGenerator] Generando PDF. Longitud HTML original:",
    html?.length ?? 0,
  );

  // 1. Convertir imágenes remotas (QR, logos) a Base64 antes de imprimir
  const htmlSanetizado = await prepararHtmlConImagenesBase64(html);

  let tempUri: string;
  try {
    const resultado = await Print.printToFileAsync({
      html: htmlSanetizado,
      base64: false,
    });
    tempUri = resultado.uri;
    console.log("✅ [pdfGenerator] PDF temporal creado en:", tempUri);
  } catch (e) {
    console.error("❌ [pdfGenerator] Falló Print.printToFileAsync:", e);
    throw e;
  }

  let targetFile: File;
  try {
    const tempFile = new File(tempUri);
    const targetDir = Paths.document;
    targetFile = new File(targetDir, fileName);

    if (targetFile.exists) {
      console.log(
        "⚠️ [pdfGenerator] El archivo destino ya existe. Eliminando archivo previo:",
        targetFile.uri,
      );
      targetFile.delete();
    }

    await tempFile.move(targetFile);
    console.log(
      "✅ [pdfGenerator] PDF movido a destino final:",
      targetFile.uri,
    );
  } catch (e) {
    console.error(
      "❌ [pdfGenerator] Falló mover el PDF al directorio persistente:",
      e,
    );
    throw e;
  }

  if (compartir) {
    try {
      const disponible = await Sharing.isAvailableAsync();
      console.log("📤 [pdfGenerator] Sharing disponible:", disponible);
      if (disponible) {
        await Sharing.shareAsync(targetFile.uri, {
          mimeType: "application/pdf",
          dialogTitle,
          UTI: "com.adobe.pdf",
        });
        console.log(
          "✅ [pdfGenerator] Hoja de compartir abierta correctamente.",
        );
      } else {
        console.warn(
          "⚠️ [pdfGenerator] Sharing no disponible en este dispositivo.",
        );
      }
    } catch (e) {
      console.error("❌ [pdfGenerator] Falló Sharing.shareAsync:", e);
      throw e;
    }
  }

  return targetFile.uri;
}

/**
 * Función de alto nivel para enviar el comprobante o cotización al cliente vía WhatsApp/Nativo.
 */
export async function compartirVoucherCliente({
  html,
  telefonoCliente,
  nombreCliente,
  nombrePieza,
}: {
  html: string;
  telefonoCliente?: string;
  nombreCliente?: string;
  nombrePieza?: string;
}): Promise<string> {
  console.log("🚀 [pdfGenerator] compartirVoucherCliente iniciado con:", {
    telefonoCliente,
    nombreCliente,
    nombrePieza,
    longitudHtml: html?.length ?? 0,
  });

  const nombreLimpio = nombrePieza
    ? nombrePieza.replace(/[^a-zA-Z0-9_-]/g, "_")
    : "Pieza";
  const fileName = `Cotizacion_${nombreLimpio}_${Date.now()}.pdf`;

  // 1. Generar el archivo PDF en almacenamiento local con resolución Base64 de imágenes
  const fileUri = await generarPdfDesdeHtml(html, {
    fileName,
    compartir: false,
  });

  // 2. Abrir el menú nativo de compartir hacia WhatsApp o cualquier app de mensajería
  const disponible = await Sharing.isAvailableAsync();
  if (disponible) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: `Enviar Cotización a ${nombreCliente || "Cliente"}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    console.warn(
      "⚠️ [pdfGenerator] La función de compartir no está disponible.",
    );
  }

  return fileUri;
}
