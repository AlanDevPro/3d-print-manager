import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getConfiguracionUsuario,
  getImpresorasActivas,
  getMaterialesActivos,
  getReglasMargenGanancia, // <-- Asegúrate de tener este servicio en tu API
} from "@/features/materiales/services/materialesService";
import { useCallback, useEffect, useState } from "react";
import { guardarCotizacion } from "../services/cotizacionService";
import {
  ConfiguracionUsuario,
  CotizarFormState,
  Impresora,
  Material,
  ReglaMargenGanancia,
  ResultadoCotizacion,
} from "../types";
import { calcularCotizacion } from "../utils/calcularCotizacion";

const initialForm: CotizarFormState = {
  cliente_nombre: "",
  cliente_contacto: "",
  nombre_pieza: "",
  cantidad: "1",
  peso_gramos: "",
  tiempo_impresion_horas: "",
  tiempo_impresion_minutos: "0",
  tiempo_preparacion_minutos: "15",
  tiempo_postprocesado_minutos: "0",
  impresora_id: "",
  material_id: "",
  margen_ganancia_pct: "", // Dejar en blanco para que la BD aplique la regla por escala
  porcentaje_riesgo: "0",
  precio_personalizacion: "0",
  precio_mayorista: "",
  precio_minorista: "",
  imagen_referencia: "",
  notas: "",
};

export function useCotizacion() {
  const { user } = useAuth();

  const [form, setForm] = useState<CotizarFormState>(initialForm);
  const [impresoras, setImpresoras] = useState<Impresora[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [config, setConfig] = useState<ConfiguracionUsuario | null>(null);
  const [reglasMargen, setReglasMargen] = useState<ReglaMargenGanancia[]>([]);
  const [resultado, setResultado] = useState<ResultadoCotizacion | null>(null);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatosBase = useCallback(async () => {
    if (!user) return;
    setCargandoDatos(true);
    setError(null);
    try {
      // Cargar en paralelo impresoras, materiales, config y reglas de margen por escala
      const [imps, mats, cfg, reglas] = await Promise.all([
        getImpresorasActivas(user.id),
        getMaterialesActivos(user.id),
        getConfiguracionUsuario(user.id),
        getReglasMargenGanancia(user.id), // Fetch a public.reglas_margen_ganancia
      ]);

      setImpresoras(imps);
      setMateriales(mats);
      setConfig(cfg);
      setReglasMargen(reglas || []);

      setForm((prev) => ({
        ...prev,
        impresora_id: imps[0]?.id ?? "",
        material_id: mats[0]?.id ?? "",
        margen_ganancia_pct: "", // Queda vacío para dar prioridad a la tabla reglas_margen_ganancia
      }));
    } catch (e: any) {
      setError(e.message ?? "Error cargando datos base");
    } finally {
      setCargandoDatos(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDatosBase();
  }, [cargarDatosBase]);

  const updateField = (field: keyof CotizarFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResultado(null);
  };

  const validar = (): string | null => {
    if (!form.material_id) return "Selecciona un material";
    if (!Number(form.peso_gramos) || Number(form.peso_gramos) <= 0)
      return "Ingresa un peso válido (g)";
    if (!Number(form.cantidad) || Number(form.cantidad) <= 0)
      return "Ingresa una cantidad válida";

    const horas = Number(form.tiempo_impresion_horas) || 0;
    const minutos = Number(form.tiempo_impresion_minutos) || 0;
    if (horas <= 0 && minutos <= 0) {
      return "Ingresa un tiempo de impresión válido (horas o minutos)";
    }

    if (!form.impresora_id) return "Selecciona una impresora";
    return null;
  };

  const obtenerTiempoImpresionHorasTotal = (): number => {
    const horas = Number(form.tiempo_impresion_horas) || 0;
    const minutos = Number(form.tiempo_impresion_minutos) || 0;
    return horas + minutos / 60;
  };

  const calcular = () => {
    if (!config) return;
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError(null);
    setCalculando(true);

    try {
      const impresora = impresoras.find((i) => i.id === form.impresora_id)!;
      const material = materiales.find((m) => m.id === form.material_id)!;
      const tiempoImpresionTotal = obtenerTiempoImpresionHorasTotal();

      // EVALUACIÓN EXPLÍCITA DEL OVERRIDE MANUAL
      // Se pasa a número únicamente si el usuario escribió manualmente un margen en la UI.
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
          nombre_pieza: form.nombre_pieza || "Pieza 3D",
          cantidad: Number(form.cantidad),
          peso_gramos: Number(form.peso_gramos),
          tiempo_impresion_horas: tiempoImpresionTotal,
          tiempo_preparacion_minutos: Number(
            form.tiempo_preparacion_minutos || 0,
          ),
          tiempo_postprocesado_minutos: Number(
            form.tiempo_postprocesado_minutos || 0,
          ),
          impresora,
          material,
          porcentaje_riesgo: Number(form.porcentaje_riesgo || 0),
          precio_personalizacion: Number(form.precio_personalizacion || 0),
          precio_mayorista: form.precio_mayorista
            ? Number(form.precio_mayorista)
            : undefined,
          precio_minorista: form.precio_minorista
            ? Number(form.precio_minorista)
            : undefined,
        },
        config,
        reglasMargen, // Matriz traída desde public.reglas_margen_ganancia
        margenOverride, // undefined por defecto para dejar actuar a las reglas
      );

      setResultado(res);
    } catch (e: any) {
      setError(e.message ?? "Error al calcular la cotización");
    } finally {
      setCalculando(false);
    }
  };

  const guardar = async () => {
    if (!user || !resultado) return;
    setGuardando(true);
    setError(null);
    try {
      const impresora = impresoras.find((i) => i.id === form.impresora_id)!;
      const material = materiales.find((m) => m.id === form.material_id)!;
      const tiempoImpresionTotal = obtenerTiempoImpresionHorasTotal();

      await guardarCotizacion({
        userId: user.id,
        clienteNombre: form.cliente_nombre || "Cliente General",
        clienteContacto: form.cliente_contacto || null,
        notas: form.notas || null,
        item: {
          nombre_pieza: form.nombre_pieza || "Pieza 3D",
          cantidad: Number(form.cantidad),
          peso_gramos: Number(form.peso_gramos),
          tiempo_impresion_horas: tiempoImpresionTotal,
          tiempo_preparacion_minutos: Number(
            form.tiempo_preparacion_minutos || 0,
          ),
          tiempo_postprocesado_minutos: Number(
            form.tiempo_postprocesado_minutos || 0,
          ),
          impresora,
          material,
        },
        resultado,
      });

      setForm(initialForm);
      setResultado(null);
      await cargarDatosBase();
      return true;
    } catch (e: any) {
      setError(e.message ?? "Error al guardar la cotización");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return {
    form,
    updateField,
    impresoras,
    materiales,
    config,
    reglasMargen,
    resultado,
    cargandoDatos,
    calculando,
    guardando,
    error,
    calcular,
    guardar,
  };
}
