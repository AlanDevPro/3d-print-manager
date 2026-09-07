// src/features/cotizacion/components/resumen/ResumenTabsBar.tsx
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface Tab {
  id: string;
  label: string;
}

interface ResumenTabsBarProps {
  tabs: Tab[];
  tabActivo: string;
  onSeleccionar: (id: string) => void;
}

export function ResumenTabsBar({ tabs, tabActivo, onSeleccionar }: ResumenTabsBarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.container}>
      {tabs.map((tab) => {
        const isSelected = tab.id === tabActivo;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSeleccionar(tab.id)}
            style={[
              styles.tab,
              { backgroundColor: isSelected ? theme.primary : theme.bgPrimary, borderColor: isSelected ? theme.primary : theme.border },
            ]}
          >
            <Text
              style={[styles.tabText, { color: isSelected ? "#FFFFFF" : theme.textPrimary, fontWeight: isSelected ? "700" : "500" }]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 2 },
  container: { flexDirection: "row", gap: 8, alignItems: "center" },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, maxWidth: 160 },
  tabText: { fontSize: 12 },
});