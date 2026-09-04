// src/features/inventario/constants.ts
import { Ionicons } from "@expo/vector-icons";
import type { EstadoImpresora } from "./types";

export const ESTADO_IMPRESORA_CFG: Record<
  EstadoImpresora,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  imprimiendo: {
    label: "Imprimiendo",
    color: "#3B82F6",
    icono: "print-outline",
  },
  inactiva: {
    label: "Inactiva",
    color: "#9CA3AF",
    icono: "pause-circle-outline",
  },
  mantenimiento: {
    label: "En Mantenimiento",
    color: "#F59E0B",
    icono: "build-outline",
  },
};
