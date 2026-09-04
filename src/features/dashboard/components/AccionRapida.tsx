// src/features/dashboard/components/AccionRapida.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destacado?: boolean;
};

export function AccionRapida({
  theme,
  icono,
  label,
  onPress,
  destacado,
}: Props) {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={onPress}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: destacado ? theme.primary : theme.bgSecondary },
        ]}
      >
        <Ionicons
          name={icono}
          size={20}
          color={destacado ? "#fff" : theme.textPrimary}
        />
      </View>
      <Text
        style={[styles.label, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: "center", gap: 6, width: 72 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 10.5, textAlign: "center", lineHeight: 13 },
});
