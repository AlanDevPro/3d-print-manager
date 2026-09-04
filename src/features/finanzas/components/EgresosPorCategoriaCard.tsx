//src/features/finanzas/components/EgresosPorCategoriaCard.tsx
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SeccionBloque } from "@/components/ui/SeccionBloque";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoriaEgreso } from "../types";

const CATEGORIA_CFG: Record<
  CategoriaEgreso,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  material: {
    label: "Material / Filamento",
    color: "#3B82F6",
    icono: "layers-outline",
  },
  energia: {
    label: "Energía eléctrica",
    color: "#F59E0B",
    icono: "flash-outline",
  },
  repuestos_reimpresion: {
    label: "Repuestos / Reimpresión",
    color: "#EF4444",
    icono: "build-outline",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "#8B5CF6",
    icono: "construct-outline",
  },
  otro: {
    label: "Otro",
    color: "#6B7280",
    icono: "ellipsis-horizontal-circle-outline",
  },
};

interface Props {
  theme: any;
  porCategoria: Record<CategoriaEgreso, number>;
  totalEgresos: number;
}

export function EgresosPorCategoriaCard({
  theme,
  porCategoria,
  totalEgresos,
}: Props) {
  const categorias = (Object.keys(porCategoria) as CategoriaEgreso[])
    .filter((c) => porCategoria[c] > 0)
    .sort((a, b) => porCategoria[b] - porCategoria[a]);

  return (
    <SeccionBloque
      titulo="Egresos por categoría"
      icono="pie-chart-outline"
      theme={theme}
    >
      {categorias.map((cat) => {
        const cfg = CATEGORIA_CFG[cat];
        const pct =
          totalEgresos > 0
            ? Math.round((porCategoria[cat] / totalEgresos) * 100)
            : 0;
        return (
          <View key={cat} style={styles.fila}>
            <View style={styles.header}>
              <Ionicons name={cfg.icono} size={15} color={cfg.color} />
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                {cfg.label}
              </Text>
              <Text style={[styles.monto, { color: theme.textSecondary }]}>
                Bs {porCategoria[cat].toFixed(2)}
              </Text>
            </View>
            <ProgressBar porcentaje={pct} color={cfg.color} />
          </View>
        );
      })}
    </SeccionBloque>
  );
}

const styles = StyleSheet.create({
  fila: { gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 12.5, fontWeight: "600", flex: 1 },
  monto: { fontSize: 12 },
});
