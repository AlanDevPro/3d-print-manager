import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { sharedStyles } from "../styles/sharedStyles";
import type { Filamento } from "../types";
import { DetalleItem } from "./DetalleItem";

type Props = {
  filamento: Filamento | null;
  theme: any;
  onClose: () => void;
};

const DEFAULT_SPOOL_IMAGE =
  "https://images.unsplash.com/photo-1615840241336-79b20b72740b?q=80&w=600&auto=format&fit=crop";

export function DetalleFilamentoModal({ filamento, theme, onClose }: Props) {
  const [imageError, setImageError] = useState(false);

  if (!filamento) return null;

  const imageUri =
    !imageError && filamento.imagenUrl
      ? filamento.imagenUrl
      : DEFAULT_SPOOL_IMAGE;

  return (
    <Modal
      visible={!!filamento}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={sharedStyles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            sharedStyles.modalSheet,
            styles.modalSheetSinPadding,
            { backgroundColor: theme.bgPrimary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={sharedStyles.modalHandle} />

            {/* Cabecera Hero: Visualización de la Imagen Real del Filamento */}
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />

              {/* Degradado superpuesto para mejorar legibilidad */}
              <View style={styles.heroOverlay} />

              {/* Badge de Alerta en Hero si el stock es bajo */}
              {filamento.stockGramos <= filamento.umbralBajoStock && (
                <View style={styles.heroAlertaBadge}>
                  <Ionicons name="warning" size={12} color="#FFFFFF" />
                  <Text style={styles.heroAlertaBadgeTexto}>Bajo stock</Text>
                </View>
              )}
            </View>

            <View style={styles.contenido}>
              {/* Título y Subtítulo */}
              <View style={sharedStyles.modalHeaderRow}>
                <View
                  style={[
                    styles.colorSwatchLg,
                    { backgroundColor: filamento.colorHex },
                  ]}
                >
                  <View style={styles.swatchInnerRing} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      sharedStyles.modalTitulo,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {filamento.tipo} {filamento.color}
                  </Text>
                  <View style={styles.subtituloRow}>
                    <Ionicons
                      name="business-outline"
                      size={12}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[
                        sharedStyles.modalSub,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {filamento.marca} ·{" "}
                      {filamento.proveedor ?? "Sin proveedor"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Detalles Técnicos */}
              <Text
                style={[styles.seccionTitulo, { color: theme.textPrimary }]}
              >
                DETALLES TÉCNICOS
              </Text>

              <View style={sharedStyles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  label="Stock restante"
                  valor={`${filamento.stockGramos} g`}
                  icono="cube-outline"
                  destacado
                />
                <DetalleItem
                  theme={theme}
                  label="Capacidad del rollo"
                  valor={`${filamento.capacidadRolloGramos} g`}
                  icono="disc-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Costo por rollo"
                  valor={`Bs ${filamento.costoCompra.toFixed(2)}`}
                  icono="cash-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Fecha de compra"
                  valor={filamento.fechaCompra}
                  icono="calendar-outline"
                />
              </View>

              {/* Sección Color */}
              <Text
                style={[styles.seccionTitulo, { color: theme.textPrimary }]}
              >
                COLOR
              </Text>
              <View
                style={[
                  styles.colorInfoBox,
                  { backgroundColor: theme.bgSecondary },
                ]}
              >
                <View
                  style={[
                    styles.colorInfoSwatch,
                    { backgroundColor: filamento.colorHex },
                  ]}
                />
                <View>
                  <Text
                    style={[
                      styles.colorInfoLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {filamento.color}
                  </Text>
                  <Text
                    style={[styles.colorInfoHex, { color: theme.textPrimary }]}
                  >
                    Hex {filamento.colorHex.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Alerta de Reabastecimiento */}
              {filamento.stockGramos <= filamento.umbralBajoStock && (
                <View style={styles.avisoBajoStock}>
                  <Ionicons name="warning-outline" size={18} color="#EF4444" />
                  <Text style={styles.avisoBajoStockTexto}>
                    Stock por debajo del umbral ({filamento.umbralBajoStock} g).
                    Considera reponer este rollo.
                  </Text>
                </View>
              )}

              {/* Botón Cerrar */}
              <TouchableOpacity
                style={sharedStyles.cerrarBtn}
                onPress={onClose}
              >
                <Text
                  style={[
                    sharedStyles.cerrarBtnTexto,
                    { color: theme.textSecondary },
                  ]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSheetSinPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    overflow: "hidden",
  },
  heroContainer: {
    width: "100%",
    height: 220,
    position: "relative",
    backgroundColor: "#0D0D14",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroAlertaBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 3,
  },
  heroAlertaBadgeTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  colorSwatchLg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#00000018",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  swatchInnerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffffff50",
    borderWidth: 1,
    borderColor: "#00000015",
  },
  subtituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 8,
  },
  colorInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  colorInfoSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00000018",
  },
  colorInfoLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  colorInfoHex: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  avisoBajoStock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EF444414",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EF444430",
  },
  avisoBajoStockTexto: {
    color: "#EF4444",
    fontSize: 12,
    flex: 1,
    fontWeight: "600",
  },
});
