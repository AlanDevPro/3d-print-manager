// src/features/pedidos/hooks/useRecordatorioPdf.ts

import { useState } from "react";
import { Alert } from "react-native";
import { generarYCompartirRecordatorioPdf } from "../services/recordatorioPdfService";
import { Pedido } from "../types";

export function useRecordatorioPdf() {
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const generarRecordatorio = async (pedido: Pedido, qrUrl?: string) => {
    try {
      setGenerandoPdf(true);
      await generarYCompartirRecordatorioPdf(pedido, qrUrl);
    } catch (error: any) {
      console.error("Error al generar PDF de recordatorio:", error);
      Alert.alert(
        "Error",
        "No se pudo generar ni compartir el PDF del recordatorio.",
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

  return {
    generarRecordatorio,
    generandoPdf,
  };
}
