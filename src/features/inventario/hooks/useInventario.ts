import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContextoUsuario } from "../services/inventarioService";
import * as inventarioService from "../services/inventarioService";
import type {
  Filamento,
  Impresora,
  NuevaImpresora,
  NuevoFilamento,
  PiezaStock,
} from "../types";

export function useInventario() {
  const [contexto, setContexto] = useState<ContextoUsuario | null>(null);
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);
  const [impresoras, setImpresoras] = useState<Impresora[]>([]);
  const [piezas, setPiezas] = useState<PiezaStock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTodo = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const ctx = await inventarioService.obtenerContextoUsuario();
      setContexto(ctx);

      const [fils, imps, pzs] = await Promise.all([
        inventarioService.obtenerFilamentos(ctx.empresaId),
        inventarioService.obtenerImpresoras(ctx.empresaId),
        inventarioService.obtenerPiezasStock(ctx.userId),
      ]);

      setFilamentos(fils);
      setImpresoras(imps);
      setPiezas(pzs);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el inventario",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const esAdmin = useMemo(() => contexto?.rol === "admin", [contexto]);

  const filamentosBajoStock = useMemo(
    () => filamentos.filter((f) => f.stockGramos <= f.umbralBajoStock),
    [filamentos],
  );

  const agregarFilamento = useCallback(
    async (nuevo: NuevoFilamento) => {
      if (!contexto || contexto.rol !== "admin") {
        throw new Error("Solo los administradores pueden registrar filamentos");
      }
      const creado = await inventarioService.crearFilamento(
        nuevo,
        contexto.empresaId,
      );
      setFilamentos((prev) => [creado, ...prev]);
    },
    [contexto],
  );

  const agregarImpresora = useCallback(
    async (nueva: NuevaImpresora) => {
      if (!contexto || contexto.rol !== "admin") {
        throw new Error("Solo los administradores pueden registrar impresoras");
      }
      const creada = await inventarioService.crearImpresora(
        nueva,
        contexto.empresaId,
      );
      setImpresoras((prev) => [creada, ...prev]);
    },
    [contexto],
  );

  return {
    filamentos,
    impresoras,
    piezas,
    cargando,
    error,
    esAdmin,
    filamentosBajoStock,
    agregarFilamento,
    agregarImpresora,
    recargar: cargarTodo,
  };
}
