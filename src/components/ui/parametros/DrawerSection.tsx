// src/components/ui/parametros/DrawerSection.tsx
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DrawerSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  abierto: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function DrawerSection({
  icon,
  titulo,
  abierto,
  onToggle,
  children,
}: DrawerSectionProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.sectionContainer,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderTitleRow}>
          <Ionicons name={icon} size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {titulo}
          </Text>
        </View>
        <Ionicons
          name={abierto ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.textMuted}
        />
      </Pressable>
      {abierto && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm + 2,
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: "600" },
  sectionBody: {
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    gap: spacing.xs,
  },
});
