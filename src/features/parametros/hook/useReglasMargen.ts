// src/features/parametros/hooks/useReglasMargen.ts
import { useState } from "react";
import { ReglaMargenGanancia } from "../types";
import { parametrosService } from "../services/parametrosService";
import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";

interface UseReglasMargenProps {
  reglas: ReglaMargenGanancia[];
  onReglasChange: (reglas: ReglaMargenGanancia[]) => void;
  userId?: string;
}

export function useReglasMargen({
  reglas,
  onReglasChange,
  userId,
}: UseReglasMargenProps) {
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [porcentaje, setPorcentaje] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { recargar } = useConfiguracionTaller();

  const toggleFormulario = () => setMostrandoForm((prev) => !prev);

  const agregarRegla = async () => {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    try {
      if (userId) {
        const nuevaReglaBD = await parametrosService.addReglaMargen(userId, {
          nombre: nombre.trim(),
          porcentaje,
        });
        onReglasChange([...reglas, nuevaReglaBD]);
        await recargar(); // Sincroniza el estado global inmediatamente
      } else {
        const nuevaReglaLocal: ReglaMargenGanancia = {
          id: Date.now().toString(),
          nombre: nombre.trim(),
          porcentaje,
        };
        onReglasChange([...reglas, nuevaReglaLocal]);
      }
      setNombre("");
      setPorcentaje(30);
      setMostrandoForm(false);
    } catch (error) {
      console.error("Error al guardar la regla de margen:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliminarRegla = async (id: string) => {
    try {
      if (userId) {
        await parametrosService.deleteReglaMargen(id);
        await recargar(); // Invalida y recupera la lista real desde Supabase
      }
      onReglasChange(reglas.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error al eliminar la regla de margen:", error);
    }
  };

  return {
    mostrandoForm,
    toggleFormulario,
    nombre,
    setNombre,
    porcentaje,
    setPorcentaje,
    agregarRegla,
    eliminarRegla,
    isSubmitting,
  };
}