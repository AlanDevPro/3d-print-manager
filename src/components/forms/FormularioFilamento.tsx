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
import { Material } from "../../../app/(tabs)/inventario";

const MATERIALES: Material[] = ["PLA", "PETG", "ABS", "TPU", "Resina"];

const COLORES_SUGERIDOS = [
  { nombre: "Negro", hex: "#111111" },
  { nombre: "Blanco", hex: "#F5F5F5" },
  { nombre: "Rojo", hex: "#DC2626" },
  { nombre: "Azul", hex: "#2563EB" },
  { nombre: "Gris", hex: "#6B7280" },
  { nombre: "Amarillo", hex: "#F59E0B" },
];

type NuevoFilamento = {
  marca: string;
  material: Material;
  color: string;
  colorHex: string;
  stockGramos: number;
  capacidadRolloGramos: number;
  costoCompra: number;
  proveedor: string;
  fechaCompra: string;
  umbralBajoStock: number;
};

export function FormularioFilamento({
  visible,
  theme,
  onClose,
  onGuardar,
}: {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onGuardar: (f: NuevoFilamento) => void;
}) {
  const [marca, setMarca] = useState("");
  const [material, setMaterial] = useState<Material>("PLA");
  const [color, setColor] = useState(COLORES_SUGERIDOS[0].nombre);
  const [colorHex, setColorHex] = useState(COLORES_SUGERIDOS[0].hex);
  const [capacidadRollo, setCapacidadRollo] = useState("1000");
  const [stockGramos, setStockGramos] = useState("1000");
  const [costoCompra, setCostoCompra] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [umbralBajoStock, setUmbralBajoStock] = useState("200");

  const valido = marca.trim() && costoCompra.trim() && Number(stockGramos) > 0;

  const limpiarYCerrar = () => {
    setMarca("");
    setCostoCompra("");
    setProveedor("");
    onClose();
  };

  const guardar = () => {
    if (!valido) return;
    onGuardar({
      marca: marca.trim(),
      material,
      color,
      colorHex,
      stockGramos: Number(stockGramos),
      capacidadRolloGramos: Number(capacidadRollo),
      costoCompra: Number(costoCompra),
      proveedor: proveedor.trim() || "—",
      fechaCompra: new Date().toLocaleDateString("es-BO"),
      umbralBajoStock: Number(umbralBajoStock),
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
              <Ionicons name="layers-outline" size={20} color={theme.primary} />
              <Text style={[styles.titulo, { color: theme.textPrimary }]}>
                Nuevo Filamento
              </Text>
            </View>

            <Campo theme={theme} label="Marca">
              <TextInput
                style={[
                  styles.input,
                  { color: theme.textPrimary, borderColor: theme.bgSecondary },
                ]}
                value={marca}
                onChangeText={setMarca}
                placeholder="Ej. eSun, Polymaker..."
                placeholderTextColor={theme.textSecondary}
              />
            </Campo>

            <Campo theme={theme} label="Material">
              <View style={styles.chipsRow}>
                {MATERIALES.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    activo={material === m}
                    theme={theme}
                    onPress={() => setMaterial(m)}
                  />
                ))}
              </View>
            </Campo>

            <Campo theme={theme} label="Color">
              <View style={styles.chipsRow}>
                {COLORES_SUGERIDOS.map((c) => (
                  <TouchableOpacity
                    key={c.nombre}
                    onPress={() => {
                      setColor(c.nombre);
                      setColorHex(c.hex);
                    }}
                    style={[
                      styles.colorChip,
                      {
                        backgroundColor: c.hex,
                        borderColor:
                          color === c.nombre ? theme.primary : "transparent",
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.colorLabel, { color: theme.textSecondary }]}>
                {color}
              </Text>
            </Campo>

            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Capacidad rollo (g)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={capacidadRollo}
                  onChangeText={setCapacidadRollo}
                  keyboardType="numeric"
                />
              </Campo>
              <Campo theme={theme} label="Stock inicial (g)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={stockGramos}
                  onChangeText={setStockGramos}
                  keyboardType="numeric"
                />
              </Campo>
            </View>

            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Costo por rollo (Bs)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={costoCompra}
                  onChangeText={setCostoCompra}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
              <Campo theme={theme} label="Alerta bajo stock (g)" flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={umbralBajoStock}
                  onChangeText={setUmbralBajoStock}
                  keyboardType="numeric"
                />
              </Campo>
            </View>

            <Campo theme={theme} label="Proveedor (opcional)">
              <TextInput
                style={[
                  styles.input,
                  { color: theme.textPrimary, borderColor: theme.bgSecondary },
                ]}
                value={proveedor}
                onChangeText={setProveedor}
                placeholder="Ej. Import3D Bolivia"
                placeholderTextColor={theme.textSecondary}
              />
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
                Guardar filamento
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

function Chip({
  label,
  activo,
  theme,
  onPress,
}: {
  label: string;
  activo: boolean;
  theme: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: activo ? theme.primary : theme.bgSecondary },
      ]}
    >
      <Text
        style={{
          color: activo ? "#fff" : theme.textSecondary,
          fontSize: 12.5,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  colorChip: { width: 32, height: 32, borderRadius: 8, borderWidth: 2 },
  colorLabel: { fontSize: 12, marginTop: 6 },

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
