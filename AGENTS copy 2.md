import { useAuth } from "@/features/auth/hooks/useAuth";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { useMaterialesTaller } from "@/features/materiales/hooks/useMaterialesTaller";
import { useCallback, useEffect, useState } from "react";
import { guardarCotizacion } from "../services/cotizacionService";
import type {
  CotizarFormState,
  PiezaFormState,
  ResultadoCotizacion,
} from "../types";
import { calcularCotizacion } from "../utils/calcularCotizacion";

const initialForm: CotizarFormState = {
  cliente_id: "",
  nombre_cliente: "",
  telefono_cliente: "",
  impresora_id: "",
  filamento_id: "",
  regla_margen_id: "",
  margen_ganancia_pct: "",
  porcentaje_riesgo: "0",
  precio_personalizacion: "0",
  precio_mayorista: "",
  precio_minorista: "",
  tiempo_preparacion_minutos: "15",
  tiempo_postprocesado_minutos: "0",
  imagen_referencia: "",
  notas: "",
};

// Campos que SÍ influyen en el cálculo técnico de la cotización.
// Solo estos deben invalidar el `resultado` actual al cambiar.
// El resto (imagen_referencia, datos de cliente, notas, etc.) son
// metadatos que no deben resetear el cálculo ya realizado.
const CAMPOS_QUE_AFECTAN_CALCULO: ReadonlySet<keyof CotizarFormState> = new Set([
  "filamento_id",
  "impresora_id",
  "regla_margen_id",
  "margen_ganancia_pct",
  "porcentaje_riesgo",
  "precio_personalizacion",
  "tiempo_preparacion_minutos",
  "tiempo_postprocesado_minutos",
]);

const crearPiezaVacia = (numero: number): PiezaFormState => ({
  id: `pieza_${Date.now()}_${numero}`,
  nombre_pieza: "",
  peso_gramos: "",
  cantidad: "1",
  tiempo_impresion_horas: "",
  tiempo_impresion_minutos: "0",
});

export function useCotizacion() {
  const { user } = useAuth();

  const {
    empresaId,
    materiales: filamentos,
    impresoras,
    configuracion: config,
    reglasMargen,
    cargando: cargandoTaller,
    error: errorTaller,
    recargar: recargarTaller,
  } = useMaterialesTaller();

  const {
    clientes,
    cargando: cargandoClientes,
    crearCliente,
    buscarPorTelefono,
    recargar: recargarClientes,
  } = useClientes();

  const [form, setForm] = useState<CotizarFormState>(initialForm);
  const [piezas, setPiezas] = useState<PiezaFormState[]>([crearPiezaVacia(1)]);
  const [piezaActivaId, setPiezaActivaId] = useState<string>(piezas[0].id);
  const [resultado, setResultado] = useState<ResultadoCotizacion | null>(null);

  const [calculando, setCalculando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (errorTaller) setError(errorTaller);
  }, [errorTaller]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      impresora_id: prev.impresora_id || (impresoras[0]?.id ?? ""),
      filamento_id: prev.filamento_id || (filamentos[0]?.id ?? ""),
    }));
  }, [impresoras, filamentos]);

  const updateField = useCallback(
    (field: keyof CotizarFormState, value: string) => {
      setForm((prev) => {
        if (
          (field === "nombre_cliente" || field === "telefono_cliente") &&
          prev.cliente_id
        ) {
          return { ...prev, [field]: value, cliente_id: "" };
        }
        return { ...prev, [field]: value };
      });

      // Solo invalidamos el resultado ya calculado si el campo modificado
      // realmente participa en el cálculo técnico. Metadatos como la foto
      // de referencia, el nombre o teléfono del cliente NO deben borrar
      // la cotización que ya se mostró en pantalla.
      if (CAMPOS_QUE_AFECTAN_CALCULO.has(field)) {
        setResultado(null);
      }
    },
    [],
  );

  const updatePiezaField = useCallback(
    (id: string, field: keyof Omit<PiezaFormState, "id">, value: string) => {
      setPiezas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
      // Las piezas sí afectan el cálculo técnico (peso, cantidad, tiempo),
      // así que aquí siempre es correcto invalidar el resultado.
      setResultado(null);
    },
    [],
  );

  const agregarPieza = useCallback(() => {
    setPiezas((prev) => {
      const nueva = crearPiezaVacia(prev.length + 1);
      setPiezaActivaId(nueva.id);
      return [...prev, nueva];
    });
    setResultado(null);
  }, []);

  const eliminarPieza = useCallback(
    (id: string) => {
      setPiezas((prev) => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex((p) => p.id === id);
        const nuevas = prev.filter((p) => p.id !== id);
        if (piezaActivaId === id) {
          const nuevoIdx = Math.max(0, idx - 1);
          setPiezaActivaId(nuevas[nuevoIdx].id);
        }
        return nuevas;
      });
      setResultado(null);
    },
    [piezaActivaId],
  );

  const seleccionarPieza = useCallback((id: string) => {
    setPiezaActivaId(id);
  }, []);

  const validar = useCallback((): string | null => {
    if (!form.filamento_id) return "Selecciona un filamento";
    if (!form.impresora_id) return "Selecciona una impresora";
    if (piezas.length === 0) return "Agrega al menos una pieza";

    for (let i = 0; i < piezas.length; i++) {
      const p = piezas[i];
      const etiqueta = p.nombre_pieza?.trim() || `Pieza ${i + 1}`;
      if (!Number(p.peso_gramos) || Number(p.peso_gramos) <= 0) {
        return `${etiqueta}: ingresa un peso válido (g)`;
      }
      if (!Number(p.cantidad) || Number(p.cantidad) <= 0) {
        return `${etiqueta}: ingresa una cantidad válida`;
      }
      const horas = Number(p.tiempo_impresion_horas) || 0;
      const minutos = Number(p.tiempo_impresion_minutos) || 0;
      if (horas <= 0 && minutos <= 0) {
        return `${etiqueta}: ingresa un tiempo de impresión válido`;
      }
    }
    return null;
  }, [form.filamento_id, form.impresora_id, piezas]);

  const calcular = useCallback(() => {
    if (!config) return;

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setError(null);
    setCalculando(true);

    try {
      const impresora = impresoras.find((i) => i.id === form.impresora_id);
      const filamento = filamentos.find((f) => f.id === form.filamento_id);

      if (!impresora || !filamento) {
        throw new Error(
          "No se encontró la impresora o el filamento seleccionado.",
        );
      }

      const esMargenManualValido =
        form.margen_ganancia_pct !== "" &&
        form.margen_ganancia_pct !== null &&
        form.margen_ganancia_pct !== undefined &&
        !isNaN(Number(form.margen_ganancia_pct)) &&
        Number(form.margen_ganancia_pct) > 0;

      const margenOverride = esMargenManualValido
        ? Number(form.margen_ganancia_pct)
        : undefined;

      const res = calcularCotizacion(
        {
          piezas: piezas.map((p) => ({
            id: p.id,
            nombre_pieza: p.nombre_pieza || "Pieza 3D",
            cantidad: Number(p.cantidad),
            peso_gramos: Number(p.peso_gramos),
            tiempo_impresion_horas: Number(p.tiempo_impresion_horas) || 0,
            tiempo_impresion_minutos: Number(p.tiempo_impresion_minutos) || 0,
          })),
          tiempo_preparacion_minutos: Number(form.tiempo_preparacion_minutos || 0),
          tiempo_postprocesado_minutos: Number(
            form.tiempo_postprocesado_minutos || 0,
          ),
          impresora,
          filamento,
          porcentaje_riesgo: Number(form.porcentaje_riesgo || 0),
          precio_personalizacion: Number(form.precio_personalizacion || 0),
          regla_margen_id: form.regla_margen_id,
          precio_mayorista: form.precio_mayorista
            ? Number(form.precio_mayorista)
            : undefined,
          precio_minorista: form.precio_minorista
            ? Number(form.precio_minorista)
            : undefined,
        },
        config,
        reglasMargen,
        margenOverride,
      );

      setResultado(res);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Error al calcular la cotización";
      setError(msg);
    } finally {
      setCalculando(false);
    }
  }, [config, form, piezas, impresoras, filamentos, reglasMargen, validar]);

  const resolverClienteId = useCallback(async (): Promise<string | null> => {
    if (form.cliente_id) return form.cliente_id;

    const nombre = form.nombre_cliente.trim();
    if (!nombre) return null;

    if (form.telefono_cliente.trim()) {
      const existente = buscarPorTelefono(form.telefono_cliente.trim());
      if (existente) return existente.id;
    }

    const nuevo = await crearCliente({
      nombre,
      telefono: form.telefono_cliente.trim() || null,
      empresa_id: empresaId,
    } as Parameters<typeof crearCliente>[0]);

    return nuevo?.id ?? null;
  }, [
    form.cliente_id,
    form.nombre_cliente,
    form.telefono_cliente,
    empresaId,
    buscarPorTelefono,
    crearCliente,
  ]);

  const guardar = useCallback(
    async (extraData?: { cliente_id?: string }): Promise<any> => {
      if (!user || !resultado) return null;

      setGuardando(true);
      setError(null);

      try {
        const clienteId = extraData?.cliente_id || (await resolverClienteId());

        const respuestaBD = await guardarCotizacion({
          userId: user.id,
          empresaId: empresaId ?? undefined,
          clienteId,
          clienteNombre: form.nombre_cliente || "Cliente General",
          clienteContacto: form.telefono_cliente || null,
          notas: form.notas || null,
          impresoraId: form.impresora_id,
          filamentoId: form.filamento_id,
          tiempoPreparacionMinutos: Number(form.tiempo_preparacion_minutos || 0),
          tiempoPostprocesadoMinutos: Number(
            form.tiempo_postprocesado_minutos || 0,
          ),
          costoDisenoTotal: resultado.precio_personalizacion ?? 0,
          resultado,
        });

        setForm(initialForm);
        setPiezas([crearPiezaVacia(1)]);
        setPiezaActivaId((p) => p);
        setResultado(null);
        await Promise.all([recargarTaller(), recargarClientes()]);
        return respuestaBD;
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Error al guardar la cotización";
        console.error("❌ guardarCotizacion falló:", e);
        setError(msg);
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [
      user,
      empresaId,
      resultado,
      form,
      resolverClienteId,
      recargarTaller,
      recargarClientes,
    ],
  );

  return {
    form,
    updateField,
    piezas,
    piezaActivaId,
    updatePiezaField,
    agregarPieza,
    eliminarPieza,
    seleccionarPieza,
    impresoras,
    filamentos,
    clientes,
    config,
    reglasMargen,
    resultado,
    cargandoDatos: cargandoTaller || cargandoClientes,
    calculando,
    guardando,
    error,
    calcular,
    guardar,
    recargarTaller,
    recargarClientes,
  };
}

export type UseCotizacionReturn = ReturnType<typeof useCotizacion>;


import { supabase } from "@/services/supabase/client";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import type { ResultadoCotizacion } from "../types";

interface GuardarCotizacionParams {
  userId: string;
  empresaId?: string;
  clienteId: string | null;
  clienteNombre: string;
  clienteContacto: string | null;
  notas: string | null;
  impresoraId: string;
  filamentoId: string;
  tiempoPreparacionMinutos: number;
  tiempoPostprocesadoMinutos: number;
  costoDisenoTotal?: number;
  resultado: ResultadoCotizacion;
  imagenUri?: string | null;
}

/**
 * Subida profesional de imágenes desde React Native / Expo Go a Supabase Storage
 */
async function subirImagenReferencia(
  userId: string,
  imagenUri: string
): Promise<string | null> {
  try {
    // 1. Obtener extensión y MIME type adecuado
    const cleanUri = imagenUri.split("?")[0];
    const fileExtension = cleanUri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = fileExtension === "png" ? "image/png" : "image/jpeg";

    // Generar ruta única en el Storage
    const fileName = `${userId}/${Date.now()}_${Crypto.randomUUID()}.${fileExtension}`;
    const filePath = `cotizaciones/${fileName}`;

    // 2. Leer el archivo local en formato Base64 directamente pasando "base64" como string
    // Esto resuelve el error de ESLint con FileSystem.EncodingType
    const base64Data = await FileSystem.readAsStringAsync(imagenUri, {
      encoding: "base64",
    });

    // 3. Convertir Base64 a ArrayBuffer usando base64-arraybuffer
    const arrayBuffer = decode(base64Data);

    // 4. Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("empresa-assets")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error de Supabase Storage:", uploadError);
      throw new Error(`Error en Storage: ${uploadError.message}`);
    }

    // 5. Obtener la URL pública del archivo subido
    const { data: publicUrlData } = supabase.storage
      .from("empresa-assets")
      .getPublicUrl(uploadData.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("❌ Error detallado en subirImagenReferencia:", error);
    return null;
  }
}

export async function guardarCotizacion({
  userId,
  empresaId,
  clienteId,
  clienteNombre,
  clienteContacto,
  notas,
  impresoraId,
  filamentoId,
  tiempoPreparacionMinutos,
  tiempoPostprocesadoMinutos,
  costoDisenoTotal = 0,
  resultado,
  imagenUri,
}: GuardarCotizacionParams) {
  const tokenPublico = Crypto.randomUUID();

  // Subir imagen a Storage si fue proporcionada una URI válida
  let imagenReferenciaUrl: string | null = null;
  if (imagenUri) {
    imagenReferenciaUrl = await subirImagenReferencia(userId, imagenUri);
  }

  // 1. Guardar la cabecera de la cotización
  const { data: cotizacion, error: errorCotizacion } = await supabase
    .from("cotizaciones")
    .insert({
      creado_por: userId,
      empresa_id: empresaId ?? null,
      cliente_id: clienteId,
      cliente_nombre: clienteNombre,
      cliente_contacto: clienteContacto,
      costo_directo_total: resultado.costo_directo_total,
      costo_indirecto_total: resultado.costo_indirecto_total,
      costo_fallos_total: resultado.costo_fallos_total,
      costo_diseno_total: costoDisenoTotal,
      subtotal_costo_base: resultado.subtotal_costo_base,
      monto_ganancia: resultado.monto_ganancia,
      monto_impuesto: resultado.monto_impuesto,
      precio_final: resultado.precio_final,
      margen_ganancia_aplicado_pct: resultado.margen_ganancia_aplicado_pct,
      estado: "pendiente",
      notas,
      token_publico: tokenPublico,
      imagen_referencia_url: imagenReferenciaUrl,
    })
    .select()
    .single();

  if (errorCotizacion) throw errorCotizacion;

  // 2. Insertar renglones de la cotización
  const itemsAInsertar = resultado.piezas.map((pieza) => ({
    cotizacion_id: cotizacion.id,
    impresora_id: impresoraId,
    filamento_id: filamentoId,
    nombre_pieza: pieza.nombre_pieza,
    cantidad: pieza.cantidad,
    peso_gramos: pieza.peso_gramos,
    tiempo_impresion_horas: pieza.tiempo_impresion_horas,
    tiempo_preparacion_minutos: tiempoPreparacionMinutos,
    tiempo_postprocesado_minutos: tiempoPostprocesadoMinutos,
    costo_material: pieza.costo_material_unit,
    costo_energia: pieza.costo_energia_unit,
    costo_amortizacion: pieza.costo_amortizacion_unit,
    costo_mantenimiento: 0,
    costo_mano_obra: pieza.costo_mano_obra_unit,
    costo_subtotal_item: pieza.subtotal_directo_pieza,
  }));

  const { error: errorItems } = await supabase
    .from("cotizacion_items")
    .insert(itemsAInsertar);

  if (errorItems) throw errorItems;

  return cotizacion;
}




import { supabase } from "@/config/supabase";
import * as Crypto from "expo-crypto";
import type { VoucherData } from "../types";

export async function guardarVoucherPublico(
  cotizacionId: string,
  voucherData: VoucherData,
): Promise<string> {
  const token = Crypto.randomUUID();

  const { error } = await supabase
    .from("cotizaciones")
    .update({ 
      voucher_data: voucherData, 
      token_publico: token 
    })
    .eq("id", cotizacionId);

  if (error) {
    throw new Error(`No se pudo publicar el voucher: ${error.message}`);
  }

  return token;
}

export function buildVoucherPublicUrl(token: string): string {
  const baseUrl = "https://cotizador-3d-web.vercel.app";

  return `${baseUrl}/v/${token}`;
}





// src/features/cotizacion/types.ts
import type {
  ConfiguracionEmpresa,
  Material as Filamento,
  Impresora,
  ReglaMargenGanancia,
} from "@/features/materiales/types";

export type { ConfiguracionEmpresa, Filamento, Impresora, ReglaMargenGanancia };

// ==========================================
// FORMULARIO
// ==========================================

export interface PiezaFormState {
  id: string;
  nombre_pieza: string;
  peso_gramos: string;
  cantidad: string;
  tiempo_impresion_horas: string;
  tiempo_impresion_minutos: string;
}

export interface CotizarFormState {
  cliente_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  impresora_id: string;
  filamento_id: string;
  regla_margen_id: string;
  margen_ganancia_pct: string;
  porcentaje_riesgo: string;
  precio_personalizacion: string;
  precio_mayorista: string;
  precio_minorista: string;
  tiempo_preparacion_minutos: string;
  tiempo_postprocesado_minutos: string;
  imagen_referencia: string;
  notas: string;
}

// ==========================================
// ENTRADA DE CÁLCULO (multi-pieza)
// ==========================================

export interface PiezaCotizacionInput {
  id: string;
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_impresion_minutos?: number;
}

export interface CotizacionMultiItemInput {
  piezas: PiezaCotizacionInput[];
  tiempo_preparacion_minutos?: number;
  tiempo_postprocesado_minutos?: number;
  impresora: Impresora;
  filamento: Filamento;
  porcentaje_riesgo?: number;
  precio_personalizacion?: number;
  regla_margen_id?: string;
  precio_mayorista?: number;
  precio_minorista?: number;
}

export interface EspecificacionesTecnicas {
  materialNombre: string;
  materialColor?: string;
  impresoraNombre: string;
  pesoGramos: number;
  tiempoImpresionHoras: number;
  tiempoImpresionMinutos: number;
  porcentajeRiesgo: number;
  personalizado: boolean;
  precioPersonalizacion?: number;
  imagenUri?: string;
}

// ==========================================
// RESULTADO
// ==========================================

export interface DetalleDesgloseCotizacion {
  costo_material_unit: number;
  costo_filamento_unit?: number;
  costo_energia_unit: number;
  costo_amortizacion_unit: number;
  costo_mantenimiento_unit: number;
  costo_mano_obra_unit: number;
  costo_subtotal_unit?: number;
  costo_subtotal_item: number;
  costo_material?: number;
  costo_energia?: number;
  costo_depreciacion?: number;
  costo_mantenimiento?: number;
  costo_mano_obra?: number;
  costo_fallos?: number;
  costo_operativo_fijo?: number;
  subtotal_costo_base?: number;
  subtotal_costo_directo?: number;
  costo_total_unidad?: number;
  precio_unidad_sugerido?: number;
  precio_total_sugerido?: number;
  margen_aplicado_pct?: number;
}

/** Desglose y precio sugerido de UNA pieza dentro de la cotización general */
export interface DesglosePiezaResultado {
  id: string;
  nombre_pieza: string;
  cantidad: number;
  peso_gramos: number;
  tiempo_impresion_horas: number;
  tiempo_impresion_minutos: number;

  // Costos unitarios (por 1 unidad de esta pieza)
  costo_material_unit: number;
  costo_mano_obra_unit: number;
  costo_amortizacion_unit: number;
  costo_energia_unit: number;
  costo_subtotal_unit: number;

  // Costos totales de esta pieza (unitario * cantidad)
  costo_material: number;
  costo_mano_obra: number;
  costo_depreciacion: number;
  costo_energia: number;
  subtotal_directo_pieza: number;

  // Proporción de esta pieza dentro del costo directo total del proyecto
  proporcion_pct: number;

  // Prorrateo de riesgo/utilidad/personalización (informativo, no se vuelve a sumar al total)
  costo_fallos_pieza: number;
  costo_base_pieza: number;
  monto_ganancia_pieza: number;
  precio_personalizacion_pieza: number;
  precio_total_pieza: number;
  precio_unitario_pieza: number;
}

export interface ResultadoCotizacion {
  nombre_pieza?: string; // compat: nombre de la 1ra pieza (para PDFs/voucher)
  cantidad?: number; // total de unidades sumando todas las piezas
  peso_gramos?: number; // total de gramos (peso * cantidad, sumado)
  tiempo_impresion_horas?: number;
  tiempo_impresion_minutos?: number;
  precio_por_pieza?: number;
  costo_total_proyecto?: number;
  costo_directo_total: number;
  costo_indirecto_total: number;
  costo_fallos_total: number;
  subtotal_costo_base: number;
  monto_ganancia: number;
  monto_impuesto: number;
  precio_final: number;
  margen_ganancia_aplicado_pct: number;
  desglose: DetalleDesgloseCotizacion;
  precio_personalizacion?: number;
  precio_minorista?: number;
  precio_mayorista?: number;
  /** NUEVO: desglose individual de cada pieza cotizada */
  piezas: DesglosePiezaResultado[];
}

// ==========================================
// VOUCHER / PDF (sin cambios)
// ==========================================

export interface VoucherPricingTier {
  label: string;
  conditionLabel?: string;
  price: number;
  discountLabel?: string;
}

export interface VoucherItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VoucherPolicy {
  label: string;
  text: string;
}

export interface VoucherEspecificaciones {
  materialNombre?: string;
  materialColor?: string;
}

export interface VoucherData {
  companyName: string;
  companyTagline: string;
  documentTitle: string;
  issueDateLabel: string;
  validityLabel?: string;
  logoUri?: string;
  productImageUri?: string;
  unitPriceLabel: string;
  unitPrice: number;
  especificaciones?: VoucherEspecificaciones;
  pricingTiers?: VoucherPricingTier[];
  items: VoucherItem[];
  policies: VoucherPolicy[];
  footerNote: string;
  websiteUrl?: string;
  currencySymbol: string;
}


// src/app/(tabs)/cotizar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useClientes } from "@/features/clientes/hooks/useClientes";
import { CotizacionResumenCard } from "@/features/cotizacion/components/CotizacionResumenCard";
import { CotizacionForm } from "@/features/cotizacion/components/forms/CotizacionForm";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { buildEspecificaciones } from "@/features/cotizacion/utils/buildEspecificaciones";
import { Filamento, Impresora } from "@/features/materiales/types";
import { useTheme } from "@/hooks/useTheme";

export default function CotizarScreen() {
  const { theme } = useTheme();

  const cotizacion = useCotizacion();
  const { guardarCliente, recargar: recargarClientes } = useClientes();

  useFocusEffect(
    useCallback(() => {
      cotizacion.recargarTaller?.();
      recargarClientes?.();
    }, [cotizacion.recargarTaller, recargarClientes])
  );

  const filamentosList = cotizacion.filamentos as unknown as Filamento[];
  const impresorasList = cotizacion.impresoras as unknown as Impresora[];

  const especificaciones = useMemo(
    () =>
      buildEspecificaciones(
        cotizacion.form,
        filamentosList as any,
        impresorasList as any,
      ),
    [cotizacion.form, filamentosList, impresorasList],
  );

  const cantidadTotal = useMemo(
    () =>
      (cotizacion.piezas ?? []).reduce(
        (acc, p) => acc + (Number(p.cantidad) || 0),
        0,
      ) || 1,
    [cotizacion.piezas],
  );

  const handleGuardarCliente = async (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => {
    return guardarCliente({
      id: cliente.id,
      nombre: cliente.nombre_razon_social,
      telefono: cliente.telefono,
    });
  };

  const handleGuardarCotizacion = async (options?: {
    cliente_id?: string;
  }) => {
    // Se delega el valor de la imagen a cotizacion.form.imagen_referencia directamente
    const res = await cotizacion.guardar(options);
    return res;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <CotizacionForm
        form={cotizacion.form}
        updateField={cotizacion.updateField}
        piezas={cotizacion.piezas}
        piezaActivaId={cotizacion.piezaActivaId}
        updatePiezaField={cotizacion.updatePiezaField}
        agregarPieza={cotizacion.agregarPieza}
        eliminarPieza={cotizacion.eliminarPieza}
        seleccionarPieza={cotizacion.seleccionarPieza}
        impresoras={impresorasList as any}
        materiales={filamentosList as any}
        clientes={cotizacion.clientes}
        reglasMargen={cotizacion.reglasMargen as any}
        cargandoDatos={cotizacion.cargandoDatos}
        calculando={cotizacion.calculando}
        error={cotizacion.error}
        calcular={cotizacion.calcular}
      />

      <View style={styles.resumenContainer}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="receipt-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Resumen de Cotización
          </Text>
        </View>

        <CotizacionResumenCard
          resultado={cotizacion.resultado}
          cantidad={cantidadTotal}
          especificaciones={especificaciones}
          clienteId={cotizacion.form.cliente_id}
          nombreCliente={cotizacion.form.nombre_cliente}
          telefonoCliente={cotizacion.form.telefono_cliente}
          onGuardarCliente={handleGuardarCliente}
          onGuardarCotizacion={handleGuardarCotizacion}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  resumenContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});





// src/features/cotizacion/components/forms/CotizacionForm.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ClienteResumen } from "@/features/clientes/types";
import { useAutoCalculoCotizacion } from "@/features/cotizacion/hooks/useAutoCalculoCotizacion";
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import type {
  MaterialItem,
  ReglaMargen,
} from "@/features/cotizacion/types/formTypes";
import { useTheme } from "@/hooks/useTheme";

import { ClienteInfoSection } from "./sections/ClienteInfoSection";
import { ImagenReferenciaPicker } from "./sections/ImagenReferenciaPicker";
import { ImpresoraSelector } from "./sections/ImpresoraSelector";
import { MargenGananciaSelector } from "./sections/MargenGananciaSelector";
import { MaterialSelector } from "./sections/MaterialSelector";
import { PersonalizacionSwitch } from "./sections/PersonalizacionSwitch";
import { PiezasSection } from "./sections/PiezasSection";
import { RiesgoInput } from "./sections/RiesgoInput";

type CotizacionFormProps = Pick<
  UseCotizacionReturn,
  | "form"
  | "updateField"
  | "piezas"
  | "piezaActivaId"
  | "updatePiezaField"
  | "agregarPieza"
  | "eliminarPieza"
  | "seleccionarPieza"
  | "impresoras"
  | "cargandoDatos"
  | "calculando"
  | "error"
  | "calcular"
> & {
  materiales: MaterialItem[];
  clientes?: ClienteResumen[];
  reglasMargen?: ReglaMargen[];
};

export function CotizacionForm({
  form,
  updateField,
  piezas,
  piezaActivaId,
  updatePiezaField,
  agregarPieza,
  eliminarPieza,
  seleccionarPieza,
  impresoras = [],
  materiales = [],
  cargandoDatos,
  calculando,
  error,
  calcular,
  clientes = [],
  reglasMargen = [],
}: CotizacionFormProps) {
  const { theme } = useTheme();

  const [esPersonalizado, setEsPersonalizado] = useState<boolean>(
    () => Number(form.precio_personalizacion) > 0,
  );
  
  // Usamos form.imagen_referencia como la fuente de verdad directa
  const imagenUri = form.imagen_referencia || null;

  const { validationError } = useAutoCalculoCotizacion({
    form,
    piezas,
    updateField,
    calcular,
    reglasMargen,
    esPersonalizado,
  });

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requiere acceso a la cámara para tomar fotos de referencia.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7, // 0.7 reduce el consumo de memoria en dispositivos móviles
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        // Se actualiza el campo del formulario global sin romper el cálculo
        updateField("imagen_referencia", uri);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo capturar la imagen. Intenta nuevamente.");
    }
  };

  if (cargandoDatos) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.mutedText, { color: theme.textSecondary }]}>
          Cargando impresoras y materiales...
        </Text>
      </View>
    );
  }

  const activeError = validationError || error;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bgPrimary }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRealtime}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={22} color={theme.primary} />
          <Text style={[styles.mainSectionTitle, { color: theme.textPrimary }]}>
            Parámetros de Cotización
          </Text>
        </View>
        {calculando && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>
        Información del Cliente
      </Text>
      <ClienteInfoSection
        clientes={clientes}
        clienteId={form.cliente_id}
        nombreCliente={form.nombre_cliente}
        telefonoCliente={form.telefono_cliente}
        onSeleccionarCliente={(c) => {
          updateField("cliente_id", c.id);
          updateField("nombre_cliente", c.nombre);
          if (c.telefono) updateField("telefono_cliente", c.telefono);
        }}
        onChangeNombre={(v) => updateField("nombre_cliente", v)}
        onChangeTelefono={(v) => updateField("telefono_cliente", v)}
      />

      <View style={styles.sectionDivider} />

      <MaterialSelector
        materiales={materiales}
        filamentoId={form.filamento_id}
        onSeleccionar={(id) => updateField("filamento_id", id)}
      />

      <PiezasSection
        piezas={piezas}
        piezaActivaId={piezaActivaId}
        updatePiezaField={updatePiezaField}
        agregarPieza={agregarPieza}
        eliminarPieza={eliminarPieza}
        seleccionarPieza={seleccionarPieza}
      />

      <ImpresoraSelector
        impresoras={impresoras as any}
        impresoraId={form.impresora_id}
        onSeleccionar={(id) => updateField("impresora_id", id)}
      />

      <RiesgoInput
        value={form.porcentaje_riesgo}
        onChangeText={(v) => updateField("porcentaje_riesgo", v)}
      />

      <MargenGananciaSelector
        reglasMargen={reglasMargen}
        reglaMargenId={form.regla_margen_id}
        margenGananciaPct={form.margen_ganancia_pct}
        onSeleccionar={(regla) => {
          updateField("margen_ganancia_pct", String(regla.margen_ganancia_pct));
          updateField("regla_margen_id", regla.id);
        }}
      />

      <PersonalizacionSwitch
        activo={esPersonalizado}
        precio={form.precio_personalizacion}
        onToggle={(val) => {
          setEsPersonalizado(val);
          if (!val) updateField("precio_personalizacion", "0");
        }}
        onChangePrecio={(v) => updateField("precio_personalizacion", v)}
      />

      <ImagenReferenciaPicker
        imagenUri={imagenUri}
        onTomarFoto={tomarFoto}
      />

      {Boolean(activeError) && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {activeError}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  headerRealtime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  mainSectionTitle: { fontSize: 18, fontWeight: "700" },
  subSectionTitle: { fontSize: 15, fontWeight: "700", marginVertical: 4 },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginVertical: 14,
  },
  mutedText: { marginTop: 8, fontSize: 14 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: { fontSize: 13, fontWeight: "500" },
});




// src/features/cotizacion/components/CotizacionResumenCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import type { ResultadoCotizacion } from "@/features/cotizacion/types";
import { useEnviarVoucherCliente } from "@/features/cotizacion/hooks/useEnviarVoucherCliente";
import { useDescargarFichaInterna } from "@/features/cotizacion/hooks/useDescargarFichaInterna";

import { ResumenTabsBar } from "./resumen/ResumenTabsBar";
import { PrecioVentaDestacado } from "./resumen/PrecioVentaDestacado";
import { BarraCostosVisual, type CostSegment } from "./resumen/BarraCostosVisual";
import { EstadisticasPiezaRow } from "./resumen/EstadisticasPiezaRow";
import { PiezasDetalleLista } from "./resumen/PiezasDetalleLista";
import { DesgloseDetallado } from "./resumen/DesgloseDetallado";
import { AccionesCotizacion } from "./resumen/AccionesCotizacion";

export interface CotizacionResumenCardProps {
  resultado: ResultadoCotizacion | null;
  cantidad: number;
  especificaciones?: any;
  clienteId?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  onGuardarCliente?: (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => Promise<string | { id?: string } | void>;
  onGuardarCotizacion?: (options?: { cliente_id?: string; imagenUri?: string | null }) => Promise<any>;
}

type TabId = "general" | string;

export function CotizacionResumenCard({
  resultado,
  cantidad = 1,
  especificaciones,
  clienteId,
  nombreCliente = "",
  telefonoCliente = "",
  onGuardarCliente,
  onGuardarCotizacion,
}: CotizacionResumenCardProps) {
  const { theme } = useTheme();
  const moneda = "Bs";
  const [tabActivo, setTabActivo] = useState<TabId>("general");

  const { descargar: handleFichaInterna, generando: generandoFicha } = useDescargarFichaInterna(
    resultado,
    cantidad,
    especificaciones,
  );

  const {
    enviar: handleVoucherCliente,
    generando: generandoVoucher,
    error: voucherError,
    puedeEnviar: puedeEnviarVoucher,
  } = useEnviarVoucherCliente({
    resultado,
    cantidad,
    especificaciones,
    clienteId,
    nombreCliente,
    telefonoCliente,
    onGuardarCliente,
    onGuardarCotizacion,
  });

  const tabs = useMemo(() => {
    const base = [{ id: "general" as TabId, label: "Cotización General" }];
    const piezaTabs = (resultado?.piezas ?? []).map((p, idx) => ({
      id: p.id as TabId,
      label: p.nombre_pieza?.trim() ? p.nombre_pieza : `Pieza ${idx + 1}`,
    }));
    return [...base, ...piezaTabs];
  }, [resultado]);

  useEffect(() => {
    if (!tabs.find((t) => t.id === tabActivo)) {
      setTabActivo("general");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  if (!resultado || !resultado.desglose || resultado.piezas.length === 0) {
    return (
      <View style={[styles.card, styles.emptyCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Ingresa los parámetros necesarios para calcular la cotización en tiempo real.
        </Text>
      </View>
    );
  }

  const piezaSeleccionada = tabActivo !== "general" ? resultado.piezas.find((p) => p.id === tabActivo) : undefined;
  const esVistaGeneral = tabActivo === "general" || !piezaSeleccionada;

  const { desglose } = resultado;
  const cantActualGeneral = resultado.cantidad || cantidad || 1;

  const matDirecto = esVistaGeneral ? desglose.costo_material ?? 0 : piezaSeleccionada!.costo_material;
  const operacionMo = esVistaGeneral ? desglose.costo_mano_obra ?? 0 : piezaSeleccionada!.costo_mano_obra;
  const depreciacion = esVistaGeneral ? desglose.costo_depreciacion ?? 0 : piezaSeleccionada!.costo_depreciacion;
  const energia = esVistaGeneral ? desglose.costo_energia ?? 0 : piezaSeleccionada!.costo_energia;
  const utilidadTotal = esVistaGeneral ? resultado.monto_ganancia ?? 0 : piezaSeleccionada!.monto_ganancia_pieza;
  const cantActual = esVistaGeneral ? cantActualGeneral : piezaSeleccionada!.cantidad;
  const pctUtilidadAplicado = resultado.margen_ganancia_aplicado_pct ?? 0;
  const fondoRiesgo = esVistaGeneral ? desglose.costo_fallos ?? 0 : piezaSeleccionada!.costo_fallos_pieza;
  const subtotalDirecto = matDirecto + operacionMo + depreciacion + energia;
  const costoBaseTotal = esVistaGeneral ? resultado.subtotal_costo_base ?? 0 : piezaSeleccionada!.costo_base_pieza;
  const precioVentaMostrado = esVistaGeneral ? resultado.precio_final : piezaSeleccionada!.precio_total_pieza;

  const costSegments: CostSegment[] = [
    { key: "mat", label: "MATERIAL", flex: matDirecto || 0, color: "#1F2937" },
    { key: "ope", label: "OPERACIÓN", flex: operacionMo || 0, color: "#4B5563" },
    { key: "dep", label: "DEPRECIACIÓN", flex: depreciacion || 0, color: "#9CA3AF" },
    { key: "ene", label: "ENERGÍA", flex: energia || 0, color: "#D1D5DB" },
    { key: "uti", label: "UTILIDAD", flex: utilidadTotal || 0, color: theme.primary },
  ];

  const tituloPieza = esVistaGeneral
    ? `Cotización General (${resultado.piezas.length} ${resultado.piezas.length === 1 ? "pieza" : "piezas"})`
    : piezaSeleccionada!.nombre_pieza;

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
      <ResumenTabsBar tabs={tabs} tabActivo={tabActivo} onSeleccionar={setTabActivo} />

      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {tituloPieza}
          </Text>
        </View>
        <Text style={[styles.badge, { backgroundColor: theme.primary + "1A", color: theme.primary }]}>
          x{cantActual} {cantActual === 1 ? "unidad" : "unidades"}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <PrecioVentaDestacado precio={precioVentaMostrado} esVistaGeneral={esVistaGeneral} moneda={moneda} />

      <BarraCostosVisual segments={costSegments} textColor={theme.textSecondary} />

      {esVistaGeneral ? (
        <PiezasDetalleLista piezas={resultado.piezas} />
      ) : (
        <EstadisticasPiezaRow
          pesoGramos={piezaSeleccionada!.peso_gramos}
          tiempoHoras={piezaSeleccionada!.tiempo_impresion_horas}
          tiempoMinutos={piezaSeleccionada!.tiempo_impresion_minutos}
        />
      )}

      <DesgloseDetallado
  moneda={moneda}
  matDirecto={matDirecto}
  operacionMo={operacionMo}
  depreciacion={depreciacion}
  energia={energia}
  subtotalDirecto={subtotalDirecto}
  fondoRiesgo={fondoRiesgo}
  fondoRiesgoLabel={esVistaGeneral ? "Fondo de riesgo / Fallos" : "Fondo de riesgo (prorrateado)"}
  costoDiseno={esVistaGeneral ? Number(resultado.precio_personalizacion) : 0}
  costoBaseTotal={costoBaseTotal}
  utilidadLabel={esVistaGeneral ? "Utilidad total del proyecto" : "Utilidad de esta pieza"}
  utilidadSubtext={
    esVistaGeneral
      ? `Margen aplicado: ${pctUtilidadAplicado.toFixed(1)}%`
      : `Margen aplicado (Q=${cantActual}): ${pctUtilidadAplicado.toFixed(1)}%`
  }
  utilidadValor={utilidadTotal}
  impuesto={resultado.monto_impuesto}
/>

      <AccionesCotizacion
        onFichaInterna={handleFichaInterna}
        generandoFicha={generandoFicha}
        onEnviarWhatsapp={handleVoucherCliente}
        generandoVoucher={generandoVoucher}
        puedeEnviarVoucher={puedeEnviarVoucher}
        errorVoucher={voucherError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, gap: 10 },
  emptyCard: { paddingVertical: 24, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, textAlign: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  title: { fontSize: 16, fontWeight: "700", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: "600", overflow: "hidden" },
  divider: { height: 1, marginVertical: 4 },
});




si tengo todos estos codigos quiero que me analalices mi codigo completo para entender por que nose me guarda correctamente mi imagenes de mi cotizacion en mi imagen_referencia_url  creo que el error es que como todo esta cotizacion la creo en mi app_movil y quiero ver estos datos de mi cotizacion en mi web y por seguridad supongo que todo creas toda mi cotizacion en mi: voucher_data  pero dime que es la forma profesional para que guarde mi imagen de cotizacion en mi "imagen_referencia_url" y pueda guardar esa imagen en mi bucket: empresa-assets  y hacer referencia en mi base de datos dime como hago para solucionar ese error o dime que es lo mas profesional para luego en mi app movil pueda ver las imagenes de cotizacion o como podria hcer para ver esas imagenes dime cual es la solucion mas profesional para poder ver mis imagenes de cotizacion en mi app movil en mi cards pedido:
// src/features/pedidos/components/PedidoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ENVIO_CONFIG,
  PAGO_CONFIG,
  PRIORIDAD_CONFIG,
  estadoConfig,
} from "../constants";
import { EstadoPago, Pedido } from "../types";
import { calcularPrioridad } from "../utils/fechas";
import { formatBs } from "../utils/formato";

interface PedidoCardProps {
  theme: any;
  pedido: Pedido;
  onPress: () => void;
}

const PAGO_ICONOS: Record<EstadoPago, keyof typeof Ionicons.glyphMap> = {
  sin_pagar: "alert-circle",
  anticipo: "time",
  pagado: "checkmark-circle",
};

const METODO_PAGO_ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  efectivo: "cash-outline",
  qr: "qr-code-outline",
  transferencia: "card-outline",
};

const TIPO_ENVIO_ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  domicilio: "bicycle-outline",
  recoger: "storefront-outline",
  pickup: "storefront-outline",
  local: "storefront-outline",
};

export function PedidoCard({ theme, pedido, onPress }: PedidoCardProps) {
  const estadoCfg = estadoConfig(pedido.estado);
  const pagoCfg = PAGO_CONFIG[pedido.pago.estado];
  const prioridad = calcularPrioridad(pedido.fechaEntregaISO, pedido.estado);
  const prioridadCfg = PRIORIDAD_CONFIG[prioridad];

  const checklistHecho = pedido.envio.checklist.filter((c) => c.hecho).length;
  const checklistTotal = pedido.envio.checklist.length;
  const progreso = checklistTotal > 0 ? checklistHecho / checklistTotal : 0;

  const iconoMetodoPago =
    METODO_PAGO_ICONOS[pedido.pago.metodo?.toLowerCase() ?? ""] || "wallet-outline";
  const iconoTipoEnvio =
    TIPO_ENVIO_ICONOS[pedido.envio.tipo?.toLowerCase() ?? ""] ||
    ENVIO_CONFIG[pedido.envio.tipo]?.icono ||
    "cube-outline";

  const imagenUri =
  pedido.fotoFinalUrl ||
  pedido.fotoCotizacionUrl ||
  "https://images.unsplash.com/photo-1615840243388-00133c921503?q=80&w=600&auto=format&fit=crop";

  const handleAbrirWhatsapp = (e: any) => {
    e.stopPropagation();
    if (!pedido.cliente.telefono) return;
    const numeroLimpio = pedido.cliente.telefono.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${numeroLimpio}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.bgSecondary },
        prioridad !== "normal" && {
          borderWidth: 1.5,
          borderColor: prioridadCfg.color + "66",
        },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* 1. SECCIÓN SUPERIOR: IMAGEN CON ELEMENTOS SUPERPUESTOS */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imagenUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Fila superior superpuesta */}
        <View style={styles.topOverlayRow}>
          <View style={styles.codigoBadge}>
            <Ionicons name="pricetag" size={10} color="#FFFFFF" />
            <Text style={styles.codigoBadgeText}>{pedido.codigo}</Text>
          </View>

          <View style={[styles.estadoBadge, { backgroundColor: estadoCfg.color }]}>
            <Ionicons name={estadoCfg.icono} size={11} color="#FFFFFF" />
            <Text style={styles.estadoBadgeText}>{estadoCfg.label}</Text>
          </View>
        </View>

        {/* Fila inferior superpuesta */}
        <View style={styles.bottomOverlayRow}>
          <Text style={styles.nombrePiezaText} numberOfLines={1}>
            {pedido.pieza}
          </Text>

          <View style={[styles.pagoBadgeOverlay, { backgroundColor: pagoCfg.color }]}>
            <Ionicons
              name={PAGO_ICONOS[pedido.pago.estado]}
              size={11}
              color="#FFFFFF"
            />
            <Text style={styles.pagoBadgeText}>
              {pagoCfg.label}
              {pedido.pago.estado === "anticipo" &&
                ` (${pedido.pago.anticipoPorcentaje}%)`}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. SECCIÓN CLIENTE Y ACCIÓN WHATSAPP */}
      <View style={styles.clienteRow}>
        <Ionicons name="person-circle-outline" size={18} color={theme.textPrimary} />
        <Text
          style={[styles.clienteNombre, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {pedido.cliente.nombre}
        </Text>

        {pedido.cliente.recurrente && (
          <View
            style={[
              styles.recurrenteBadge,
              { backgroundColor: theme.primary + "1A" },
            ]}
          >
            <Ionicons name="star" size={9} color={theme.primary} />
            <Text style={[styles.recurrenteBadgeText, { color: theme.primary }]}>
              Frecuente
            </Text>
          </View>
        )}

        {Boolean(pedido.cliente.telefono) && (
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleAbrirWhatsapp}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. BARRA DE CARGA / CHECKLIST */}
      {checklistTotal > 0 && (
        <View style={styles.progresoRow}>
          <Ionicons name="checkbox-outline" size={12} color={theme.textSecondary} />
          <View style={[styles.progresoTrack, { backgroundColor: theme.bgPrimary }]}>
            <View
              style={[
                styles.progresoFill,
                {
                  width: `${progreso * 100}%`,
                  backgroundColor: progreso === 1 ? "#22C55E" : theme.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progresoTexto, { color: theme.textSecondary }]}>
            {checklistHecho}/{checklistTotal}
          </Text>
        </View>
      )}

      {/* 4. SECCIÓN INFERIOR: FECHA, ENVÍO, MÉTODO Y PRECIOS */}
      <View
        style={[
          styles.footerContainer,
          {
            borderTopColor: theme.border + "30",
            backgroundColor: theme.bgPrimary + "50",
          },
        ]}
      >
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={prioridad !== "normal" ? prioridadCfg.color : theme.textSecondary}
          />
          <Text
            style={[
              styles.metaText,
              {
                color: prioridad !== "normal" ? prioridadCfg.color : theme.textSecondary,
                fontWeight: prioridad !== "normal" ? "700" : "500",
              },
            ]}
          >
            {pedido.fechaEntregaTexto}
          </Text>
        </View>

        <View style={styles.footerRightGroup}>
          <View style={styles.metaItem}>
            <Ionicons name={iconoTipoEnvio} size={14} color={theme.textSecondary} />
          </View>

          <View style={styles.metaItem}>
            <Ionicons name={iconoMetodoPago} size={14} color={theme.textSecondary} />
          </View>

          <View style={styles.pagoMontoContainer}>
            <Text style={[styles.montoPagadoText, { color: theme.textSecondary }]}>
              {pedido.pago.montoCobrado || 0}
            </Text>

            <Text style={[styles.separadorText, { color: theme.textSecondary }]}>
              /
            </Text>

            <Text style={[styles.montoTotalText, { color: theme.primary }]}>
              {pedido.pago.total}
            </Text>

            <Text style={[styles.monedaText, { color: theme.primary }]}>
              Bs
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 4,
  },
  imageContainer: {
    height: 140,
    width: "100%",
    position: "relative",
    backgroundColor: "#1E293B",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  topOverlayRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codigoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codigoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
  },
  estadoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  bottomOverlayRow: {
    position: "absolute",
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nombrePiezaText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagoBadgeOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 1,
  },
  pagoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  clienteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  clienteNombre: {
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
  recurrenteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recurrenteBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  whatsappBtn: {
    padding: 2,
    marginLeft: 4,
  },
  progresoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  progresoTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progresoFill: {
    height: "100%",
    borderRadius: 2,
  },
  progresoTexto: {
    fontSize: 10,
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
  },
  pagoMontoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  montoPagadoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  separadorText: {
    fontSize: 12,
    fontWeight: "400",
  },
  montoTotalText: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  monedaText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 2,
  },
});

y tengo estos datos: 
[
  {
    "tabla": "clientes",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "telefono",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "direccion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "clientes",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_kwh",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_mano_obra_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_operativo_fijo_mensual",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "horas_laborables_mes",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "tasa_fallo_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "impuesto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "margen_ganancia_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "moneda",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_titular",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "impresora_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "filamento_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "nombre_pieza",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cantidad",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "peso_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_impresion_horas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_preparacion_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_postprocesado_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_material",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_energia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_amortizacion",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mantenimiento",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mano_obra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_subtotal_item",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "codigo_cotizacion",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_contacto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_directo_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_indirecto_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_fallos_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "subtotal_costo_base",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_ganancia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_impuesto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "precio_final",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "margen_ganancia_aplicado_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "token_publico",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "voucher_data",
    "tipo_dato": "jsonb",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "imagen_referencia_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_diseno_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "rol",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "logo_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nombre_comercial",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nit",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "razon_social",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "direccion_fiscal",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ciudad",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "whatsapp",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "instagram",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "facebook",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "sitio_web",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "garantia",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "es_singleton",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ubicacion_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "material",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "capacidad_rollo_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "activo",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color_hex",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "stock_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "proveedor",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "fecha_compra",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "umbral_bajo_stock",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "filamentos",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "modelo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "vida_util_horas",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "potencia_watts",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_mantenimiento_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "activa",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "horas_uso_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "pedido_actual",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "fecha_adquisicion",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "impresoras",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "concepto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "fecha",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "label",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "hecho",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "orden",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "texto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "comprobante_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "fecha",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "verificado",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "codigo_pedido",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pieza_descripcion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "fecha_entrega",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_anticipo_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_monto_cobrado",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_costo",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tracking",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "foto_final_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  }
]

dame un analisis profundos y dime que modificaciones tengo que hacer para que pueda ver mi imagen_cotizacion en mi pedidocards correctamente 
