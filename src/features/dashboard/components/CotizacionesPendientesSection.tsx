// src/features/dashboard/components/CotizacionesPendientesSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLOR_LIBRE } from "../constants/colors";
import { CotizacionUI } from "../types";
import { CotizacionCard } from "./CotizacionCard";

type Props = { theme: any; cotizaciones: CotizacionUI[] };

export function CotizacionesPendientesSection({ theme, cotizaciones }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.headerRow}>
        <Text style={[styles.titulo, { color: theme.textPrimary }]}>
          Necesitan atención
        </Text>
        <TouchableOpacity onPress={() => router.push?.("/cotizaciones" as any)}>
          <Text style={[styles.verTodo, { color: theme.primary }]}>
            Ver todas
          </Text>
        </TouchableOpacity>
      </View>

      {cotizaciones.length === 0 ? (
        <View
          style={[styles.sinPendientes, { backgroundColor: theme.bgSecondary }]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={COLOR_LIBRE}
          />
          <Text
            style={[styles.sinPendientesTexto, { color: theme.textSecondary }]}
          >
            No tienes cotizaciones pendientes 🎉
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {cotizaciones.map((c) => (
            <CotizacionCard key={c.id} cotizacion={c} theme={theme} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: { fontSize: 16, fontWeight: "700" },
  verTodo: { fontSize: 12, fontWeight: "700" },
  sinPendientes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 14,
  },
  sinPendientesTexto: { fontSize: 12.5 },
});
