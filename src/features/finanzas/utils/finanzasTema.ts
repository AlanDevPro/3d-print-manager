// src/features/finanzas/utils/finanzasTema.ts
//
// Los gráficos ya no traen su propia paleta oscura hardcodeada: toman las
// superficies del theme de la app y sólo mantienen los colores semánticos
// (verde ingresos / rojo egresos / azul margen) definidos en constantes.ts.
//
// Si tu theme ya expone `bgSecondary` / `border` / `gridLine`, se usan tal cual;
// los `??` son sólo una red de seguridad.

import { PALETA_GRAFICOS } from "../constantes";

export function coloresFinanzas(theme: any) {
  return {
    ...PALETA_GRAFICOS,
    card: theme?.bgSecondary ?? theme?.cardBg ?? theme?.surface ?? "#1A2030",
    border: theme?.border ?? theme?.borderColor ?? "#262E42",
    gridLine: theme?.border ?? "#2A3245",
    textPrimary: theme?.textPrimary ?? "#F5F7FA",
    textSecondary: theme?.textSecondary ?? "#8A93A6",
    highlight: "rgba(255,255,255,0.06)",
    trackBar: "rgba(255,255,255,0.08)",
  };
}

export type ColoresFinanzas = ReturnType<typeof coloresFinanzas>;
