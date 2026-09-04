// src/features/pedidos/components/SearchBox.tsx
// Genérico: si ya tienes un <SearchBox /> en src/components/ui/, usa ese
// e importa desde ahí en vez de duplicarlo aquí.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBoxProps {
  theme: any;
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
}

export function SearchBox({
  theme,
  value,
  onChangeText,
  placeholder,
}: SearchBoxProps) {
  return (
    <View style={[styles.searchBox, { backgroundColor: theme.bgSecondary }]}>
      <Ionicons name="search" size={18} color={theme.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.textPrimary }]}
        placeholder={placeholder ?? "Buscar..."}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
});
