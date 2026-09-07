// src/utils/formSanitizers.ts
export function sanitizeInteger(value: string, maxVal?: number): string {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10);
  if (maxVal !== undefined && num > maxVal) return String(maxVal);
  return String(num);
}

export function sanitizeDecimal(value: string): string {
  let clean = value.replace(/[^0-9.]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return clean;
}