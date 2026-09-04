// src/features/inventario/components/ImpresoraCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ESTADO_IMPRESORA_CFG } from "../constants";
import type { Impresora } from "../types";

type Props = {
  theme: any;
  impresora: Impresora;
  onPress: () => void;
};

// Colección de imágenes estáticas de impresoras 3D para fallback/pruebas
const STATIC_PRINTER_IMAGES = [
  "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop", // Impresora FDM activa
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop", // Impresora en laboratorio
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600&auto=format&fit=crop", // Cama de impresión 3D
  "https://images.unsplash.com/photo-1615840241336-79b20b72740b?q=80&w=600&auto=format&fit=crop", // Detalle Extrusor/Nozzle
];

/**
 * Retorna una imagen estática determinista basada en el ID o modelo de la impresora
 */
function getStaticPrinterImage(impresora: Impresora): string {
  if (impresora.imagenUrl) return impresora.imagenUrl;

  const key = impresora.id || impresora.modelo || "default";
  const index =
    Math.abs(
      key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % STATIC_PRINTER_IMAGES.length;

  return STATIC_PRINTER_IMAGES[index];
}

export function ImpresoraCard({ theme, impresora, onPress }: Props) {
  const cfg = ESTADO_IMPRESORA_CFG[impresora.estado];
  
  // Porcentaje de vida útil consumida
  const vidaUtilPct = Math.min(
    100,
    Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100)
  );
  
  const colorVida =
    vidaUtilPct > 85 ? "#EF4444" : vidaUtilPct > 60 ? "#F59E0B" : "#22C55E";

  const imageUri = getStaticPrinterImage(impresora);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.bgSecondary || "#161622",
          borderColor:
            vidaUtilPct > 85
              ? "#EF444480"
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
          style={styles.printerImage}
          resizeMode="cover"
        />

        {/* Badge Superior Izquierdo: Modelo */}
        <View style={styles.badgeModelo}>
          <Text style={styles.badgeModeloTexto} numberOfLines={1}>
            {impresora.modelo}
          </Text>
        </View>

        {/* Badge Superior Derecho: Marca */}
        <View style={styles.badgeMarca}>
          <Text style={styles.badgeMarcaTexto} numberOfLines={1}>
            {impresora.marca}
          </Text>
        </View>

        {/* Badge Inferior Derecho: Alerta por desgaste alto */}
        {vidaUtilPct > 85 && (
          <View style={styles.badgeAlerta}>
            <Ionicons name="warning-sharp" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* --- BARRA DE PROGRESO DE VIDA ÚTIL --- */}
      <View
        style={[
          styles.barraFondo,
          { backgroundColor: theme.border ? theme.border + "40" : "#00000030" },
        ]}
      >
        <View
          style={[
            styles.barraRelleno,
            { width: `${vidaUtilPct}%`, backgroundColor: colorVida },
          ]}
        />
      </View>

      {/* --- FOOTER INFERIOR ESTILO CATÁLOGO --- */}
      <View style={styles.footerContainer}>
        {/* Izquierda: Badge de Estado Actual */}
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: cfg.color + "1A" },
          ]}
        >
          <Ionicons name={cfg.icono} size={10} color={cfg.color} />
          <Text
            style={[styles.estadoBadgeTexto, { color: cfg.color }]}
            numberOfLines={1}
          >
            {cfg.label}
          </Text>
        </View>

        {/* Derecha: Horas de uso / % Vida */}
        <Text style={[styles.horasTexto, { color: colorVida }]}>
          {impresora.horasUsoTotal}h uso
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
  printerImage: {
    width: "100%",
    height: "100%",
  },
  badgeModelo: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 15, 23, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    maxWidth: "55%",
  },
  badgeModeloTexto: {
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
    maxWidth: "40%",
  },
  badgeMarcaTexto: {
    color: "#CBD5E1",
    fontSize: 9.5,
    fontWeight: "700",
  },
  badgeAlerta: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#EF4444",
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
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
    maxWidth: "60%",
  },
  estadoBadgeTexto: {
    fontSize: 10,
    fontWeight: "700",
  },
  horasTexto: {
    fontSize: 10,
    fontWeight: "800",
  },
});