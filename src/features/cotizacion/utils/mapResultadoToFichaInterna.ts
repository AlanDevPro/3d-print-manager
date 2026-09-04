// src/features/cotizacion/utils/mapResultadoToFichaInterna.ts
import { EMPRESA_DEFAULT } from "@/constants/company";
import type {
  EspecificacionesTecnicas,
  FichaInternaData,
  ResultadoCotizacion,
} from "../types";
import { formatDuracion } from "./formatDuracion";

interface MapOpciones {
  cantidad: number;
  especificaciones: EspecificacionesTecnicas;
  empresa?: typeof EMPRESA_DEFAULT;
}

export function mapResultadoToFichaInterna(
  resultado: ResultadoCotizacion,
  { cantidad, especificaciones, empresa = EMPRESA_DEFAULT }: MapOpciones,
): FichaInternaData {
  const { desglose } = resultado;

  const pctUtilidad =
    resultado.margen_ganancia_aplicado_pct ?? desglose.porcentaje_utilidad ?? 0;

  const tiempoImpresionMinTotal =
    especificaciones.tiempoImpresionHoras * 60 +
    especificaciones.tiempoImpresionMinutos;

  const conceptos: FichaInternaData["conceptos"] = [
    {
      label: "Material directo (filamento)",
      value: desglose.material_directo ?? 0,
      variant: "normal",
    },
    {
      label: `Operación · tasa ${desglose.tasa_hora_hombre?.toFixed(2) ?? "0.00"} Bs/h, amortizada entre ${cantidad} pzs`,
      value: desglose.operacion_preparacion ?? 0,
      variant: "normal",
    },
    {
      label: "Depreciación de máquina",
      value: desglose.depreciacion_maquina ?? 0,
      variant: "normal",
    },
    {
      label: "Energía",
      value: desglose.energia ?? 0,
      variant: "normal",
    },
    {
      label: "Subtotal operativo",
      value: desglose.subtotal_operativo ?? 0,
      variant: "subtotal",
    },
    {
      label: `Fondo de riesgo (${especificaciones.porcentajeRiesgo}%)`,
      value: desglose.fondo_riesgo ?? 0,
      variant: "danger",
    },
    {
      label: "Costo total por pieza",
      value: desglose.costo_total_pieza ?? 0,
      variant: "total",
    },
    {
      label: `Utilidad proyectada (${pctUtilidad.toFixed(1)}%)`,
      value: desglose.utilidad_pieza ?? 0,
      variant: "success",
    },
  ];

  if (
    especificaciones.personalizado &&
    especificaciones.precioPersonalizacion
  ) {
    conceptos.push({
      label: "Trabajo de personalización",
      value: especificaciones.precioPersonalizacion,
      variant: "normal",
    });
  }

  return {
    companyName: empresa.nombre,
    confidentialLabel: "DOCUMENTO CONFIDENCIAL",
    documentTitle: "Ficha Técnica de Costos",
    generatedDateLabel: new Date().toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    productImageUri: especificaciones.imagenUri,
    infoItems: [
      {
        label: "CANTIDAD",
        value: `${cantidad} ${cantidad === 1 ? "pz" : "pzs"}`,
      },
      {
        label: "MATERIAL",
        value: especificaciones.materialColor
          ? `${especificaciones.materialNombre} - ${especificaciones.materialColor}`
          : especificaciones.materialNombre,
      },
      {
        label: "PESO / PZ",
        value: `${especificaciones.pesoGramos} g`,
      },
      {
        label: "IMPRESORA",
        value: especificaciones.impresoraNombre,
      },
      {
        label: "TIEMPO IMPRESIÓN / PZ",
        value: formatDuracion(tiempoImpresionMinTotal),
      },
    ],
    especificaciones,
    conceptos,
    precioPorPieza: resultado.precio_por_pieza ?? 0,
    totalProyecto: resultado.precio_final ?? 0,
    notaPie:
      "Impuestos no desglosados. Jornada laboral considerada: 8 h por día. Consumo energético ajustado por factor de uso real.",
    footerNote: "Documento de uso interno",
    websiteUrl: empresa.sitioWeb,
    currencySymbol: "Bs",
  };
}
