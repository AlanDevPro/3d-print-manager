// src/features/cotizacion/components/forms/sections/MargenGananciaSelector.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { useTheme } from "@/hooks/useTheme";
import type { ReglaMargen } from "@/features/cotizacion/types/formTypes";

interface MargenGananciaSelectorProps {
  reglasMargen: ReglaMargen[];
  reglaMargenId?: string;
  margenGananciaPct?: string;
  onSeleccionar: (regla: ReglaMargen) => void;
}

export function MargenGananciaSelector({
  reglasMargen,
  reglaMargenId,
  margenGananciaPct,
  onSeleccionar,
}: MargenGananciaSelectorProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={styles.labelGroup}>
        <Ionicons name="trending-up-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Utilidad (Margen de ganancia)</Text>
      </View>

      {reglasMargen.length === 0 ? (
        <EmptyStateCard
          icon="pie-chart-outline"
          title="Sin reglas de margen"
          description="No hay reglas de margen de ganancia configuradas. Es necesario definir las reglas para calcular la utilidad."
          actionIcon="settings-outline"
          actionText="Configurar en ajustes"
        />
      ) : (
        <View style={styles.chipsRow}>
          {reglasMargen.map((regla) => {
            const isSelected =
              reglaMargenId === regla.id ||
              (!reglaMargenId && Number(margenGananciaPct) === regla.margen_ganancia_pct);
            return (
              <SelectableChip
                key={regla.id}
                label={`${regla.nombre} (${regla.margen_ganancia_pct}%)`}
                selected={isSelected}
                onPress={() => onSeleccionar(regla)}
                showIcon
              />
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  labelGroup: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 6 },
});