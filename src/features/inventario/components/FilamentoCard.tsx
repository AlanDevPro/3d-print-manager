// src/features/inventario/components/FilamentoCard.tsx
import { COLOR_ALERTA, COLOR_DANGER, COLOR_OK } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Filamento } from "../types";

type Props = {
  theme: any;
  filamento: Filamento;
  onPress: () => void;
  onAgregar?: () => void; // Callback para la acción del botón agregar
};

// Colección de imágenes estáticas de filamentos 3D para fallback/pruebas
const STATIC_SPOOL_IMAGES = [
  "https://images.unsplash.com/photo-1615840241336-79b20b72740b?q=80&w=600&auto=format&fit=crop", // Bobina azul/negra
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop", // Rollo técnico
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600&auto=format&fit=crop", // Impresión y filamento
  "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop", // Bobina de filamento
];

/**
 * Retorna una imagen estática determinista basada en la propiedad del filamento
 */
function getStaticImage(filamento: Filamento): string {
  if (filamento.imagenUrl) return filamento.imagenUrl;

  const key = filamento.id || filamento.color || "default";
  const index = Math.abs(
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % STATIC_SPOOL_IMAGES.length;

  return STATIC_SPOOL_IMAGES[index];
}

export function FilamentoCard({ theme, filamento, onPress, onAgregar }: Props) {
  const porcentaje = Math.min(
    100,
    Math.round((filamento.stockGramos / filamento.capacidadRolloGramos) * 100)
  );
  const bajoStock = filamento.stockGramos <= filamento.umbralBajoStock;
  const colorEstado = bajoStock
    ? COLOR_DANGER
    : porcentaje < 50
    ? COLOR_ALERTA
    : COLOR_OK;

  const imageUri = getStaticImage(filamento);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.bgSecondary || "#161622",
          borderColor: bajoStock
            ? COLOR_DANGER + "80"
            : theme.border
            ? theme.border + "40"
            : "#ffffff18",
        },
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* --- ÁREA PRINCIPAL: IMAGEN A BORDES COMPLETOS --- */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.spoolImage}
          resizeMode="cover"
        />

        {/* Badge Superior Izquierdo: Material */}
        <View style={styles.badgeMaterial}>
          <Text style={styles.badgeMaterialTexto} numberOfLines={1}>
            {filamento.tipo}
          </Text>
        </View>

        {/* Badge Superior Derecho: Marca */}
        <View style={styles.badgeMarca}>
          <Text style={styles.badgeMarcaTexto} numberOfLines={1}>
            {filamento.marca}
          </Text>
        </View>

        {/* Botón Flotante para Agregar / Incrementar Filamento */}
        {onAgregar && (
          <TouchableOpacity
            style={[
              styles.btnAgregar,
              { backgroundColor: theme.primary || "#3B82F6" },
            ]}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation(); // Evita disparar el onPress de la Card
              onAgregar();
            }}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Badge Inferior Izquierdo: Alerta Bajo Stock */}
        {bajoStock && (
          <View style={styles.badgeAlerta}>
            <Ionicons name="warning-sharp" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* --- BARRA DE PROGRESO DE STOCK --- */}
      <View
        style={[
          styles.barraFondo,
          { backgroundColor: theme.border ? theme.border + "40" : "#00000030" },
        ]}
      >
        <View
          style={[
            styles.barraRelleno,
            { width: `${porcentaje}%`, backgroundColor: colorEstado },
          ]}
        />
      </View>

      {/* --- FOOTER INFERIOR ESTILO CATÁLOGO --- */}
      <View style={styles.footerContainer}>
        {/* Izquierda: Swatch de Color + Nombre del Color */}
        <View style={styles.colorInfoGroup}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: filamento.colorHex || "#3B82F6" },
            ]}
          />
          <Text
            style={[styles.nombreColorTexto, { color: theme.textPrimary || "#FFFFFF" }]}
            numberOfLines={1}
          >
            {filamento.color}
          </Text>
        </View>

        {/* Derecha: Stock Actual / Cantidad Inicial */}
        <Text style={[styles.stockRatioTexto, { color: colorEstado }]}>
          {filamento.stockGramos}g / {filamento.capacidadRolloGramos}g
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: "48.5%",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    height: 130,
    marginTop: -8,
    marginLeft: -8,
    marginRight: -8,
    position: "relative",
    backgroundColor: "#0D0D14",
  },
  spoolImage: {
    width: "100%",
    height: "100%",
  },
  badgeMaterial: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 15, 23, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  badgeMaterialTexto: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  badgeMarca: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(15, 15, 23, 0.85)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    maxWidth: "50%",
  },
  badgeMarcaTexto: {
    color: "#CBD5E1",
    fontSize: 9.5,
    fontWeight: "700",
  },
  btnAgregar: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeAlerta: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: COLOR_DANGER,
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  barraFondo: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  barraRelleno: {
    height: "100%",
    borderRadius: 2,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
    paddingBottom: 2,
    gap: 4,
  },
  colorInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  nombreColorTexto: {
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  stockRatioTexto: {
    fontSize: 10,
    fontWeight: "800",
  },
});