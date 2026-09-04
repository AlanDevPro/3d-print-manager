// src/components/ui/parametros/PdfSection.tsx
import React from "react";
import {
    ParametroCampoNumero,
    ParametroCampoSwitch,
    ParametroCampoTexto,
} from "../ParametroCampo";

interface PdfValores {
  encabezadoPdf?: string;
  piePaginaPdf?: string;
  mostrarDesgloseTecnicoCliente?: boolean;
  diasValidezCotizacion?: number;
}

interface PdfSectionProps {
  pdf: PdfValores;
  onChange: (cambios: Partial<PdfValores>) => void;
}

export function PdfSection({ pdf, onChange }: PdfSectionProps) {
  return (
    <>
      <ParametroCampoTexto
        label="Encabezado en PDF"
        value={pdf.encabezadoPdf ?? ""}
        onChange={(encabezadoPdf) => onChange({ encabezadoPdf })}
        placeholder="Ej: Taller 3D Sucre"
      />
      <ParametroCampoTexto
        label="Pie de Página en PDF"
        value={pdf.piePaginaPdf ?? ""}
        onChange={(piePaginaPdf) => onChange({ piePaginaPdf })}
        placeholder="Ej: Gracias por su preferencia"
        multiline
      />
      <ParametroCampoSwitch
        label="Mostrar Desglose Técnico al Cliente"
        value={pdf.mostrarDesgloseTecnicoCliente ?? false}
        onChange={(mostrarDesgloseTecnicoCliente) =>
          onChange({ mostrarDesgloseTecnicoCliente })
        }
      />
      <ParametroCampoNumero
        label="Días de Validez de la Cotización"
        value={pdf.diasValidezCotizacion ?? 15}
        onChange={(diasValidezCotizacion) =>
          onChange({ diasValidezCotizacion })
        }
        sufijo="días"
        keyboardType="numeric"
      />
    </>
  );
}
