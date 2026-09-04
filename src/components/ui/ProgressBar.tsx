//src/components/ui/ProgressBar.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  porcentaje: number; // 0-100
  color: string;
  alto?: number;
}

export function ProgressBar({ porcentaje, color, alto = 7 }: Props) {
  return (
    <View style={[styles.fondo, { height: alto, borderRadius: alto / 2 }]}>
      <View
        style={[
          styles.relleno,
          {
            width: `${Math.min(100, Math.max(0, porcentaje))}%`,
            backgroundColor: color,
            height: alto,
            borderRadius: alto / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { backgroundColor: "#00000014", overflow: "hidden" },
  relleno: {},
});
