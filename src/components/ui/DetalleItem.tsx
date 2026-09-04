//src/components/ui/DetalleItem.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  theme: any;
  label: string;
  valor: string;
  destacado?: boolean;
};

export function DetalleItem({ theme, label, valor, destacado }: Props) {
  return (
    <View style={[styles.item, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.valor,
          { color: destacado ? theme.primary : theme.textPrimary },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { width: "47%", borderRadius: 12, padding: 10, gap: 4 },
  label: { fontSize: 11 },
  valor: { fontSize: 15, fontWeight: "700" },
});
