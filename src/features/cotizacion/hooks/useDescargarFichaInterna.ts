// src/features/cotizacion/hooks/useDescargarFichaInterna.ts
import { useState } from "react";
import { Alert } from "react-native";
import { useFichaInternaPdf } from "@/features/cotizacion/hooks/useFichaInternaPdf";
import { mapResultadoToFichaInterna } from "@/features/cotizacion/utils/mapResultadoToFichaInterna";
import { uriToBase64DataUri } from "@/utils/imageToBase64";
import type { ResultadoCotizacion } from "@/features/cotizacion/types";

export function useDescargarFichaInterna(resultado: ResultadoCotizacion | null, cantidad: number, especificaciones: any) {
  const { descargarFichaInterna, generando } = useFichaInternaPdf();
  const [error, setError] = useState<string | null>(null);

  const descargar = async () => {
    if (!resultado || !especificaciones || generando) return;
    try {
      const productImageBase64 = especificaciones.imagenUri
        ? await uriToBase64DataUri(especificaciones.imagenUri)
        : undefined;

      const fichaData = mapResultadoToFichaInterna(resultado, {
        cantidad,
        especificaciones: { ...especificaciones, imagenUri: productImageBase64 },
      });

      await descargarFichaInterna(fichaData);
    } catch (e: any) {
      const errorMessage = e?.message || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
      setError(`Error Ficha Interna: ${errorMessage}`);
      Alert.alert("Error al generar ficha interna", errorMessage);
    }
  };

  return { descargar, generando, error };
}