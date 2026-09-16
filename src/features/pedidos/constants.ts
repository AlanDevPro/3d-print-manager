// src/features/pedidos/constants.ts
// Configuración visual estática del módulo Pedidos (colores, labels, iconos).
// Si mañana agregas un estado nuevo, SOLO tocas este archivo.

import { Ionicons } from "@expo/vector-icons";
import {
  EstadoPago,
  EstadoPedido,
  MetodoPago,
  Prioridad,
  TipoEnvio,
} from "./types";

export interface ConfigEstado {
  key: EstadoPedido;
  label: string;
  color: string;
  icono: keyof typeof Ionicons.glyphMap;
}

export const ESTADOS: ConfigEstado[] = [
  {
    key: "pendiente",
    label: "Pendiente",
    color: "#F59E0B",
    icono: "time-outline",
  },
  {
    key: "en_impresion",
    label: "En Impresión",
    color: "#3B82F6",
    icono: "cube-outline",
  },
  {
    key: "listo",
    label: "Listo para Entrega",
    color: "#8B5CF6",
    icono: "checkmark-circle-outline",
  },
  {
    key: "entregado",
    label: "Entregado",
    color: "#22C55E",
    icono: "paper-plane-outline",
  },
];

export const PAGO_CONFIG: Record<
  EstadoPago,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  sin_pagar: {
    label: "Sin pagar",
    color: "#EF4444",
    icono: "alert-circle-outline",
  },
  anticipo: {
    label: "Anticipo",
    color: "#F59E0B",
    icono: "hourglass-outline",
  },
  pagado: {
    label: "Pagado",
    color: "#22C55E",
    icono: "checkmark-done-circle-outline",
  },
};

export const METODO_LABEL: Record<MetodoPago, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  qr: "QR",
};

export const ENVIO_CONFIG: Record<
  TipoEnvio,
  { label: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  recoger: { label: "Recogida local", icono: "storefront-outline" },
  domicilio: { label: "Envío a domicilio", icono: "bicycle-outline" },
};

export const PRIORIDAD_CONFIG: Record<
  Prioridad,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  normal: { label: "En plazo", color: "#94A3B8", icono: "calendar-outline" },
  urgente: { label: "Entrega hoy", color: "#F59E0B", icono: "alert-outline" },
  vencido: { label: "Vencido", color: "#EF4444", icono: "warning-outline" },
};

export const estadoConfig = (estado: EstadoPedido) =>
  ESTADOS.find((e) => e.key === estado)!;