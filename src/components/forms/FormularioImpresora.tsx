import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { EstadoImpresora } from "../../../app/(tabs)/inventario";

const ESTADOS: { key: EstadoImpresora; label: string; color: string }[] = [
  { key: "inactiva", label: "Inactiva", color: "#9CA3AF" },
  { key: "imprimiendo", label: "Imprimiendo", color: "#3B82F6" },
  { key: "mantenimiento", label: "En Mantenimiento", color: "#F59E0B" },
];

type NuevaImpresora = {
  modelo: string;
  marca: string;
  consumoWatts: number;
  costoAdquisicion: number;
  fechaAdquisicion: string;
  horasUsoTotal: number;
  vidaUtilHoras: number;
  estado: EstadoImpresora;
};

export function FormularioImpresora({
  visible,
  theme,
  onClose,
  onGuardar,
}: {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onGuardar: (i: NuevaImpresora) => void;
}) {
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [consumoWatts, setConsumoWatts] = useState("");
  const [costoAdquisicion, setCostoAdquisicion] = useState("");
  const [vidaUtilHoras, setVidaUtilHoras] = useState("8000");
  const [horasUsoTotal, setHorasUsoTotal] = useState("0");
  const [estado, setEstado] = useState<EstadoImpresora>("inactiva");

  const valido =
    modelo.trim() &&
    marca.trim() &&
    consumoWatts.trim() &&
    costoAdquisicion.trim();

  const limpiarYCerrar = () => {
    setModelo("");
    setMarca("");
    setConsumoWatts("");
    setCostoAdquisicion("");
    onClose();
  };

  const guardar = () => {
    if (!valido) return;
    onGuardar({
      modelo: modelo.trim(),
      marca: marca.trim(),
      consumoWatts: Number(consumoWatts),
      costoAdquisicion: Number(costoAdquisicion),
      fechaAdquisicion: new Date().toLocaleDateString("es-BO"),
      horasUsoTotal: Number(horasUsoTotal) || 0,
      vidaUtilHoras: Number(vidaUtilHoras) || 8000,
      estado,
    });
    limpiarYCerrar();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={limpiarYCerrar}
    >
      <Pressable style={styles.overlay} onPress={limpiarYCerrar}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Ionicons name="print-outline" size={20} color={theme.primary} />
              <Text style={[styles.titulo, { color: theme.textPrimary }]}>
                Nueva Impresora
              </Text>
            </View>

            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Marca" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={marca}
                  onChangeText={setMarca}
                  placeholder="Ej. Creality"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
              <Campo theme={theme} label="Modelo" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={modelo}
                  onChangeText={setModelo}
                  placeholder="Ej. Ender 3 V2"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            </View>

            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Consumo (W)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={consumoWatts}
                  onChangeText={setConsumoWatts}
                  keyboardType="numeric"
                  placeholder="220"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
              <Campo theme={theme} label="Costo adquisición (Bs)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={costoAdquisicion}
                  onChangeText={setCostoAdquisicion}
                  keyboardType="numeric"
                  placeholder="1400"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            </View>

            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Vida útil estimada (h)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={vidaUtilHoras}
                  onChangeText={setVidaUtilHoras}
                  keyboardType="numeric"
                />
              </Campo>
              <Campo theme={theme} label="Horas de uso actuales" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={horasUsoTotal}
                  onChangeText={setHorasUsoTotal}
                  keyboardType="numeric"
                  placeholder="0 si es nueva"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            </View>

            <Campo theme={theme} label="Estado inicial">
              <View style={styles.chipsRow}>
                {ESTADOS.map((e) => (
                  <TouchableOpacity
                    key={e.key}
                    onPress={() => setEstado(e.key)}
                    style={[
                      styles.estadoChip,
                      {
                        backgroundColor:
                          estado === e.key ? e.color : theme.bgSecondary,
                        borderColor: e.color,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: estado === e.key ? "#fff" : e.color,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Campo>

            <TouchableOpacity
              style={[
                styles.guardarBtn,
                { backgroundColor: valido ? theme.primary : theme.bgSecondary },
              ]}
              disabled={!valido}
              onPress={guardar}
            >
              <Text
                style={[
                  styles.guardarBtnText,
                  { color: valido ? "#fff" : theme.textSecondary },
                ]}
              >
                Guardar impresora
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelarBtn}
              onPress={limpiarYCerrar}
            >
              <Text
                style={[styles.cancelarBtnText, { color: theme.textSecondary }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Campo({
  theme,
  label,
  children,
  flex,
}: {
  theme: any;
  label: string;
  children: React.ReactNode;
  flex?: boolean;
}) {
  return (
    <View style={[styles.campo, flex && { flex: 1 }]}>
      <Text style={[styles.campoLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      {children}
    </View>
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
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  titulo: { fontSize: 18, fontWeight: "800" },

  campo: { marginBottom: 14, gap: 6 },
  campoLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14.5,
  },

  filaDoble: { flexDirection: "row", gap: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  estadoChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
  },

  guardarBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  guardarBtnText: { fontSize: 14.5, fontWeight: "700" },
  cancelarBtn: { alignItems: "center", paddingVertical: 12 },
  cancelarBtnText: { fontSize: 13, fontWeight: "600" },
});
