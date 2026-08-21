import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function PlaceholderScreen({ icon, title, subtitle }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Ionicons
        name={icon}
        size={48}
        color={theme.textSecondary || "#9CA3AF"}
      />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
});
