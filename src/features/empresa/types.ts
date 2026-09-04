export interface EmpresaInfo {
  id?: string;
  logoUrl: string | null;
  nombreComercial: string;
  nit: string;
  razonSocial: string;
  direccionFiscal: string;
  ciudad: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  sitioWeb: string;
  garantia: string;
}

export const EMPRESA_VACIA: EmpresaInfo = {
  logoUrl: null,
  nombreComercial: "JEDD3DLAB",
  nit: "",
  razonSocial: "",
  direccionFiscal: "",
  ciudad: "Sucre, Chuquisaca",
  whatsapp: "+591 76688760",
  instagram: "@jedd3dlab",
  facebook: "",
  sitioWeb: "",
  garantia:
    "Ofrecemos 15 días de garantía por defectos de impresión atribuibles al taller. No cubre daños por mal uso, exposición al sol o cargas mecánicas fuera de especificación.",
};
