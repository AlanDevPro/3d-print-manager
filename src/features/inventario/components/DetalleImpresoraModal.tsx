// src/features/inventario/components/DetalleImpresoraModal.tsx
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
import { ESTADO_IMPRESORA_CFG } from "../constants";
import { sharedStyles } from "../styles/sharedStyles";
import type { Impresora } from "../types";
import { DetalleItem } from "./DetalleItem";

type Props = {
  impresora: Impresora | null;
  theme: any;
  onClose: () => void;
};

export function DetalleImpresoraModal({ impresora, theme, onClose }: Props) {
  const vidaUtilPct = impresora
    ? Math.min(
        100,
        Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100),
      )
    : 0;
  const horasRestantes = impresora
    ? Math.max(0, impresora.vidaUtilHoras - impresora.horasUsoTotal)
    : 0;
  const cfg = impresora ? ESTADO_IMPRESORA_CFG[impresora.estado] : null;

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
            { backgroundColor: theme.bgPrimary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {impresora && cfg && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={sharedStyles.modalHandle} />

              <View style={sharedStyles.modalHeaderRow}>
                <View
                  style={[
                    styles.impresoraIcono,
                    { backgroundColor: cfg.color + "1A" },
                  ]}
                >
                  {/* Icono fijo de impresora en lugar de cfg.icono */}
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
                    <Ionicons name="hardware-chip-outline" size={12} color={theme.textSecondary} />
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

              <View
                style={[
                  sharedStyles.estadoBadge,
                  {
                    backgroundColor: cfg.color + "1A",
                    alignSelf: "flex-start",
                    marginBottom: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  },
                ]}
              >
                <Ionicons name={cfg.icono} size={12} color={cfg.color} />
                <Text
                  style={[sharedStyles.estadoBadgeTexto, { color: cfg.color }]}
                >
                  {cfg.label}
                </Text>
              </View>

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

              <View style={styles.desgasteHeader}>
                <Ionicons name="analytics-outline" size={14} color={theme.textSecondary} />
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
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 6,
  },
});