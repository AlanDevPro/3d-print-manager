// src/components/ui/EmptyStateCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface EmptyStateCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionIcon: keyof typeof Ionicons.glyphMap;
  actionText: string;
}

export function EmptyStateCard({ icon, title, description, actionIcon, actionText }: EmptyStateCardProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons name={icon} size={32} color={theme.primary} />
        </View>
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
      <View style={[styles.action, { borderColor: theme.border }]}>
        <Ionicons name={actionIcon} size={18} color={theme.primary} />
        <Text style={[styles.actionText, { color: theme.textMuted }]}>{actionText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 20, alignItems: "center", marginVertical: 6, borderWidth: 1 },
  iconContainer: { marginBottom: 12 },
  iconWrapper: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  description: { fontSize: 13, textAlign: "center", marginBottom: 12, lineHeight: 18, paddingHorizontal: 8 },
  action: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, marginTop: 4 },
  actionText: { fontSize: 12, fontWeight: "500" },
});