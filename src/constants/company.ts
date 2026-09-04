//src/constants/company.ts
import type { VoucherPolicy } from "@/features/cotizacion/types";

export const POLITICAS_DEFAULT: VoucherPolicy[] = [
  {
    label: "Anticipo requerido",
    text: "Todo trabajo de producción comienza estrictamente con el abono del 50% de anticipo del total.",
  },
  {
    label: "Modalidades de pago",
    text: "Solo se aceptan transferencias bancarias, código QR o pago en efectivo.",
  },
  {
    label: "Tiempos de entrega",
    text: "Estipulados al confirmar el diseño final y corroborar el anticipo, sujetos a disponibilidad de máquinas.",
  },
  {
    label: "Compromiso de calidad",
    text: "Garantizamos estándares óptimos de calidad y resistencia estructural en cada capa impresa.",
  },
  {
    label: "Modificaciones",
    text: "Una vez iniciada la producción, no se aceptan modificaciones estructurales en el diseño.",
  },
  {
    label: "Validez",
    text: "La presente cotización tiene vigencia exclusiva de 7 días calendario a partir de su emisión.",
  },
];

// TODO: reemplazar por datos reales cargados desde el módulo "Mi Empresa" (Supabase)
export const EMPRESA_DEFAULT = {
  nombre: "MAKERWOLF",
  tagline: "IMPRESIÓN 3D",
  logoUri: undefined as string | undefined,
  sitioWeb: "https://www.wolfbol.com",
  validezDias: 7,
  politicas: POLITICAS_DEFAULT,
};
