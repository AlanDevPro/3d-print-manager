// src/features/cotizacion/components/forms/sections/PiezaTabsBar.tsx
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface PiezaTab {
  id: string;
  nombre_pieza: string;
}

interface PiezaTabsBarProps {
  piezas: PiezaTab[];
  piezaActivaId: string;
  onSeleccionar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export function PiezaTabsBar({ piezas, piezaActivaId, onSeleccionar, onEliminar }: PiezaTabsBarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.container}>
      {piezas.map((item, index) => {
        const isSelected = item.id === piezaActivaId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSeleccionar(item.id)}
            style={[
              styles.tab,
              {
                backgroundColor: isSelected ? theme.primary : theme.bgPrimary,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: isSelected ? "#FFFFFF" : theme.textPrimary, fontWeight: isSelected ? "700" : "500" },
              ]}
            >
              {item.nombre_pieza ? item.nombre_pieza : `Pieza ${index + 1}`}
            </Text>
            {piezas.length > 1 && (
              <Pressable onPress={() => onEliminar(item.id)} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={16} color={isSelected ? "#FFFFFF" : theme.danger} />
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginVertical: 6 },
  container: { flexDirection: "row", gap: 8, alignItems: "center" },
  tab: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 12 },
  closeBtn: { padding: 2 },
});