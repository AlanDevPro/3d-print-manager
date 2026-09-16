import { useCallback, useEffect, useState } from "react";

// ⚠️ Ajusta esta ruta si tu cliente de Supabase vive en otro archivo (ej. "@/src/config/supabase")
import { supabase } from "@/config/supabase";
import { useEmpresaActual } from "@/context/EmpresaContext";
import { EgresoUI, IngresoUI } from "../types";

type TipoMovimiento = "ingreso" | "egreso";

const TABLA: Record<TipoMovimiento, string> = {
  ingreso: "ingresos",
  egreso: "egresos",
};

function rangoDelMes(anio: number, mes: number) {
  const inicio = new Date(anio, mes, 1);
  const fin = new Date(anio, mes + 1, 1);
  const aIso = (f: Date) => f.toISOString().slice(0, 10);
  return { desde: aIso(inicio), hasta: aIso(fin) };
}

/**
 * Trae los movimientos de un mes puntual (anio/mes 0-11).
 * ⚠️ Si ya tienes un mapper propio (ej. mapIngresoDbToUI) para pasar de fila de BD a
 * IngresoUI/EgresoUI, reemplaza el `data as ...` de abajo por ese mapper para mantener
 * consistencia con useFinanzasResumen.
 */
export function useMovimientosPorMes(
  tipo: TipoMovimiento,
  anio: number,
  mes: number,
) {
  // ⚠️ Ajusta "empresa.id" si tu EmpresaContext expone el id con otro nombre
  const { empresa } = useEmpresaActual() as any;
  const empresaId = empresa?.id;

  const [movimientos, setMovimientos] = useState<(IngresoUI | EgresoUI)[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    const { desde, hasta } = rangoDelMes(anio, mes);

    const { data, error } = await supabase
      .from(TABLA[tipo])
      .select("*")
      .eq("empresa_id", empresaId)
      .gte("fecha", desde)
      .lt("fecha", hasta)
      .order("fecha", { ascending: false });

    if (!error && data) {
      setMovimientos(data as (IngresoUI | EgresoUI)[]);
    }
    setLoading(false);
  }, [tipo, anio, mes, empresaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { movimientos, loading, refetch: cargar };
}
