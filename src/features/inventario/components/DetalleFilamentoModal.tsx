// src/features/inventario/components/DetalleFilamentoModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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

export function DetalleFilamentoModal({ filamento, theme, onClose }: Props) {
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
          {filamento && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={sharedStyles.modalHandle} />

              {/* Cabecera visual: el color del filamento ocupa todo el ancho del recuadro,
                  igual que la foto del rollo en el catálogo */}
              <View style={[styles.hero, { backgroundColor: filamento.colorHex + "22" }]}>
                <View style={[styles.heroSpoolOuter, { backgroundColor: filamento.colorHex }]}>
                  <View style={[styles.heroSpoolMid, { backgroundColor: theme.bgPrimary }]}>
                    <View
                      style={[styles.heroSpoolCore, { backgroundColor: filamento.colorHex }]}
                    />
                  </View>
                </View>

                {filamento.stockGramos <= filamento.umbralBajoStock && (
                  <View style={styles.heroAlertaBadge}>
                    <Ionicons name="warning" size={12} color="#fff" />
                    <Text style={styles.heroAlertaBadgeTexto}>Bajo stock</Text>
                  </View>
                )}
              </View>

              <View style={styles.contenido}>
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
                        {filamento.marca} · {filamento.proveedor ?? "Sin proveedor"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sección: DETALLES TÉCNICOS, en dos columnas como el catálogo */}
                <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
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

                {/* Sección: COLOR, con el hex como en el recuadro del catálogo */}
                <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
                  COLOR
                </Text>
                <View
                  style={[
                    styles.colorInfoBox,
                    { backgroundColor: theme.bgSecondary },
                  ]}
                >
                  <View
                    style={[styles.colorInfoSwatch, { backgroundColor: filamento.colorHex }]}
                  />
                  <View>
                    <Text style={[styles.colorInfoLabel, { color: theme.textSecondary }]}>
                      {filamento.color}
                    </Text>
                    <Text style={[styles.colorInfoHex, { color: theme.textPrimary }]}>
                      Hex {filamento.colorHex.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {filamento.stockGramos <= filamento.umbralBajoStock && (
                  <View style={styles.avisoBajoStock}>
                    <Ionicons name="warning-outline" size={18} color="#EF4444" />
                    <Text style={styles.avisoBajoStockTexto}>
                      Stock por debajo del umbral ({filamento.umbralBajoStock} g).
                      Considera reponer este rollo.
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={sharedStyles.cerrarBtn} onPress={onClose}>
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
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Quita el padding general del sheet para que el hero pueda ocupar todo el ancho
  modalSheetSinPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  hero: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  heroSpoolOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#00000020",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroSpoolMid: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#00000018",
  },
  heroSpoolCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.55,
  },
  heroAlertaBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroAlertaBadgeTexto: {
    color: "#fff",
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