import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  icono?: keyof typeof Ionicons.glyphMap;
  activo: boolean;
  theme: any;
  onPress: () => void;
};

export function TabBtn({ label, icono, activo, theme, onPress }: Props) {
  const color = activo ? theme.primary : theme.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.tabBtn, activo && { backgroundColor: theme.bgPrimary }]}
      onPress={onPress}
    >
      {icono && <Ionicons name={icono} size={14} color={color} />}
      <Text
        style={[
          styles.tabBtnText,
          {
            color,
            fontWeight: activo ? "700" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnText: { fontSize: 11.5 },
});