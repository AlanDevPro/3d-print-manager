// src/components/ui/DrawerSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native";
import { colors, radii, spacing } from "../../constants/theme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DrawerSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  defaultAbierto?: boolean;
  children: React.ReactNode;
}

export function DrawerSection({
  icon,
  titulo,
  defaultAbierto = false,
  children,
}: DrawerSectionProps) {
  const [abierto, setAbierto] = useState(defaultAbierto);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbierto((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierto }}
      >
        <View style={styles.headerLeft}>
          <Ionicons name={icon} size={18} color={colors.primary} />
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        <Ionicons
          name={abierto ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {abierto && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titulo: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
});
