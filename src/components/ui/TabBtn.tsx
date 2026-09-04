//src/components/ui/TabBtn.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  activo: boolean;
  theme: any;
  onPress: () => void;
};

export function TabBtn({ label, activo, theme, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, activo && { backgroundColor: theme.bgPrimary }]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabBtnText,
          {
            color: activo ? theme.primary : theme.textSecondary,
            fontWeight: activo ? "700" : "500",
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
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  tabBtnText: { fontSize: 12.5 },
});
