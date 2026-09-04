//src/features/cotizacion/utils/fichaInternaTemplate.ts
import type { FichaInternaConcepto, FichaInternaData } from "../types";

const COLOR_BG = "#F3F4F6";
const COLOR_DARK = "#111827";
const COLOR_GRAY_TEXT = "#6B7280";
const COLOR_BORDER = "#E5E7EB";
const COLOR_DANGER = "#B91C3C";
const COLOR_SUCCESS = "#15803D";

function formatMoney(value: number, currency: string): string {
  const safe = isNaN(value) ? 0 : value;
  return `${safe.toFixed(2).replace(".", ",")} ${currency}`;
}

function conceptoColor(variant: FichaInternaConcepto["variant"]): string {
  switch (variant) {
    case "danger":
      return COLOR_DANGER;
    case "success":
      return COLOR_SUCCESS;
    default:
      return COLOR_DARK;
  }
}

function renderConcepto(c: FichaInternaConcepto, currency: string): string {
  const color = conceptoColor(c.variant);
  const isBold = c.variant === "subtotal" || c.variant === "total";
  const topBorder =
    c.variant === "total" ? `border-top: 2px solid ${COLOR_DARK};` : "";

  return `
    <tr style="${topBorder}">
      <td class="conceptoLabel" style="color:${color}; font-weight:${isBold ? 700 : 400};">
        ${c.label}
      </td>
      <td class="conceptoValue" style="color:${color}; font-weight:${isBold ? 700 : 400};">
        ${formatMoney(c.value, currency)}
      </td>
    </tr>
  `;
}

function renderInfoItem(label: string, value: string): string {
  return `
    <div class="infoCard">
      <div class="infoLabel">${label}</div>
      <div class="infoValue">${value}</div>
    </div>
  `;
}

export function buildFichaInternaHtml(data: FichaInternaData): string {
  const {
    companyName,
    confidentialLabel,
    documentTitle,
    generatedDateLabel,
    productImageUri,
    infoItems,
    conceptos,
    precioPorPieza,
    totalProyecto,
    notaPie,
    footerNote,
    websiteUrl,
    currencySymbol,
  } = data;

  const infoItemsHtml = infoItems
    .map((item) => renderInfoItem(item.label, item.value))
    .join("");

  const conceptosHtml = conceptos
    .map((c) => renderConcepto(c, currencySymbol))
    .join("");

  const imageBoxHtml = productImageUri
    ? `<img class="thumbImage" src="${productImageUri}" />`
    : `<div class="thumbPlaceholder">Sin<br/>imagen</div>`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, Helvetica, Arial, sans-serif;
        background: ${COLOR_BG};
        color: ${COLOR_DARK};
        margin: 0;
        padding: 28px;
      }
      .sheet {
        background: #FFFFFF;
        border-radius: 14px;
        padding: 28px 32px;
      }
      .headerRow {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .confidentialBadge {
        display: inline-block;
        background: ${COLOR_DARK};
        color: #FFFFFF;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 5px 10px;
        border-radius: 999px;
        margin-bottom: 12px;
      }
      .title {
        font-size: 24px;
        font-weight: 800;
        margin: 0 0 4px;
      }
      .subtitle {
        color: ${COLOR_GRAY_TEXT};
        font-size: 12px;
      }
      .thumbImage {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        object-fit: cover;
      }
      .thumbPlaceholder {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        background: ${COLOR_BG};
        color: ${COLOR_GRAY_TEXT};
        font-size: 9px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1.3;
      }
      .dashedDivider {
        border-top: 1px dashed ${COLOR_BORDER};
        margin: 18px 0;
      }
      .infoRow {
        display: flex;
        gap: 10px;
      }
      .infoCard {
        flex: 1;
        border: 1px solid ${COLOR_BORDER};
        border-radius: 8px;
        padding: 10px 12px;
      }
      .infoLabel {
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: ${COLOR_GRAY_TEXT};
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .infoValue {
        font-size: 13px;
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
        border-radius: 8px;
        overflow: hidden;
      }
      thead tr { background: ${COLOR_DARK}; }
      thead th {
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 10px 14px;
        text-align: left;
      }
      thead th.thRight { text-align: right; }
      tbody td {
        padding: 11px 14px;
        font-size: 12px;
        border-bottom: 1px dashed ${COLOR_BORDER};
      }
      .conceptoLabel { text-align: left; }
      .conceptoValue { text-align: right; }
      .totalsRow {
        display: flex;
        gap: 14px;
        margin-top: 20px;
      }
      .totalBox {
        flex: 1;
        border-radius: 8px;
        padding: 14px 16px;
      }
      .totalBoxNeutral {
        border: 1px solid ${COLOR_DARK};
      }
      .totalBoxAccent {
        border: 1px solid ${COLOR_DANGER};
      }
      .totalLabel {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: ${COLOR_GRAY_TEXT};
        margin-bottom: 4px;
      }
      .totalValueNeutral {
        font-size: 20px;
        font-weight: 800;
        color: ${COLOR_DARK};
      }
      .totalValueAccent {
        font-size: 20px;
        font-weight: 800;
        color: ${COLOR_DANGER};
      }
      .notaPie {
        font-size: 9.5px;
        color: ${COLOR_GRAY_TEXT};
        margin-top: 14px;
      }
      .footer {
        text-align: center;
        margin-top: 28px;
        color: ${COLOR_GRAY_TEXT};
        font-size: 10.5px;
      }
      .footerLink {
        margin-top: 3px;
        font-size: 9.5px;
        color: ${COLOR_GRAY_TEXT};
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="headerRow">
        <div>
          <div class="confidentialBadge">${confidentialLabel}</div>
          <div class="title">${documentTitle}</div>
          <div class="subtitle">Generado el: ${generatedDateLabel}</div>
        </div>
        ${imageBoxHtml}
      </div>

      <div class="dashedDivider"></div>

      <div class="infoRow">
        ${infoItemsHtml}
      </div>

      <table>
        <thead>
          <tr>
            <th>CONCEPTO DE COSTO (POR PIEZA)</th>
            <th class="thRight">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${conceptosHtml}
        </tbody>
      </table>

      <div class="totalsRow">
        <div class="totalBox totalBoxNeutral">
          <div class="totalLabel">PRECIO POR PIEZA</div>
          <div class="totalValueNeutral">${formatMoney(precioPorPieza, currencySymbol)}</div>
        </div>
        <div class="totalBox totalBoxAccent">
          <div class="totalLabel">TOTAL DEL PROYECTO</div>
          <div class="totalValueAccent">${formatMoney(totalProyecto, currencySymbol)}</div>
        </div>
      </div>

      ${notaPie ? `<div class="notaPie">${notaPie}</div>` : ""}

      <div class="footer">
        ${companyName ? `Documento de uso interno · ${companyName}` : footerNote}
        ${websiteUrl ? `<div class="footerLink">${websiteUrl}</div>` : ""}
      </div>
    </div>
  </body>
  </html>
  `;
}
