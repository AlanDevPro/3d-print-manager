import { useState } from "react";
import { Alert } from "react-native";
import { useEmpresaActual } from "@/context/EmpresaContext";
import {
  buildVoucherPublicUrl,
  guardarVoucherPublico,
} from "@/features/cotizacion/services/voucherPublicoService";
import type { ResultadoCotizacion } from "@/features/cotizacion/types";
import { mapResultadoToVoucher } from "@/features/cotizacion/utils/mapResultadoToVoucher";
import { uriToBase64DataUri } from "@/utils/imageToBase64";
import { abrirWhatsappConEnlace } from "@/utils/whatsapp";
import { esErrorTelefonoDuplicado, extraerId } from "@/features/cotizacion/utils/resumenHelpers";

interface UseEnviarVoucherClienteParams {
  resultado: ResultadoCotizacion | null;
  cantidad: number;
  especificaciones?: any;
  clienteId?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  onGuardarCliente?: (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => Promise<string | { id?: string } | void>;
  onGuardarCotizacion?: (options?: { cliente_id?: string; imagenUri?: string | null }) => Promise<any>;
}

export function useEnviarVoucherCliente({
  resultado,
  cantidad,
  especificaciones,
  clienteId,
  nombreCliente = "",
  telefonoCliente = "",
  onGuardarCliente,
  onGuardarCotizacion,
}: UseEnviarVoucherClienteParams) {
  const { empresa } = useEmpresaActual();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEnviar = Boolean(resultado && telefonoCliente.trim());

  const enviar = async () => {
    if (generando || !resultado) return;

    if (!telefonoCliente.trim()) {
      setError("Ingresa el teléfono del cliente para poder enviar la cotización.");
      return;
    }

    try {
      setError(null);
      setGenerando(true);

      let clienteIdResuelto: string | undefined = clienteId;
      let cotizacionIdResuelta: string | undefined;

      // 1. Guardar/Vincular Cliente
      if (onGuardarCliente) {
        try {
          const resGuardar = await onGuardarCliente({
            id: clienteId,
            nombre_razon_social: nombreCliente,
            telefono: telefonoCliente,
          });
          clienteIdResuelto = extraerId(resGuardar) ?? clienteIdResuelto;
        } catch (errCliente: any) {
          const mensaje =
            errCliente?.message ||
            "El teléfono ya pertenece a otro cliente o hubo un error al registrarlo.";

          if (esErrorTelefonoDuplicado(errCliente)) {
            Alert.alert("Teléfono registrado a otro cliente", mensaje, [{ text: "Corregir datos" }]);
          } else {
            Alert.alert("No se pudo guardar el cliente", mensaje, [{ text: "Entendido" }]);
          }
          setError(mensaje);
          return;
        }
      }

      if (!clienteIdResuelto) {
        const mensaje = "No se pudo vincular un cliente válido. Corrija la información e intente nuevamente.";
        Alert.alert("Cliente no identificado", mensaje);
        setError(mensaje);
        return;
      }

      // 2. Guardar Cotización
      if (onGuardarCotizacion) {
        const resCotizacion = await onGuardarCotizacion({
          cliente_id: clienteIdResuelto,
          imagenUri: especificaciones?.imagenUri ?? null,
        });
        cotizacionIdResuelta = extraerId(resCotizacion);
      }

      if (!cotizacionIdResuelta) {
        Alert.alert("Cotización no guardada", "No se pudo vincular la cotización para publicar el voucher.");
        setError("Falta el ID de la cotización para publicar el voucher.");
        return;
      }

      // 3. Preparar imágenes y datos del Voucher
      const logoBase64 = await uriToBase64DataUri(empresa?.logoUrl);
      const empresaConLogo = empresa ? { ...empresa, logoUrl: logoBase64 ?? empresa.logoUrl } : empresa;

      const productImageBase64 = especificaciones?.imagenUri
        ? await uriToBase64DataUri(especificaciones.imagenUri)
        : undefined;

      const especificacionesConImagen = especificaciones
        ? { ...especificaciones, imagenUri: productImageBase64 ?? especificaciones.imagenUri }
        : especificaciones;

      const voucherData = mapResultadoToVoucher(resultado, {
        cantidad,
        especificaciones: especificacionesConImagen,
        empresa: empresaConLogo,
      });

      // 4. Guardar Voucher Público y Enviar WhatsApp
      const token = await guardarVoucherPublico(cotizacionIdResuelta, voucherData);
      const urlPublica = buildVoucherPublicUrl(token);
      const nombrePiezasResumen =
        resultado.piezas.length === 1
          ? resultado.piezas[0].nombre_pieza
          : `${resultado.piezas.length} piezas`;
      const mensaje = `Hola ${nombreCliente || ""}, aquí tienes tu cotización de "${
        nombrePiezasResumen || "tu pedido"
      }": ${urlPublica}`.trim();

      await abrirWhatsappConEnlace(telefonoCliente, mensaje);
    } catch (e: any) {
      const errorMessage =
        e?.message || e?.error_description || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
      Alert.alert("Error General", `Ocurrió un inconveniente: ${errorMessage}`);
      setError(`Error al procesar: ${errorMessage}`);
    } finally {
      setGenerando(false);
    }
  };

  return { enviar, generando, error, puedeEnviar };
}