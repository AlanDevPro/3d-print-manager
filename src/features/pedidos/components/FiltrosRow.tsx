// src/features/pedidos/components/FiltrosRow.tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ESTADOS } from "../constants";
import { EstadoPedido } from "../types";
import { FiltroChip } from "./FiltroChip";

interface FiltrosRowProps {
  theme: any;
  filtro: EstadoPedido | "todos";
  conteos: Record<string, number>;
  onSeleccionar: (filtro: EstadoPedido | "todos") => void;
}

export function FiltrosRow({
  theme,
  filtro,
  conteos,
  onSeleccionar,
}: FiltrosRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtrosRow}
    >
      <FiltroChip
        icono="apps-outline"
        label={`Todos (${conteos.todos ?? 0})`}
        activo={filtro === "todos"}
        color={theme.primary}
        theme={theme}
        onPress={() => onSeleccionar("todos")}
      />
      {ESTADOS.map((e) => (
        <FiltroChip
          key={e.key}
          icono={e.icono} // Asegúrate de definir 'icono' en tus constantes (ej: 'cube-outline', 'time-outline', 'checkmark-done-outline')
          label={`${e.label} (${conteos[e.key] ?? 0})`}
          activo={filtro === e.key}
          color={e.color}
          theme={theme}
          onPress={() => onSeleccionar(e.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filtrosRow: { gap: 8, paddingRight: 16, paddingBottom: 4 },
});