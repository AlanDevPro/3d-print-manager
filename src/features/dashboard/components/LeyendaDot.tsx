// src/features/dashboard/components/LeyendaDot.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { color: string; label: string };

export function LeyendaDot({ color, label }: Props) {
  return (
    <View style={styles.item}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 10, color: "#94A3B8" },
});
