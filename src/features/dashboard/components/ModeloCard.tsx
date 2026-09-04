import { formatBs } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModeloUI } from "../types";

type Props = {
  modelo: ModeloUI;
  theme: any;
  onPress?: () => void;
};

export function ModeloCard({ modelo, theme, onPress }: Props) {
  // Manejo defensivo con soportes camelCase (UI) o snake_case (Supabase) y fallbacks
  const nombre = modelo?.nombre ?? "Sin nombre";
  const precio =
    modelo?.precioReferencia ??
    (modelo as any)?.precio_sugerido ??
    (modelo as any)?.precio_venta ??
    0;
  const tiempo = modelo?.tiempoHoras ?? (modelo as any)?.tiempo_horas ?? 0;
  const peso = modelo?.pesoGramos ?? (modelo as any)?.peso_gramos ?? 0;
  const imagen = modelo?.imagenUrl ?? (modelo as any)?.imagen_url;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.imagen, { backgroundColor: theme.bgPrimary }]}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.imagenReal} />
        ) : (
          <Ionicons name="cube-outline" size={30} color={theme.textSecondary} />
        )}
      </View>
      <View style={styles.body}>
        <Text
          style={[styles.nombre, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {nombre}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {tiempo} h
          </Text>
          <Text style={[styles.divider, { color: theme.textSecondary }]}>
            ·
          </Text>
          <Ionicons
            name="layers-outline"
            size={12}
            color={theme.textSecondary}
          />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {peso} g
          </Text>
        </View>

        <Text style={[styles.precio, { color: theme.primary }]}>
          {formatBs(precio)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  imagen: { height: 110, alignItems: "center", justifyContent: "center" },
  imagenReal: { width: "100%", height: "100%" },
  body: { padding: 10, gap: 4 },
  nombre: { fontSize: 13, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  infoText: { fontSize: 11 },
  divider: { fontSize: 11, marginHorizontal: 2 },
  precio: { fontSize: 14, fontWeight: "800", marginTop: 2 },
});
