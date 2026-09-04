import type { Empresa } from "@/types/database";
import { EMPRESA_VACIA, type EmpresaInfo } from "../types";

export function mapDbToEmpresa(db: Empresa | null): EmpresaInfo {
  if (!db) return EMPRESA_VACIA;
  return {
    id: db.id,
    logoUrl: db.logo_url,
    nombreComercial: db.nombre_comercial ?? "JEDD3DLAB",
    nit: db.nit ?? "",
    razonSocial: db.razon_social ?? "",
    direccionFiscal: db.direccion_fiscal ?? "",
    ciudad: db.ciudad ?? "Sucre, Chuquisaca",
    whatsapp: db.whatsapp ?? "+591 76688760",
    instagram: db.instagram ?? "@jedd3dlab",
    facebook: db.facebook ?? "",
    sitioWeb: db.sitio_web ?? "",
    garantia: db.garantia ?? "",
  };
}

export function mapEmpresaToDb(
  userId: string | null,
  info: EmpresaInfo,
): Partial<Empresa> & { es_singleton: boolean } {
  return {
    ...(info.id ? { id: info.id } : {}),
    creado_por: userId ?? undefined,
    logo_url: info.logoUrl,
    nombre_comercial: info.nombreComercial,
    nit: info.nit,
    razon_social: info.razonSocial,
    direccion_fiscal: info.direccionFiscal,
    ciudad: info.ciudad,
    whatsapp: info.whatsapp,
    instagram: info.instagram,
    facebook: info.facebook,
    sitio_web: info.sitioWeb,
    garantia: info.garantia,
    es_singleton: true,
  };
}
