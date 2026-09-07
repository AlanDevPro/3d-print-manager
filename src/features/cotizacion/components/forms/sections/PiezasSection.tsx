// src/features/cotizacion/components/forms/sections/PiezasSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import { useTheme } from "@/hooks/useTheme";

import { PiezaCamposForm } from "./PiezaCamposForm";
import { PiezaTabsBar } from "./PiezaTabsBar";

type PiezasSectionProps = Pick<
  UseCotizacionReturn,
  | "piezas"
  | "piezaActivaId"
  | "updatePiezaField"
  | "agregarPieza"
  | "eliminarPieza"
  | "seleccionarPieza"
>;

export function PiezasSection({
  piezas,
  piezaActivaId,
  updatePiezaField,
  agregarPieza,
  eliminarPieza,
  seleccionarPieza,
}: PiezasSectionProps) {
  const { theme } = useTheme();
  const piezaActiva = piezas.find((p) => p.id === piezaActivaId) ?? piezas[0];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Ionicons name="shapes-outline" size={18} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Datos por pieza
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={agregarPieza}
        >
          <Ionicons name="add-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Otra pieza</Text>
        </Pressable>
      </View>

      <PiezaTabsBar
        piezas={piezas}
        piezaActivaId={piezaActivaId}
        onSeleccionar={seleccionarPieza}
        onEliminar={eliminarPieza}
      />

      {piezaActiva && (
        <PiezaCamposForm
          pieza={piezaActiva}
          onUpdateField={updatePiezaField}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15, fontWeight: "700" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});