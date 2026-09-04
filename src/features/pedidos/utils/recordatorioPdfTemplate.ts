// src/features/pedidos/utils/recordatorioPdfTemplate.ts

import { urlToBase64 } from "@/services/pdf/pdfGenerator";

export interface RecordatorioPdfData {
  codigoPedido: string;
  clienteNombre: string;
  piezaDescripcion: string;
  montoTotal: number;
  montoAnticipo: number;
  saldoPendiente: number;
  qrUrl?: string;
  fechaEmision: string;
}

/**
 * Genera la plantilla HTML para el Recordatorio de Pago.
 * Convierte de manera asíncrona la URL remota del QR a un Data URI en Base64
 * para asegurar un renderizado inmediato e infalible en el motor de impresión nativo.
 */
export async function generateRecordatorioPdfHtml(
  data: RecordatorioPdfData,
): Promise<string> {
  let qrBase64: string | null = null;

  // Si se proporciona una URL remota del QR, la convertimos primero a Base64
  if (data.qrUrl) {
    qrBase64 = await urlToBase64(data.qrUrl);
  }

  const qrSection = qrBase64
    ? `<div class="qr-container">
        <p class="qr-title">Escanea el código QR para realizar el pago por transferencia/SQR:</p>
        <img src="${qrBase64}" alt="Código QR de Pago" class="qr-image" />
       </div>`
    : data.qrUrl
      ? `<div class="qr-container">
        <p class="qr-title">Escanea el código QR para realizar el pago por transferencia/SQR:</p>
        <img src="${data.qrUrl}" alt="Código QR de Pago" class="qr-image" />
       </div>`
      : `<div class="qr-placeholder">
        <p>Contacta con el comercio para obtener los datos directos de transferencia bancaria.</p>
       </div>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Cobro - ${data.codigoPedido}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1e293b; padding: 32px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .brand span { color: #2563eb; }
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 16px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .doc-title p { font-size: 12px; color: #94a3b8; }
    
    .client-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .client-card p { margin-bottom: 4px; color: #475569; }
    .client-card p strong { color: #0f172a; }

    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .details-table th { background-color: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; }

    .summary-card { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #334155; }
    .summary-row.total { border-top: 1px dashed #93c5fd; padding-top: 10px; margin-top: 4px; font-size: 16px; font-weight: 700; color: #1e3a8a; }

    .qr-container { text-align: center; margin-top: 24px; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 8px; page-break-inside: avoid; }
    .qr-title { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 12px; }
    .qr-image { width: 180px; height: 180px; object-fit: contain; margin: 0 auto; display: block; }
    .qr-placeholder { text-align: center; font-style: italic; color: #64748b; margin-top: 20px; padding: 12px; }

    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">JEDD3D<span>LAB</span></div>
    <div class="doc-title">
      <h1>Recordatorio de Pago</h1>
      <p>Pedido: <strong>${data.codigoPedido}</strong></p>
    </div>
  </div>

  <div class="client-card">
    <p><strong>Cliente:</strong> ${data.clienteNombre}</p>
    <p><strong>Fecha de Emisión:</strong> ${data.fechaEmision}</p>
  </div>

  <table class="details-table">
    <thead>
      <tr>
        <th>Descripción de la Pieza / Servicio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${data.piezaDescripcion}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary-card">
    <div class="summary-row">
      <span>Monto Total del Pedido:</span>
      <span>Bs ${data.montoTotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Anticipo Requerido / Pagado:</span>
      <span>Bs ${data.montoAnticipo.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Saldo Pendiente a Cancelar:</span>
      <span>Bs ${data.saldoPendiente.toFixed(2)}</span>
    </div>
  </div>

  ${qrSection}

  <div class="footer">
    <p>Gracias por tu preferencia. Si ya realizaste la transferencia, por favor envía tu comprobante.</p>
  </div>
</body>
</html>
  `;
}
