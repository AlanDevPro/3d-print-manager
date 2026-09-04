// src/features/cotizacion/utils/buildEspecificaciones.ts

import type {
  CotizarFormState,
  EspecificacionesTecnicas,
  Filamento,
  Impresora,
} from "../types";

export function buildEspecificaciones(
  form: CotizarFormState,
  filamentos: Filamento[] = [],
  impresoras: Impresora[] = [],
): EspecificacionesTecnicas {
  const listaFilamentos = Array.isArray(filamentos) ? filamentos : [];
  const listaImpresoras = Array.isArray(impresoras) ? impresoras : [];

  // Búsqueda usando el campo correcto: filamento_id
  const filamento = form?.filamento_id
    ? listaFilamentos.find((f) => String(f.id) === String(form.filamento_id))
    : undefined;

  const impresora = form?.impresora_id
    ? listaImpresoras.find((i) => String(i.id) === String(form.impresora_id))
    : undefined;

  // Construye un nombre representativo para el filamento (Ej: "PLA - eSUN")
  const materialNombre = filamento
    ? `${filamento.material}${filamento.marca ? ` - ${filamento.marca}` : ""}`
    : "—";

  // Construye el nombre de la impresora (marca + modelo)
  const impresoraNombre = impresora
    ? `${impresora.marca} ${impresora.modelo}`.trim()
    : "—";

  return {
    materialNombre,
    materialColor: filamento?.color ?? undefined,
    impresoraNombre,
    pesoGramos: Number(form?.peso_gramos) || 0,
    tiempoImpresionHoras: Number(form?.tiempo_impresion_horas) || 0,
    tiempoImpresionMinutos: Number(form?.tiempo_impresion_minutos) || 0,
    porcentajeRiesgo: Number(form?.porcentaje_riesgo) || 0,
    personalizado: Number(form?.precio_personalizacion) > 0,
    precioPersonalizacion: Number(form?.precio_personalizacion) || undefined,
    imagenUri: form?.imagen_referencia || undefined,
  };
}
