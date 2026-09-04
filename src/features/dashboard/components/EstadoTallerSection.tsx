// src/features/dashboard/components/EstadoTallerSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
    COLOR_INACTIVA,
    COLOR_LIBRE,
    COLOR_OCUPADA,
} from "../constants/colors";
import { ImpresoraUI } from "../types";
import { ImpresoraChip } from "./ImpresoraChip";
import { LeyendaDot } from "./LeyendaDot";

type Props = { theme: any; impresoras: ImpresoraUI[] };

export function EstadoTallerSection({ theme, impresoras }: Props) {
  const impresorasInactivas = impresoras.filter((i) => !i.activa).length;

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.headerRow}>
        <Text style={[styles.titulo, { color: theme.textPrimary }]}>
          Estado del taller
        </Text>
        <View style={styles.leyendaRow}>
          <LeyendaDot color={COLOR_OCUPADA} label="Imprimiendo" />
          <LeyendaDot color={COLOR_LIBRE} label="Libre" />
          <LeyendaDot color={COLOR_INACTIVA} label="Apagada" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {impresoras.map((imp) => (
          <ImpresoraChip key={imp.id} impresora={imp} theme={theme} />
        ))}
      </ScrollView>

      {impresorasInactivas > 0 && (
        <View
          style={[styles.aviso, { backgroundColor: COLOR_INACTIVA + "1A" }]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={COLOR_INACTIVA}
          />
          <Text style={[styles.avisoTexto, { color: theme.textSecondary }]}>
            {impresorasInactivas} impresora(s) deshabilitada(s)
          </Text>
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
  leyendaRow: { flexDirection: "row", gap: 10 },
  scroll: { gap: 10, paddingRight: 16 },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avisoTexto: { fontSize: 11 },
});
