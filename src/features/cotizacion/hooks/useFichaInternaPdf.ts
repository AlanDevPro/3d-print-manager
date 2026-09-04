//src/features/cotizacion/hooks/useFichaInternaPdf.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { generarFichaInternaPdf } from "../services/fichaInternaPdfService";
import type { FichaInternaData } from "../types";

export function useFichaInternaPdf() {
  const [generando, setGenerando] = useState(false);

  const descargarFichaInterna = useCallback(
    async (data: FichaInternaData, fileName?: string) => {
      setGenerando(true);
      try {
        return await generarFichaInternaPdf(data, { fileName });
      } catch (error) {
        console.error("Error generando ficha interna PDF:", error);
        Alert.alert(
          "Error",
          "No se pudo generar la ficha interna. Intenta nuevamente.",
        );
        return null;
      } finally {
        setGenerando(false);
      }
    },
    [],
  );

  return { descargarFichaInterna, generando };
}
