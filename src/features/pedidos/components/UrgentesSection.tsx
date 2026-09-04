// src/features/pedidos/components/UrgentesSection.tsx
// "Piezas / pedidos que necesitan atención" — se oculta sola si no hay nada urgente.

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pedido } from "../types";
import { UrgentePill } from "./UrgentePill";

interface UrgentesSectionProps {
  theme: any;
  pedidos: Pedido[];
  onSeleccionar: (pedido: Pedido) => void;
}

export function UrgentesSection({
  theme,
  pedidos,
  onSeleccionar,
}: UrgentesSectionProps) {
  if (pedidos.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
        Requieren atención hoy
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.urgentesScroll}
      >
        {pedidos.map((p) => (
          <UrgentePill
            key={p.id}
            pedido={p}
            theme={theme}
            onPress={() => onSeleccionar(p)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  seccionTitulo: { fontSize: 15, fontWeight: "700" },
  urgentesScroll: { gap: 8, paddingRight: 16 },
});
