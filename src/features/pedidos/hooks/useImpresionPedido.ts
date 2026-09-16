// src/features/pedidos/hooks/useImpresionPedido.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  fallarImpresionPedido,
  finalizarImpresionPedido,
  iniciarImpresionPedido,
} from "../services/pedidosService";
import { Pedido } from "../types";

interface UseImpresionPedidoResult {
  progreso: number; // 0 a 1
  gramosActuales: number;
  horasActuales: number;
  imprimiendo: boolean;
  cargando: boolean;
  iniciar: () => Promise<void>;
  marcarFallida: () => Promise<void>;
}

export function useImpresionPedido(
  pedido: Pedido | null,
  onCambio: () => Promise<void>,
): UseImpresionPedidoResult {
  const [progreso, setProgreso] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Override local: refleja de inmediato el resultado de "iniciar" o
  // "marcarFallida" en la UI (botón, barra de progreso) sin depender de que
  // el `pedido` recibido por props ya haya sido refrescado por el padre.
  // Se limpia automáticamente en cuanto cambia el dato "real" (fecha de
  // inicio / estado del pedido), momento en el que volvemos a confiar
  // únicamente en el prop.
  const [overrideImprimiendo, setOverrideImprimiendo] = useState<
    boolean | null
  >(null);

  const finalizadoRef = useRef(false);

  // Acceso seguro a 'impresion' mediante encadenamiento opcional
  const impresion = pedido?.impresion;

  const inicio = impresion?.fechaInicioImpresion;
  const horasPlanificadas =
    impresion?.intentoActual?.horasPlanificadas ??
    impresion?.tiempoImpresionHoras ??
    0;
  const gramosPlanificados =
    impresion?.intentoActual?.gramosPlanificados ??
    impresion?.gramosImpresion ??
    0;

  const imprimiendoReal = Boolean(inicio) && pedido?.estado === "en_impresion";
  const imprimiendo = overrideImprimiendo ?? imprimiendoReal;

  // En cuanto llega un pedido "fresco" (cambió la fecha de inicio o el
  // estado), soltamos el override: ya podemos confiar de nuevo en el prop.
  useEffect(() => {
    setOverrideImprimiendo(null);
  }, [inicio, pedido?.estado]);

  useEffect(() => {
    finalizadoRef.current = false;
    if (!imprimiendo || !inicio || horasPlanificadas <= 0 || !pedido) {
      setProgreso(0);
      return;
    }

    const inicioMs = new Date(inicio).getTime();
    const totalMs = horasPlanificadas * 60 * 60 * 1000;

    const tick = async () => {
      const transcurridoMs = Date.now() - inicioMs;
      const pct = Math.min(1, Math.max(0, transcurridoMs / totalMs));
      setProgreso(pct);

      if (pct >= 1 && !finalizadoRef.current) {
        finalizadoRef.current = true;
        try {
          await finalizarImpresionPedido(pedido.id);
          // Dejamos de "imprimir" de inmediato: evita que la barra siga
          // avanzando o que el botón quede desincronizado mientras llega
          // el pedido recargado.
          setOverrideImprimiendo(false);
          await onCambio();
          Alert.alert(
            "¡Impresión completada!",
            "El pedido pasó a 'Listo para entrega'."
          );
        } catch (e: any) {
          finalizadoRef.current = false;
          Alert.alert(
            "Error",
            e.message || "No se pudo finalizar la impresión."
          );
        }
      }
    };

    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [imprimiendo, inicio, horasPlanificadas, pedido, onCambio]);

  const iniciar = useCallback(async () => {
    if (!pedido || cargando) return;
    try {
      setCargando(true);
      await iniciarImpresionPedido(pedido.id);
      // Ya existe un intento en curso en el backend: reflejarlo de una vez.
      setOverrideImprimiendo(true);
      await onCambio();
      Alert.alert("Impresión iniciada", "Se inició nuevamente la impresión.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo iniciar la impresión.");
    } finally {
      setCargando(false);
    }
  }, [pedido, onCambio, cargando]);

  const marcarFallida = useCallback(async () => {
    // Guard adicional: si ya no hay una impresión en curso (según lo que
    // la propia UI está mostrando) no dejamos disparar el RPC de nuevo,
    // que es justo lo que producía el error "no hay un intento de
    // impresión en progreso para este pedido" al tocar el botón dos veces.
    if (!pedido || cargando || !imprimiendo) return;

    const gramosReales = Math.round(gramosPlanificados * progreso * 100) / 100;
    const horasReales = Math.round(horasPlanificadas * progreso * 100) / 100;

    Alert.alert(
      "Confirmar fallo de impresión",
      `Se descontarán aproximadamente ${gramosReales} g de filamento y ${horasReales} hrs de uso de impresora (consumo hasta el momento del fallo). ¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar fallo",
          style: "destructive",
          onPress: async () => {
            try {
              setCargando(true);
              await fallarImpresionPedido(
                pedido.id,
                gramosReales,
                horasReales
              );
              // Cambiamos el botón y detenemos la barra de progreso de
              // inmediato, sin esperar a que el pedido recargado llegue
              // por props.
              setOverrideImprimiendo(false);
              await onCambio();
              Alert.alert(
                "Impresión detenida",
                "Se registró el fallo y se descontó el material consumido hasta el momento."
              );
            } catch (e: any) {
              Alert.alert(
                "Error",
                e.message || "No se pudo registrar el fallo."
              );
            } finally {
              setCargando(false);
            }
          },
        },
      ]
    );
  }, [
    pedido,
    progreso,
    gramosPlanificados,
    horasPlanificadas,
    onCambio,
    cargando,
    imprimiendo,
  ]);

  const progresoEfectivo = imprimiendo ? progreso : 0;

  return {
    progreso: progresoEfectivo,
    gramosActuales: Math.round(gramosPlanificados * progresoEfectivo * 10) / 10,
    horasActuales: Math.round(horasPlanificadas * progresoEfectivo * 100) / 100,
    imprimiendo,
    cargando,
    iniciar,
    marcarFallida,
  };
}