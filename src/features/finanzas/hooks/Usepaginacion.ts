import { useEffect, useMemo, useState } from "react";

interface OpcionesPaginacion {
  porPagina?: number;
  /** Cuando este valor cambia (ej. cambiaste de día/mes filtrado) se vuelve a la página 1. */
  resetKey?: string | number;
}

export function usePaginacion<T>(
  items: T[],
  opciones: OpcionesPaginacion = {},
) {
  const { porPagina = 10, resetKey } = opciones;
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, items.length]);

  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));

  const itemsPagina = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return items.slice(inicio, inicio + porPagina);
  }, [items, pagina, porPagina]);

  return {
    pagina,
    totalPaginas,
    itemsPagina,
    irAPagina: (p: number) => setPagina(Math.min(Math.max(1, p), totalPaginas)),
  };
}
