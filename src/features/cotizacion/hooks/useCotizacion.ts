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
      setResultado(null);
    },
    [],
  );

  const updatePiezaField = useCallback(
    (id: string, field: keyof Omit<PiezaFormState, "id">, value: string) => {
      setPiezas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
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
  };
}

export type UseCotizacionReturn = ReturnType<typeof useCotizacion>;