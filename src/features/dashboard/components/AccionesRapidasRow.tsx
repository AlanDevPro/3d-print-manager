// src/features/dashboard/components/AccionesRapidasRow.tsx
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AccionRapida } from "./AccionRapida";

type Props = { theme: any };

export function AccionesRapidasRow({ theme }: Props) {
  return (
    <View style={styles.row}>
      <AccionRapida
        theme={theme}
        icono="add-circle"
        label="Nueva cotización"
        destacado
        onPress={() => router.push?.("/cotizar" as any)}
      />
      <AccionRapida
        theme={theme}
        icono="print-outline"
        label="Impresoras"
        onPress={() => router.push?.("/impresoras" as any)}
      />
      <AccionRapida
        theme={theme}
        icono="layers-outline"
        label="Materiales"
        onPress={() => router.push?.("/materiales" as any)}
      />
      <AccionRapida
        theme={theme}
        icono="time-outline"
        label="Historial"
        onPress={() => router.push?.("/cotizaciones" as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
});
