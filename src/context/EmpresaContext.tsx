// src/context/EmpresaContext.tsx
import { mapDbToEmpresa } from "@/features/empresa/mappers/empresaMapper";
import { guardarEmpresaService } from "@/features/empresa/services/empresaService";
import type { EmpresaInfo } from "@/features/empresa/types";
import type { RolEmpresa } from "@/features/finanzas/utils/finanzasAcceso";
import { supabase } from "@/services/supabase/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface EmpresaContextValue {
  empresa: EmpresaInfo | null;
  empresaId: string | null;
  rol: RolEmpresa | null;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  recargarEmpresa: () => Promise<void>;
  guardar: (nuevaInfo: EmpresaInfo) => Promise<void>;
}

interface EmpresaProviderProps {
  children: React.ReactNode;
  userId?: string | null;
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

export function EmpresaProvider({ children, userId }: EmpresaProviderProps) {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [rol, setRol] = useState<RolEmpresa | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEmpresaActual = useCallback(async () => {
    if (!userId) {
      setEmpresa(null);
      setEmpresaId(null);
      setRol(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // 1. Obtener los datos del miembro usando el userId provisto
      const { data: miembro, error: miembroError } = await supabase
        .from("empresa_miembros")
        .select("empresa_id, rol")
        .eq("user_id", userId)
        .eq("estado", "activo")
        .maybeSingle();

      if (miembroError) throw miembroError;

      if (!miembro) {
        setEmpresa(null);
        setEmpresaId(null);
        setRol(null);
        setError("El usuario no pertenece a ninguna empresa activa");
        return;
      }

      setEmpresaId(miembro.empresa_id);
      setRol(miembro.rol as RolEmpresa);

      // 2. Obtener los datos de la empresa vinculada
      const { data: empresaDb, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", miembro.empresa_id)
        .single();

      if (empresaError) throw empresaError;

      const empresaMapeada = mapDbToEmpresa(empresaDb);

      setEmpresa({
        ...empresaMapeada,
        id: empresaDb.id,
      });
    } catch (e: any) {
      console.error("❌ [EmpresaContext] Error al cargar la empresa:", e);
      setError(e.message ?? "Error al cargar los datos de la empresa");
    } finally {
      setCargando(false);
    }
  }, [userId]);

  const guardar = useCallback(
    async (nuevaInfo: EmpresaInfo) => {
      if (!empresaId) {
        throw new Error("No hay un ID de empresa activo para actualizar.");
      }

      setGuardando(true);
      setError(null);

      try {
        const empresaActualizada = await guardarEmpresaService(
          nuevaInfo,
          empresaId
        );

        const empresaFormateada: EmpresaInfo = {
          id: empresaActualizada.id,
          nombreComercial: empresaActualizada.nombre_comercial ?? "",
          nit: empresaActualizada.nit ?? "",
          razonSocial: empresaActualizada.razon_social ?? "",
          direccionFiscal: empresaActualizada.direccion_fiscal ?? "",
          ciudad: empresaActualizada.ciudad ?? "",
          whatsapp: empresaActualizada.whatsapp ?? "",
          instagram: empresaActualizada.instagram ?? "",
          facebook: empresaActualizada.facebook ?? "",
          sitioWeb: empresaActualizada.sitio_web ?? "",
          garantia: empresaActualizada.garantia ?? "",
          logoUrl: empresaActualizada.logo_url ?? "",
        };

        setEmpresa(empresaFormateada);
      } catch (e: any) {
        console.error("❌ [EmpresaContext] Error al guardar la empresa:", e);
        setError(e.message ?? "Error al guardar los cambios de la empresa");
        throw e;
      } finally {
        setGuardando(false);
      }
    },
    [empresaId]
  );

  useEffect(() => {
    cargarEmpresaActual();
  }, [cargarEmpresaActual]);

  // Suscripción Realtime para refrescar la empresa si cambia en la base de datos
  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel(`empresa-realtime-${empresaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "empresas",
          filter: `id=eq.${empresaId}`,
        },
        () => {
          cargarEmpresaActual();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId, cargarEmpresaActual]);

  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        empresaId,
        rol,
        cargando,
        guardando,
        error,
        recargarEmpresa: cargarEmpresaActual,
        guardar,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error(
      "useEmpresa debe ser utilizado dentro de un EmpresaProvider"
    );
  }
  return context;
}

export const useEmpresaActual = useEmpresa;