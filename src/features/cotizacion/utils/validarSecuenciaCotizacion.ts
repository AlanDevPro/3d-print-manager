// src/features/cotizacion/utils/validarSecuenciaCotizacion.ts
import type {
    MaterialItem,
    PiezaFormState,
    ReglaMargen,
} from "@/features/cotizacion/types/formTypes";

export const MARGEN_SEGURIDAD_GRAMOS = 50;

export type PasoCotizacionId =
  | "piezas"
  | "material"
  | "impresora"
  | "riesgo"
  | "utilidad"
  | "personalizacion";

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

export interface PasoValidacion {
  id: PasoCotizacionId;
  titulo: string;
  errores: ErrorCampo[];
  completo: boolean;
  /** true si algún paso anterior está incompleto */
  bloqueado: boolean;
  /** título del paso anterior que impide continuar */
  bloqueadoPor?: string;
  /** errores del paso que lo está bloqueando */
  erroresBloqueantes: ErrorCampo[];
}

export interface EntradaValidacion {
  form: {
    filamento_id?: string;
    impresora_id?: string;
    porcentaje_riesgo?: string;
    margen_ganancia_pct?: string;
    regla_margen_id?: string;
    precio_personalizacion?: string;
    nombre_cliente?: string;
    telefono_cliente?: string;
  };
  piezas: PiezaFormState[];
  materiales: MaterialItem[];
  impresoras: { id: string; modelo?: string | null; marca?: string | null }[];
  reglasMargen: ReglaMargen[];
  esPersonalizado: boolean;
}

export interface ResultadoValidacionSecuencial {
  pasos: PasoValidacion[];
  pasosPorId: Record<PasoCotizacionId, PasoValidacion>;
  todoValido: boolean;
  pesoTotalGramos: number;
  pesoMinimoConMargen: number;
  cantidadTotal: number;
  materialesDisponibles: MaterialItem[];
  erroresCliente: ErrorCampo[];
  clienteValido: boolean;
}

export const obtenerStockGramos = (mat: any): number => {
  const raw =
    mat?.stock_gramos ??
    mat?.gramos ??
    mat?.gramos_disponibles ??
    mat?.peso ??
    null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

const esNumeroValido = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s.length === 0) return false;
  const n = Number(s);
  return Number.isFinite(n);
};

/* ------------------------------------------------------------------ */
/* PASO 1 — PIEZAS                                                     */
/* ------------------------------------------------------------------ */
const validarPiezas = (piezas: PiezaFormState[]): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!piezas || piezas.length === 0) {
    errores.push({
      campo: "piezas",
      mensaje: "Agrega al menos una pieza para poder cotizar.",
    });
    return errores;
  }

  piezas.forEach((p, index) => {
    const etiqueta =
      p.nombre_pieza?.trim().length > 0
        ? `"${p.nombre_pieza.trim()}"`
        : `Pieza ${index + 1}`;

    if (!p.nombre_pieza || p.nombre_pieza.trim().length === 0) {
      errores.push({
        campo: `pieza_${index}_nombre`,
        mensaje: `Pieza ${index + 1}: falta el nombre del modelo.`,
      });
    }

    const peso = parseFloat(p.peso_gramos);
    if (!esNumeroValido(p.peso_gramos) || isNaN(peso) || peso <= 0) {
      errores.push({
        campo: `pieza_${index}_peso`,
        mensaje: `${etiqueta}: el peso en gramos debe ser mayor a 0.`,
      });
    }

    const cantidad = parseInt(p.cantidad, 10);
    if (!esNumeroValido(p.cantidad) || isNaN(cantidad) || cantidad <= 0) {
      errores.push({
        campo: `pieza_${index}_cantidad`,
        mensaje: `${etiqueta}: la cantidad debe ser al menos 1 unidad.`,
      });
    }

    const horas = parseInt(p.tiempo_impresion_horas, 10) || 0;
    const minutos = parseInt(p.tiempo_impresion_minutos, 10) || 0;
    if (horas <= 0 && minutos <= 0) {
      errores.push({
        campo: `pieza_${index}_tiempo`,
        mensaje: `${etiqueta}: falta el tiempo de impresión (horas o minutos).`,
      });
    }
    if (minutos > 59) {
      errores.push({
        campo: `pieza_${index}_minutos`,
        mensaje: `${etiqueta}: los minutos no pueden superar 59.`,
      });
    }

    if (!p.foto_pieza) {
      errores.push({
        campo: `pieza_${index}_foto`,
        mensaje: `${etiqueta}: falta la foto de la pieza.`,
      });
    }
  });

  return errores;
};

/* ------------------------------------------------------------------ */
/* PASO 2 — MATERIAL                                                   */
/* ------------------------------------------------------------------ */
const validarMaterial = (
  filamentoId: string | undefined,
  materialesDisponibles: MaterialItem[],
  pesoMinimoConMargen: number,
): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (materialesDisponibles.length === 0) {
    errores.push({
      campo: "filamento_stock",
      mensaje: `No hay filamentos con al menos ${pesoMinimoConMargen}g disponibles en el inventario.`,
    });
    return errores;
  }

  if (!filamentoId) {
    errores.push({
      campo: "filamento_id",
      mensaje: "Selecciona el tipo de material y el color del filamento.",
    });
    return errores;
  }

  const elegido = materialesDisponibles.find((m) => m.id === filamentoId);
  if (!elegido) {
    errores.push({
      campo: "filamento_id",
      mensaje:
        "El filamento seleccionado ya no tiene stock suficiente. Elige otro.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* PASO 3 — IMPRESORA                                                  */
/* ------------------------------------------------------------------ */
const validarImpresora = (
  impresoraId: string | undefined,
  impresoras: EntradaValidacion["impresoras"],
): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!impresoras || impresoras.length === 0) {
    errores.push({
      campo: "impresora_stock",
      mensaje: "No hay impresoras registradas o activas en el sistema.",
    });
    return errores;
  }

  if (!impresoraId) {
    errores.push({
      campo: "impresora_id",
      mensaje: "Selecciona la marca y el modelo de la impresora a utilizar.",
    });
    return errores;
  }

  if (!impresoras.some((i) => i.id === impresoraId)) {
    errores.push({
      campo: "impresora_id",
      mensaje: "La impresora seleccionada ya no está disponible. Elige otra.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* PASO 4 — RIESGO DE FALLOS                                           */
/* ------------------------------------------------------------------ */
const validarRiesgo = (valor: string | undefined): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!esNumeroValido(valor)) {
    errores.push({
      campo: "porcentaje_riesgo",
      mensaje: "Ingresa el porcentaje de riesgo de fallos (puede ser 0).",
    });
    return errores;
  }

  const n = Number(valor);
  if (n < 0) {
    errores.push({
      campo: "porcentaje_riesgo",
      mensaje: "El porcentaje de riesgo no puede ser negativo.",
    });
  }
  if (n > 100) {
    errores.push({
      campo: "porcentaje_riesgo",
      mensaje: "El porcentaje de riesgo no puede superar el 100%.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* PASO 5 — UTILIDAD / MARGEN                                          */
/* ------------------------------------------------------------------ */
const validarUtilidad = (
  reglaId: string | undefined,
  margenPct: string | undefined,
  reglasMargen: ReglaMargen[],
): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!reglasMargen || reglasMargen.length === 0) {
    errores.push({
      campo: "reglas_margen",
      mensaje:
        "No hay reglas de margen configuradas. Defínelas en Parámetros del Taller.",
    });
    return errores;
  }

  if (!reglaId) {
    errores.push({
      campo: "regla_margen_id",
      mensaje: "Selecciona el margen de utilidad a aplicar.",
    });
  }

  if (!esNumeroValido(margenPct) || Number(margenPct) <= 0) {
    errores.push({
      campo: "margen_ganancia_pct",
      mensaje: "El margen de utilidad debe ser mayor a 0%.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* PASO 6 — PERSONALIZACIÓN                                            */
/* ------------------------------------------------------------------ */
const validarPersonalizacion = (
  esPersonalizado: boolean,
  precio: string | undefined,
): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!esPersonalizado) return errores;

  if (!esNumeroValido(precio) || Number(precio) <= 0) {
    errores.push({
      campo: "precio_personalizacion",
      mensaje:
        "Activaste la personalización: ingresa un precio adicional mayor a 0.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* CLIENTE (fuera de la secuencia, se valida al final)                 */
/* ------------------------------------------------------------------ */
const validarCliente = (
  nombre: string | undefined,
  telefono: string | undefined,
): ErrorCampo[] => {
  const errores: ErrorCampo[] = [];

  if (!nombre || nombre.trim().length < 3) {
    errores.push({
      campo: "nombre_cliente",
      mensaje: "Ingresa el nombre o razón social del cliente (mín. 3 letras).",
    });
  }

  const tel = (telefono ?? "").replace(/\D/g, "");
  if (tel.length === 0) {
    errores.push({
      campo: "telefono_cliente",
      mensaje: "Ingresa el teléfono de WhatsApp del cliente.",
    });
  } else if (tel.length < 7) {
    errores.push({
      campo: "telefono_cliente",
      mensaje: "El teléfono debe tener al menos 7 dígitos.",
    });
  }

  return errores;
};

/* ------------------------------------------------------------------ */
/* ORQUESTADOR                                                         */
/* ------------------------------------------------------------------ */
export function validarSecuenciaCotizacion(
  entrada: EntradaValidacion,
): ResultadoValidacionSecuencial {
  const {
    form,
    piezas,
    materiales,
    impresoras,
    reglasMargen,
    esPersonalizado,
  } = entrada;

  const pesoTotalGramos = (piezas ?? []).reduce((acc, p) => {
    const peso = parseFloat(p.peso_gramos) || 0;
    const cantidad = parseInt(p.cantidad, 10) || 0;
    return acc + peso * cantidad;
  }, 0);

  const cantidadTotal =
    (piezas ?? []).reduce(
      (acc, p) => acc + (parseInt(p.cantidad, 10) || 0),
      0,
    ) || 1;

  const pesoMinimoConMargen = pesoTotalGramos + MARGEN_SEGURIDAD_GRAMOS;

  const erroresPiezas = validarPiezas(piezas);
  const piezasCompletas = erroresPiezas.length === 0;

  const materialesDisponibles = piezasCompletas
    ? (materiales ?? []).filter(
        (m) => obtenerStockGramos(m) >= pesoMinimoConMargen,
      )
    : [];

  const definicion: {
    id: PasoCotizacionId;
    titulo: string;
    errores: ErrorCampo[];
  }[] = [
    { id: "piezas", titulo: "Datos por pieza", errores: erroresPiezas },
    {
      id: "material",
      titulo: "Material / Filamento",
      errores: validarMaterial(
        form.filamento_id,
        materialesDisponibles,
        pesoMinimoConMargen,
      ),
    },
    {
      id: "impresora",
      titulo: "Impresora",
      errores: validarImpresora(form.impresora_id, impresoras),
    },
    {
      id: "riesgo",
      titulo: "Riesgo de fallos",
      errores: validarRiesgo(form.porcentaje_riesgo),
    },
    {
      id: "utilidad",
      titulo: "Margen de utilidad",
      errores: validarUtilidad(
        form.regla_margen_id,
        form.margen_ganancia_pct,
        reglasMargen,
      ),
    },
    {
      id: "personalizacion",
      titulo: "Personalización",
      errores: validarPersonalizacion(
        esPersonalizado,
        form.precio_personalizacion,
      ),
    },
  ];

  const pasos: PasoValidacion[] = [];
  let bloqueoActivo: { titulo: string; errores: ErrorCampo[] } | null = null;

  for (const def of definicion) {
    const bloqueado = bloqueoActivo !== null;
    const completo = !bloqueado && def.errores.length === 0;

    pasos.push({
      id: def.id,
      titulo: def.titulo,
      errores: bloqueado ? [] : def.errores,
      completo,
      bloqueado,
      bloqueadoPor: bloqueoActivo?.titulo,
      erroresBloqueantes: bloqueoActivo?.errores ?? [],
    });

    if (!bloqueado && def.errores.length > 0) {
      bloqueoActivo = { titulo: def.titulo, errores: def.errores };
    }
  }

  const pasosPorId = pasos.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<PasoCotizacionId, PasoValidacion>,
  );

  const erroresCliente = validarCliente(
    form.nombre_cliente,
    form.telefono_cliente,
  );

  return {
    pasos,
    pasosPorId,
    todoValido: pasos.every((p) => p.completo),
    pesoTotalGramos,
    pesoMinimoConMargen,
    cantidadTotal,
    materialesDisponibles,
    erroresCliente,
    clienteValido: erroresCliente.length === 0,
  };
}
