// src/features/dashboard/components/DetalleModeloModal.tsx
import { formatBs } from "@/utils/format";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ModeloUI } from "../types";
import { DetalleItem } from "./DetalleItem";

type Props = {
  modelo: ModeloUI | null;
  theme: any;
  onClose: () => void;
  onCotizar: (m: ModeloUI) => void;
};

export function DetalleModeloModal({
  modelo,
  theme,
  onClose,
  onCotizar,
}: Props) {
  return (
    <Modal
      visible={!!modelo}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {modelo && (
            <>
              <View style={styles.handle} />

              <View
                style={[styles.imagen, { backgroundColor: theme.bgSecondary }]}
              >
                {modelo.imagenUrl && (
                  <Image
                    source={{ uri: modelo.imagenUrl }}
                    style={styles.imagenReal}
                  />
                )}
              </View>

              <Text style={[styles.nombre, { color: theme.textPrimary }]}>
                {modelo.nombre}
              </Text>

              <View style={styles.grid}>
                <DetalleItem
                  theme={theme}
                  icono="time-outline"
                  label="Tiempo de impresión"
                  valor={`${modelo.tiempoHoras} h`}
                />
                <DetalleItem
                  theme={theme}
                  icono="layers-outline"
                  label="Peso de filamento"
                  valor={`${modelo.pesoGramos} g`}
                />
                <DetalleItem
                  theme={theme}
                  icono="color-palette-outline"
                  label="Material / Color"
                  valor={`${modelo.nombre} · ${modelo.nombre}`}
                />
                <DetalleItem
                  theme={theme}
                  icono="pricetag-outline"
                  label="Precio sugerido"
                  valor={formatBs(modelo.precioReferencia)}
                  destacado
                />
              </View>

              <TouchableOpacity
                style={[styles.cotizarBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.9}
                onPress={() => onCotizar(modelo)}
              >
                <Text style={styles.cotizarBtnText}>
                  Cotizar este modelo nuevamente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
                <Text
                  style={[styles.cerrarBtnText, { color: theme.textSecondary }]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 4,
  },
  imagen: {
    height: 150,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagenReal: { width: "100%", height: "100%" },
  nombre: { fontSize: 19, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cotizarBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  cotizarBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cerrarBtn: { alignItems: "center", paddingVertical: 6 },
  cerrarBtnText: { fontSize: 13, fontWeight: "600" },
});
