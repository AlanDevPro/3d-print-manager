//src/features/finanzas/hooks/useRankingClientes.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useEffect, useState } from "react";
import { mapClienteStatsDesdeDB } from "../mappers/finanzasMapper";
import { obtenerRankingClientes } from "../services/finanzasService";
import { ClienteStatsUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

export function useRankingClientes(limite = 4) {
  const { empresaId, rol } = useEmpresaActual();
  const [clientes, setClientes] = useState<ClienteStatsUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const rows = await obtenerRankingClientes(empresaId, limite);
        setClientes(rows.map(mapClienteStatsDesdeDB));
      } catch (error) {
        console.error("Error al cargar ranking de clientes:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId, rol, limite]);

  return { clientes, loading };
}
