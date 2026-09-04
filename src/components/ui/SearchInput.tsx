// src/components/ui/SearchInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  theme: any;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  theme,
}: Props) {
  return (
    <View style={[styles.box, { backgroundColor: theme.bgSecondary }]}>
      <Ionicons name="search" size={18} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.textPrimary }]}
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
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});
