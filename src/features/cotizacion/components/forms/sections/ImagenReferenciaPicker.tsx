// src/features/cotizacion/components/forms/sections/ImagenReferenciaPicker.tsx
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface ImagenReferenciaPickerProps {
  imagenUri: string | null;
  onTomarFoto: () => void;
}

export function ImagenReferenciaPicker({ imagenUri, onTomarFoto }: ImagenReferenciaPickerProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={styles.labelGroup}>
        <Ionicons name="image-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Foto de referencia</Text>
      </View>
      <Pressable
        style={[styles.button, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
        onPress={onTomarFoto}
      >
        <Ionicons name="camera-outline" size={20} color={theme.primary} />
        <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
          {imagenUri ? "Volver a tomar foto" : "Tomar foto de la pieza"}
        </Text>
      </Pressable>
      {imagenUri && <Image source={{ uri: imagenUri }} style={styles.preview} />}
    </>
  );
}

const styles = StyleSheet.create({
  labelGroup: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  button: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  buttonText: { fontSize: 13, fontWeight: "500" },
  preview: { width: "100%", height: 160, borderRadius: 8, marginTop: 10 },
});