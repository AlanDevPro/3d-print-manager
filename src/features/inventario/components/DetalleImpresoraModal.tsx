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
import { ESTADO_IMPRESORA_CFG } from "../constants";
import { sharedStyles } from "../styles/sharedStyles";
import type { Impresora } from "../types";
import { DetalleItem } from "./DetalleItem";

type Props = {
  impresora: Impresora | null;
  theme: any;
  onClose: () => void;
};

const DEFAULT_PRINTER_IMAGE =
  "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop";

export function DetalleImpresoraModal({ impresora, theme, onClose }: Props) {
  const [imageError, setImageError] = useState(false);

  if (!impresora) return null;

  const vidaUtilPct = Math.min(
    100,
    Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100),
  );

  const horasRestantes = Math.max(
    0,
    impresora.vidaUtilHoras - impresora.horasUsoTotal,
  );

  const cfg = ESTADO_IMPRESORA_CFG[impresora.estado];

  const imageUri =
    !imageError && impresora.imagenUrl
      ? impresora.imagenUrl
      : DEFAULT_PRINTER_IMAGE;

  return (
    <Modal
      visible={!!impresora}
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
            {/* Header Hero con Imagen del Filamento/Impresora */}
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />

              {/* Sombra/Oscurecimiento para mejorar contraste */}
              <View style={styles.heroOverlay} />

              {/* Tirador del modal flotante */}
              <View style={[sharedStyles.modalHandle, styles.heroHandle]} />

              {/* Botón flotante para cerrar rápidamente */}
              <TouchableOpacity
                style={styles.heroCerrarBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Badges Flotantes Informativos */}
              <View style={styles.heroBadgesContainer}>
                <View
                  style={[
                    styles.heroEstadoBadge,
                    { backgroundColor: cfg.color },
                  ]}
                >
                  <Ionicons name={cfg.icono} size={12} color="#FFFFFF" />
                  <Text style={styles.heroEstadoBadgeTexto}>{cfg.label}</Text>
                </View>
              </View>
            </View>

            {/* Contenido Principal */}
            <View style={styles.contenido}>
              {/* Título y Subtítulo */}
              <View style={sharedStyles.modalHeaderRow}>
                <View
                  style={[
                    styles.impresoraIcono,
                    { backgroundColor: cfg.color + "1A" },
                  ]}
                >
                  <Ionicons name="print-outline" size={24} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      sharedStyles.modalTitulo,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {impresora.modelo}
                  </Text>
                  <View style={styles.subtituloRow}>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={12}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[
                        sharedStyles.modalSub,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {impresora.marca}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Grid de Métricas */}
              <View style={sharedStyles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  label="Vida útil restante"
                  valor={`${horasRestantes.toLocaleString()} h`}
                  icono="hourglass-outline"
                  destacado
                />
                <DetalleItem
                  theme={theme}
                  label="Uso acumulado"
                  valor={`${impresora.horasUsoTotal.toLocaleString()} h`}
                  icono="time-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Consumo"
                  valor={`${impresora.consumoWatts} W`}
                  icono="flash-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Costo adquisición"
                  valor={`Bs ${impresora.costoAdquisicion.toFixed(2)}`}
                  icono="cash-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Fecha adquisición"
                  valor={impresora.fechaAdquisicion}
                  icono="calendar-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Vida útil total"
                  valor={`${impresora.vidaUtilHoras.toLocaleString()} h`}
                  icono="speedometer-outline"
                />
              </View>

              {/* Barra de Desgaste Acumulado */}
              <View style={styles.desgasteHeader}>
                <Ionicons
                  name="analytics-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    sharedStyles.checklistTitulo,
                    { color: theme.textSecondary, marginBottom: 0 },
                  ]}
                >
                  Desgaste acumulado
                </Text>
              </View>

              <View style={sharedStyles.barraFondo}>
                <View
                  style={[
                    sharedStyles.barraRelleno,
                    {
                      width: `${vidaUtilPct}%`,
                      backgroundColor:
                        vidaUtilPct > 85
                          ? "#EF4444"
                          : vidaUtilPct > 60
                            ? "#F59E0B"
                            : "#22C55E",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  sharedStyles.filaInfoTexto,
                  { color: theme.textSecondary, marginTop: 4 },
                ]}
              >
                {vidaUtilPct}% de su vida útil consumida
              </Text>

              {/* Botón Cerrar Inferior */}
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
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroHandle: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 10,
  },
  heroCerrarBtn: {
    position: "absolute",
    top: 14,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heroBadgesContainer: {
    position: "absolute",
    bottom: 14,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroEstadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 3,
  },
  heroEstadoBadgeTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  impresoraIcono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subtituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  desgasteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 12,
  },
});
