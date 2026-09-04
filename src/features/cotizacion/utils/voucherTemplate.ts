// src/features/cotizacion/utils/voucherTemplate.ts

import type { VoucherData, VoucherItem, VoucherPricingTier } from "../types";

const COLOR_ACCENT = "#B91C3C";
const COLOR_ACCENT_BG = "#FDEEF0";
const COLOR_DARK = "#111827";
const COLOR_GRAY_TEXT = "#6B7280";
const COLOR_BORDER = "#E5E7EB";

function formatMoney(value: number, currency: string): string {
  const safe = isNaN(value) ? 0 : value;
  return `${safe.toFixed(2).replace(".", ",")} ${currency}`;
}

function renderPricingTier(tier: VoucherPricingTier, currency: string): string {
  return `
    <div class="tierCard">
      <div class="tierLabel">${tier.label} ${tier.conditionLabel || ""}</div>
      <div class="tierPrice">${formatMoney(tier.price, currency)}</div>
      ${tier.discountLabel ? `<div class="tierDiscount">${tier.discountLabel}</div>` : ""}
    </div>
  `;
}

function renderItemRow(item: VoucherItem, currency: string): string {
  return `
    <tr>
      <td class="tdDesc">${item.description}</td>
      <td class="tdCenter">${item.quantity}</td>
      <td class="tdCenter">${formatMoney(item.unitPrice, currency)}</td>
      <td class="tdTotal">${formatMoney(item.total, currency)}</td>
    </tr>
  `;
}

export function buildVoucherHtml(data: VoucherData): string {
  const {
    companyName,
    companyTagline,
    documentTitle,
    issueDateLabel,
    validityLabel,
    logoUri,
    productImageUri,
    unitPriceLabel,
    unitPrice,
    especificaciones,
    pricingTiers = [],
    items,
    policies,
    footerNote,
    websiteUrl,
    currencySymbol,
  } = data;

  const tiersHtml = pricingTiers.length
    ? `<div class="tiersRow">${pricingTiers.map((t) => renderPricingTier(t, currencySymbol)).join("")}</div>`
    : "";

  const rowsHtml = items
    .map((item) => renderItemRow(item, currencySymbol))
    .join("");

  const productImageHtml = productImageUri
    ? `<div class="productImageContainer"><img class="productImage" src="${productImageUri}" alt="Imagen del producto" /></div>`
    : `<div class="productImagePlaceholder"><span>Sin Imagen de Referencia</span></div>`;

  const logoHtml = logoUri
    ? `<img class="logoBox" src="${logoUri}" alt="Logo" />`
    : "";

  const especificacionesHtml =
    especificaciones && especificaciones.materialNombre
      ? `
    <div class="specsRow">
      <div class="specChip">
        <span class="specChipLabel">MATERIAL</span>
        <span class="specChipValue">${especificaciones.materialNombre}</span>
      </div>
      ${
        especificaciones.materialColor
          ? `
      <div class="specChip">
        <span class="specChipLabel">COLOR</span>
        <span class="specChipValue">${especificaciones.materialColor}</span>
      </div>`
          : ""
      }
    </div>
  `
      : "";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { 
        box-sizing: border-box; 
        -webkit-print-color-adjust: exact; 
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: ${COLOR_DARK};
        padding: 24px 28px;
        margin: 0;
        background-color: #FFFFFF;
      }
      .brandLabel {
        color: ${COLOR_ACCENT};
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .headerRow {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .title {
        font-size: 26px;
        font-weight: 800;
        margin: 4px 0;
        line-height: 1.2;
      }
      .subtitle {
        color: ${COLOR_GRAY_TEXT};
        font-size: 12px;
        margin-bottom: 4px;
      }
      .issueDate {
        color: ${COLOR_GRAY_TEXT};
        font-size: 11px;
        margin-bottom: 4px;
      }
      .validity {
        color: ${COLOR_ACCENT};
        font-size: 11px;
        font-weight: 700;
      }
      .logoBox {
        width: 64px;
        height: 64px;
        max-width: 64px;
        max-height: 64px;
        border-radius: 8px;
        object-fit: contain;
        display: block;
      }
      .divider {
        height: 3px;
        background: ${COLOR_ACCENT};
        margin: 14px 0 20px;
        border-radius: 2px;
      }
      .contentRow {
        display: flex;
        gap: 20px;
        align-items: stretch;
      }
      .productImageContainer {
        width: 260px;
        height: 220px;
        min-width: 260px;
        border-radius: 10px;
        overflow: hidden;
        background: #F3F4F6;
        border: 1px solid ${COLOR_BORDER};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .productImage {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .productImagePlaceholder {
        width: 260px;
        height: 220px;
        min-width: 260px;
        border-radius: 10px;
        background: #F3F4F6;
        border: 1px dashed ${COLOR_BORDER};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${COLOR_GRAY_TEXT};
        font-size: 11px;
        font-weight: 600;
      }
      .priceSection { 
        flex: 1; 
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .sectionLabel {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        color: ${COLOR_GRAY_TEXT};
        margin-bottom: 6px;
      }
      .unitPriceBox {
        background: ${COLOR_ACCENT_BG};
        border-left: 4px solid ${COLOR_ACCENT};
        border-radius: 6px;
        padding: 12px 14px;
        margin-bottom: 10px;
      }
      .unitPriceLabel {
        color: ${COLOR_ACCENT};
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .unitPriceValue {
        font-size: 22px;
        font-weight: 800;
        margin-top: 2px;
      }
      .specsRow {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
      }
      .specChip {
        flex: 1;
        border: 1px solid ${COLOR_BORDER};
        border-radius: 6px;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        background: #FAFAFA;
      }
      .specChipLabel {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: ${COLOR_GRAY_TEXT};
        margin-bottom: 2px;
      }
      .specChipValue {
        font-size: 12px;
        font-weight: 700;
        color: ${COLOR_DARK};
      }
      .tiersRow {
        display: flex;
        gap: 8px;
      }
      .tierCard {
        flex: 1;
        border: 1px solid ${COLOR_BORDER};
        border-radius: 6px;
        padding: 8px 10px;
        background: #FAFAFA;
      }
      .tierLabel {
        font-size: 9px;
        font-weight: 700;
        color: ${COLOR_GRAY_TEXT};
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .tierPrice {
        font-size: 15px;
        font-weight: 800;
      }
      .tierDiscount {
        display: inline-block;
        margin-top: 4px;
        background: ${COLOR_ACCENT_BG};
        color: ${COLOR_ACCENT};
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
        page-break-inside: avoid;
      }
      thead tr {
        background: ${COLOR_DARK};
      }
      thead th {
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-align: left;
        padding: 8px 12px;
      }
      thead th.thCenter { text-align: center; }
      thead th.thRight { text-align: right; }
      tbody td {
        padding: 10px 12px;
        font-size: 11px;
        border-bottom: 1px solid ${COLOR_BORDER};
      }
      .tdDesc { text-align: left; }
      .tdCenter { text-align: center; }
      .tdTotal { text-align: right; font-weight: 700; }
      .policiesBox {
        background: ${COLOR_DARK};
        color: #FFFFFF;
        border-radius: 8px;
        padding: 16px 18px;
        margin-top: 24px;
        page-break-inside: avoid;
      }
      .policiesTitle {
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      .policyLine {
        font-size: 10px;
        line-height: 1.5;
        color: #E5E7EB;
        margin-bottom: 4px;
      }
      .policyLabel { font-weight: 700; color: #FFFFFF; }
      .footer {
        text-align: center;
        margin-top: 24px;
        color: ${COLOR_GRAY_TEXT};
        font-size: 10px;
        page-break-inside: avoid;
      }
      .footerLink {
        margin-top: 2px;
        font-size: 9px;
        color: ${COLOR_GRAY_TEXT};
      }
    </style>
  </head>
  <body>
    <div class="headerRow">
      <div>
        <div class="brandLabel">${companyName} · ${companyTagline}</div>
        <div class="title">${documentTitle}</div>
        <div class="subtitle">Servicios de manufactura, prototipado e impresión 3D</div>
        <div class="issueDate">Fecha de emisión: ${issueDateLabel}</div>
        ${validityLabel ? `<div class="validity">★ ${validityLabel}</div>` : ""}
      </div>
      ${logoHtml}
    </div>

    <div class="divider"></div>

    <div class="contentRow">
      ${productImageHtml}
      <div class="priceSection">
        <div>
          <div class="sectionLabel">ESTRUCTURA DE PRECIOS</div>
          <div class="unitPriceBox">
            <div class="unitPriceLabel">${unitPriceLabel}</div>
            <div class="unitPriceValue">${formatMoney(unitPrice, currencySymbol)}</div>
          </div>
          ${especificacionesHtml}
        </div>
        ${tiersHtml}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>DETALLE DEL PEDIDO</th>
          <th class="thCenter">CANTIDAD</th>
          <th class="thCenter">P. UNITARIO</th>
          <th class="thRight">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="policiesBox">
      <div class="policiesTitle">Políticas de contratación y servicio</div>
      ${policies
        .map(
          (p) =>
            `<div class="policyLine"><span class="policyLabel">${p.label}:</span> ${p.text}</div>`,
        )
        .join("")}
    </div>

    <div class="footer">
      ${footerNote}
      ${websiteUrl ? `<div class="footerLink">${websiteUrl}</div>` : ""}
    </div>
  </body>
  </html>
  `;
}
