//src/features/finanzas/hooks/useRankingProductos.ts
import { useEmpresaActual } from "@/context/EmpresaContext";
import { useEffect, useState } from "react";
import { mapProductoRentabilidadDesdeDB } from "../mappers/finanzasMapper";
import { obtenerRankingProductos } from "../services/finanzasService";
import { ProductoRentabilidadUI } from "../types";
import { puedeVerFinanzas } from "../utils/finanzasAcceso";

export function useRankingProductos(limite = 5) {
  const { empresaId, rol } = useEmpresaActual();
  const [productos, setProductos] = useState<ProductoRentabilidadUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !puedeVerFinanzas(rol)) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const rows = await obtenerRankingProductos(empresaId, limite);
        setProductos(rows.map(mapProductoRentabilidadDesdeDB));
      } catch (error) {
        console.error("Error al cargar ranking de productos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaId, rol, limite]);

  return { productos, loading };
}
