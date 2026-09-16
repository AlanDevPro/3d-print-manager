import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ESTADO_IMPRESORA_CFG } from "../constants";
import type { Impresora } from "../types";

type Props = {
  theme: any;
  impresora: Impresora;
  onPress: () => void;
};



export function ImpresoraCard({ theme, impresora, onPress }: Props) {
  const [imageError, setImageError] = useState(false);
  const cfg = ESTADO_IMPRESORA_CFG[impresora.estado];

  // Porcentaje de vida útil consumida
  const vidaUtilPct = Math.min(
    100,
    Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100)
  );

  const colorVida =
    vidaUtilPct > 85 ? "#EF4444" : vidaUtilPct > 60 ? "#F59E0B" : "#22C55E";

  const imageUri =
    !imageError && impresora.imagenUrl
      ? impresora.imagenUrl
      : "https://cdn-icons-png.flaticon.com/512/1828/1828817.png";

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
      {/* Área Principal: Imagen de la Impresora */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.printerImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
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

      {/* Barra de Progreso de Vida Útil */}
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

      {/* Footer Estilo Catálogo */}
      <View style={styles.footerContainer}>
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