// src/features/cotizacion/utils/validarCotizacionForm.ts
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";

type FormularioCotizacion = UseCotizacionReturn["form"];
type PiezaCotizacion = UseCotizacionReturn["piezas"][number];

export function validarCotizacionForm(
  form: FormularioCotizacion,
  piezas: PiezaCotizacion[],
  esPersonalizado: boolean,
): string | null {
  if (form.telefono_cliente && form.telefono_cliente.trim().length > 0) {
    const phoneDigits = form.telefono_cliente.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return "El teléfono de WhatsApp debe tener un número válido (mínimo 7 dígitos).";
    }
  }

  for (let i = 0; i < piezas.length; i++) {
    const p = piezas[i];
    const nombrePieza = p.nombre_pieza ? `"${p.nombre_pieza}"` : `Pieza ${i + 1}`;

    const peso = parseFloat(p.peso_gramos || "0");
    if (isNaN(peso) || peso <= 0) {
      return `El peso en gramos para ${nombrePieza} debe ser mayor a 0.`;
    }

    const cantidad = parseInt(p.cantidad || "0", 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      return `La cantidad de unidades para ${nombrePieza} debe ser al menos 1.`;
    }

    const mins = parseInt(p.tiempo_impresion_minutos || "0", 10);
    if (isNaN(mins) || mins < 0 || mins >= 60) {
      return `Los minutos de impresión para ${nombrePieza} deben estar entre 0 y 59.`;
    }

    const horas = parseInt(p.tiempo_impresion_horas || "0", 10);
    if ((isNaN(horas) || horas === 0) && mins === 0) {
      return `Ingresa un tiempo de impresión válido para ${nombrePieza}.`;
    }
  }

  const riesgo = parseFloat(form.porcentaje_riesgo || "0");
  if (isNaN(riesgo) || riesgo < 0 || riesgo > 99) {
    return "El porcentaje de riesgo debe estar entre 0% y 99% (máximo 2 dígitos).";
  }

  if (esPersonalizado) {
    const precioPers = parseFloat(form.precio_personalizacion || "0");
    if (isNaN(precioPers) || precioPers < 0) {
      return "El costo de personalización no puede ser negativo.";
    }
  }

  return null;
}