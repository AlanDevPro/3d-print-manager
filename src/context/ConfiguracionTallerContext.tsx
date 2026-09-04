import { mapDbToParametros } from "@/features/parametros/mappers/parametrosMapper";
import {
  PARAMETROS_VACIOS,
  ParametrosOperativos,
} from "@/features/parametros/types";
import { supabase } from "@/services/supabase/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface DatosTallerCompletos {
  configuracion: any | null;
  impresoras: any[];
  filamentos: any[];
  reglasMargen: any[];
}

export async function cargarDatosTaller(
  empresaId: string,
): Promise<DatosTallerCompletos> {
  const { data: userData } = await supabase.auth.getUser();

  // Construcción de consultas dinámicas con fallback de tenant
  let impresorasQuery = supabase
    .from("impresoras")
    .select("*")
    .order("marca", { ascending: true });

  let filamentosQuery = supabase
    .from("filamentos")
    .select("*")
    .order("material", { ascending: true });

  // 🟢 Ordenado por nombre tras eliminar los campos de rango
  let reglasQuery = supabase
    .from("reglas_margen_ganancia")
    .select("*")
    .order("nombre", { ascending: true });

  let configQuery = supabase.from("configuracion_empresa").select("*");

  if (empresaId) {
    impresorasQuery = impresorasQuery.eq("empresa_id", empresaId);
    filamentosQuery = filamentosQuery.eq("empresa_id", empresaId);
    reglasQuery = reglasQuery.eq("empresa_id", empresaId);
    configQuery = configQuery.eq("empresa_id", empresaId);
  }

  const [configRes, impresorasRes, filamentosRes, reglasRes] =
    await Promise.all([
      configQuery.maybeSingle(),
      impresorasQuery,
      filamentosQuery,
      reglasQuery,
    ]);

  if (configRes.error && configRes.error.code !== "PGRST116") {
    console.warn(`configuracion_empresa error: ${configRes.error.message}`);
  }

  const filamentosFiltrados = (filamentosRes.data ?? []).filter(
    (item: any) => item.activo !== false && item.is_active !== false,
  );

  const impresorasFiltradas = (impresorasRes.data ?? []).filter(
    (item: any) => item.activa !== false && item.is_active !== false,
  );

  return {
    configuracion: configRes.data ?? null,
    impresoras: impresorasFiltradas,
    filamentos: filamentosFiltrados,
    reglasMargen: reglasRes.data ?? [],
  };
}

interface ConfiguracionTallerContextValue {
  parametros: ParametrosOperativos;
  configuracionRaw: any | null;
  filamentos: any[];
  impresorasRaw: any[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  actualizarParametrosLocal: (parametros: ParametrosOperativos) => void;
}

export interface ConfiguracionTallerProviderProps {
  empresaId?: string | null;
  userId?: string | null;
  children: React.ReactNode;
}

const ConfiguracionTallerContext =
  createContext<ConfiguracionTallerContextValue | null>(null);

export function ConfiguracionTallerProvider({
  empresaId,
  userId,
  children,
}: ConfiguracionTallerProviderProps) {
  const [parametros, setParametros] =
    useState<ParametrosOperativos>(PARAMETROS_VACIOS);
  const [configuracionRaw, setConfiguracionRaw] = useState<any | null>(null);
  const [filamentos, setFilamentos] = useState<any[]>([]);
  const [impresorasRaw, setImpresorasRaw] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idObjetivo = empresaId ?? userId ?? "";

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await cargarDatosTaller(idObjetivo);
      setConfiguracionRaw(datos.configuracion);
      setParametros(
        mapDbToParametros(
          datos.configuracion,
          datos.impresoras,
          datos.reglasMargen,
        ),
      );
      setFilamentos(datos.filamentos);
      setImpresorasRaw(datos.impresoras);
    } catch (err: any) {
      setError(err.message ?? "Error al cargar configuración del taller.");
    } finally {
      setCargando(false);
    }
  }, [idObjetivo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarParametrosLocal = (nuevos: ParametrosOperativos) => {
    setParametros(nuevos);
  };

  return (
    <ConfiguracionTallerContext.Provider
      value={{
        parametros,
        configuracionRaw,
        filamentos,
        impresorasRaw,
        cargando,
        error,
        recargar: cargar,
        actualizarParametrosLocal,
      }}
    >
      {children}
    </ConfiguracionTallerContext.Provider>
  );
}

export function useConfiguracionTaller() {
  const ctx = useContext(ConfiguracionTallerContext);
  if (!ctx) {
    throw new Error(
      "useConfiguracionTaller debe usarse dentro de ConfiguracionTallerProvider",
    );
  }
  return ctx;
}