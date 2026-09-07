// src/features/cotizacion/components/resumen/BarraCostosVisual.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface CostSegment {
  key: string;
  label: string;
  flex: number;
  color: string;
}

interface BarraCostosVisualProps {
  segments: CostSegment[];
  textColor: string;
}

export function BarraCostosVisual({ segments, textColor }: BarraCostosVisualProps) {
  return (
    <>
      <View style={styles.progressBar}>
        {segments.map((seg) => (
          <View
            key={seg.key}
            style={[styles.progressSegment, { flex: seg.flex > 0 ? seg.flex : 0.001, backgroundColor: seg.color }]}
          />
        ))}
      </View>

      <View style={styles.legendContainer}>
        {segments.map((seg) => (
          <View key={seg.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={[styles.legendText, { color: textColor }]}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  progressBar: { height: 8, flexDirection: "row", borderRadius: 4, overflow: "hidden", marginTop: 8 },
  progressSegment: { height: "100%" },
  legendContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 2, marginRight: 4 },
  legendText: { fontSize: 9, fontWeight: "700" },
});