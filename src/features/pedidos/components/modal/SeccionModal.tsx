// src/features/pedidos/components/modal/SeccionModal.tsx
// Genérico y reutilizable: cualquier modal de detalle (pedidos, cotizaciones,
// comprobantes...) puede usar este mismo "envoltorio" de sección.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SeccionModalProps {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  theme: any;
  children: React.ReactNode;
}

export function SeccionModal({
  titulo,
  icono,
  theme,
  children,
}: SeccionModalProps) {
  return (
    <View style={styles.modalSeccion}>
      <View style={styles.modalSeccionHeader}>
        <Ionicons name={icono} size={16} color={theme.primary} />
        <Text style={[styles.modalSeccionTitulo, { color: theme.textPrimary }]}>
          {titulo}
        </Text>
      </View>
      <View
        style={[
          styles.modalSeccionCard,
          { backgroundColor: theme.bgSecondary },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalSeccion: { gap: 8, marginBottom: 16 },
  modalSeccionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  modalSeccionTitulo: { fontSize: 14.5, fontWeight: "700" },
  modalSeccionCard: { borderRadius: 14, padding: 14, gap: 10 },
});
