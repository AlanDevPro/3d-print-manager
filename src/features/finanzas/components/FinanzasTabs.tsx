//src/features/finanzas/components/FinanzasTabs.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type FinanzasTab = "resumen" | "ingresos" | "egresos";

interface Props {
  theme: any;
  tab: FinanzasTab;
  onCambiar: (t: FinanzasTab) => void;
}

const TABS: { key: FinanzasTab; label: string }[] = [
  { key: "resumen", label: "Resumen" },
  { key: "ingresos", label: "Ingresos" },
  { key: "egresos", label: "Egresos" },
];

export function FinanzasTabs({ theme, tab, onCambiar }: Props) {
  return (
    <View style={[styles.row, { backgroundColor: theme.bgSecondary }]}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[
            styles.btn,
            tab === t.key && { backgroundColor: theme.bgPrimary },
          ]}
          onPress={() => onCambiar(t.key)}
        >
          <Text
            style={{
              color: tab === t.key ? theme.primary : theme.textSecondary,
              fontSize: 12.5,
              fontWeight: tab === t.key ? "700" : "500",
            }}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderRadius: 12, padding: 4 },
  btn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
});
