// src/features/cotizacion/utils/mapResultadoToVoucher.ts

import { EMPRESA_DEFAULT } from "@/constants/company";
import type { EmpresaInfo } from "@/features/empresa/types";
import type {
  EspecificacionesTecnicas,
  ResultadoCotizacion,
  VoucherData,
  VoucherPolicy,
} from "../types";

interface MapOpciones {
  cantidad: number;
  especificaciones?: Pick<
    EspecificacionesTecnicas,
    "materialNombre" | "materialColor" | "imagenUri"
  >;
  descripcionItem?: string;
  /**
   * Datos de la empresa obtenidos desde la base de datos (EmpresaContext / Supabase).
   * Si no se proveen o hay campos vacíos, se usarán los valores por defecto.
   */
  empresa?: Partial<EmpresaInfo> | null;
}

/**
 * Normaliza las políticas a mostrar en el voucher.
 * Siempre devuelve VoucherPolicy[], sin importar si la fuente
 * (BD o valores por defecto) es un string simple o ya viene estructurada.
 */
function resolvePolicies(empresaGarantia?: string | null): VoucherPolicy[] {
  if (empresaGarantia && empresaGarantia.trim() !== "") {
    return [{ label: "Garantía", text: empresaGarantia }];
  }

  // Fallback: EMPRESA_DEFAULT.politicas puede ser string[] o VoucherPolicy[];
  // normalizamos asegurando el contrato de VoucherPolicy.
  return (EMPRESA_DEFAULT.politicas as (string | VoucherPolicy)[]).map(
    (p): VoucherPolicy =>
      typeof p === "string" ? { label: "Garantía", text: p } : p,
  );
}

export function mapResultadoToVoucher(
  resultado: ResultadoCotizacion,
  {
    cantidad,
    especificaciones,
    descripcionItem = "Pieza impresa en 3D según especificación",
    empresa,
  }: MapOpciones,
): VoucherData {
  const precioUnitario = resultado.precio_por_pieza ?? 0;
  const precioFinal = resultado.precio_final ?? precioUnitario * cantidad;

  // Resolvemos la información de la empresa dando prioridad a los datos dinámicos de Supabase
  const companyName =
    empresa?.nombreComercial && empresa.nombreComercial.trim() !== ""
      ? empresa.nombreComercial
      : EMPRESA_DEFAULT.nombre;

  const logoUri = empresa?.logoUrl ?? EMPRESA_DEFAULT.logoUri;

  const websiteUrl =
    empresa?.sitioWeb && empresa.sitioWeb.trim() !== ""
      ? empresa.sitioWeb
      : EMPRESA_DEFAULT.sitioWeb;

  const policies = resolvePolicies(empresa?.garantia);

  return {
    companyName,
    companyTagline: EMPRESA_DEFAULT.tagline,
    documentTitle: "COTIZACIÓN COMERCIAL",
    issueDateLabel: new Date().toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    validityLabel: `Cotización válida por ${EMPRESA_DEFAULT.validezDias} días`,
    logoUri,
    productImageUri: especificaciones?.imagenUri,
    unitPriceLabel: "PRECIO UNITARIO",
    unitPrice: precioUnitario,
    // Especificaciones visibles para el cliente
    especificaciones: {
      materialNombre: especificaciones?.materialNombre ?? "—",
      materialColor: especificaciones?.materialColor,
    },
    items: [
      {
        description: descripcionItem,
        quantity: cantidad,
        unitPrice: precioUnitario,
        total: precioFinal,
      },
    ],
    policies,
    footerNote:
      "Gracias por confiar en nuestros servicios. Calidad y precisión en cada proyecto.",
    websiteUrl,
    currencySymbol: "Bs",
  };
}
