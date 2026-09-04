// src/features/inventario/components/DetalleItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { sharedStyles } from "../styles/sharedStyles";

type Props = {
  theme: any;
  label: string;
  valor: string | number | null | undefined;
  destacado?: boolean;
  icono?: keyof typeof Ionicons.glyphMap;
};

export function DetalleItem({ theme, label, valor, destacado, icono }: Props) {
  const valorFormateado =
    valor !== null && valor !== undefined && valor !== "" ? valor : "-";

  return (
    <View
      style={[sharedStyles.detalleItem, { backgroundColor: theme.bgSecondary }]}
    >
      <View style={styles.headerRow}>
        {icono && (
          <Ionicons
            name={icono}
            size={14}
            color={destacado ? theme.primary : theme.textSecondary}
          />
        )}
        <Text style={[sharedStyles.detalleLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          sharedStyles.detalleValor,
          { color: destacado ? theme.primary : theme.textPrimary },
        ]}
      >
        {valorFormateado}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
});