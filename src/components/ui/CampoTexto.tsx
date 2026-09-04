//src/components/ui/CampoTexto.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  theme: any;
  label: string;
  valor: string;
  onChange: (v: string) => void;
  teclado?: "default" | "numeric";
};

export function CampoTexto({ theme, label, valor, onChange, teclado }: Props) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.bgSecondary, color: theme.textPrimary },
        ]}
        value={valor}
        onChangeText={onChange}
        keyboardType={teclado === "numeric" ? "numeric" : "default"}
        placeholderTextColor={theme.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
