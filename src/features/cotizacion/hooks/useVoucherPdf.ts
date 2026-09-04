//src/features/cotizacion/hooks/useVoucherPdf.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { generarVoucherPdf } from "../services/voucherPdfService";
import type { VoucherData } from "../types";

export function useVoucherPdf() {
  const [generando, setGenerando] = useState(false);

  const descargarVoucher = useCallback(
    async (data: VoucherData, fileName?: string) => {
      setGenerando(true);
      try {
        return await generarVoucherPdf(data, { fileName });
      } catch (error) {
        console.error("Error generando voucher PDF:", error);
        Alert.alert(
          "Error",
          "No se pudo generar el PDF del voucher. Intenta nuevamente.",
        );
        return null;
      } finally {
        setGenerando(false);
      }
    },
    [],
  );

  return { descargarVoucher, generando };
}
