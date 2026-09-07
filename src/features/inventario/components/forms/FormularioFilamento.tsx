// src/components/forms/FormularioFilamento.tsx
import type { NuevoFilamento } from "@/features/inventario/types";
import { formatToDbDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type MaterialFilamentoUI = "PLA" | "PETG" | "ABS" | "TPU" | "Resina";

const MATERIALES: MaterialFilamentoUI[] = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "Resina",
];

const COLOR_NAMED_MAP: Record<string, string> = {
  "neon green": "#39FF14",
  "verde neon": "#39FF14",
  "verde neón": "#39FF14",
  "silk gold": "#D4AF37",
  "oro silk": "#D4AF37",
  dorado: "#FFD700",
  copper: "#B87333",
  cobre: "#B87333",
  silver: "#C0C0C0",
  plata: "#C0C0C0",
  black: "#111111",
  negro: "#111111",
  white: "#FFFFFF",
  blanco: "#FFFFFF",
  red: "#DC2626",
  rojo: "#DC2626",
  blue: "#2563EB",
  azul: "#2563EB",
  yellow: "#F59E0B",
  amarillo: "#F59E0B",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  orange: "#FF6600",
  naranja: "#FF6600",
  purple: "#800080",
  morado: "#800080",
};

// ---------------------------------------------------------------------
// HELPERS DE SANITIZACIÓN EN TIEMPO REAL
// ---------------------------------------------------------------------
const sanitizeInteger = (value: string, maxVal?: number): string => {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10);
  if (maxVal !== undefined && num > maxVal) return String(maxVal);
  return String(num);
};

const sanitizeDecimal = (value: string): string => {
  let clean = value.replace(/[^0-9.]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return clean;
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
  onGuardar: (f: NuevoFilamento & { imagenUrl?: string }) => void | Promise<void>;
}) {
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState<MaterialFilamentoUI>("PLA");
  const [nombreColor, setNombreColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [stockGramos, setStockGramos] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [umbralBajoStock, setUmbralBajoStock] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const handleColorInputChange = (texto: string) => {
    setNombreColor(texto);
    const busqueda = texto.toLowerCase().trim();

    if (!busqueda) {
      setColorHex("");
      return;
    }

    if (/^#?([0-9A-F]{3}){1,2}$/i.test(busqueda)) {
      setColorHex(busqueda.startsWith("#") ? busqueda : `#${busqueda}`);
      return;
    }

    if (COLOR_NAMED_MAP[busqueda]) {
      setColorHex(COLOR_NAMED_MAP[busqueda]);
    } else {
      setColorHex("");
    }
  };

  // ---------------------------------------------------------------------
  // SELECCIÓN DE IMAGEN DESDE GALERÍA
  // ---------------------------------------------------------------------
  const seleccionarImagenGaleria = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        "Permiso denegado",
        "Se necesitan permisos de acceso a la galería para seleccionar una imagen."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagenSeleccionada(result.assets[0].uri);
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    const stockNum = Number(stockGramos);
    const umbralNum = Number(umbralBajoStock);
    const costoNum = Number(costoCompra);

    if (!marca.trim()) nuevosErrores.marca = "Escriba el nombre de la marca";
    if (!nombreColor.trim()) nuevosErrores.color = "Escriba el nombre del color";

    if (!stockGramos) {
      nuevosErrores.stock = "Ingrese el stock inicial";
    } else if (isNaN(stockNum) || stockNum <= 0) {
      nuevosErrores.stock = "El stock debe ser mayor a 0g";
    } else if (stockNum > 1000) {
      nuevosErrores.stock = "El stock no puede superar los 1000g";
    }

    const maxUmbralPermitido = stockNum > 0 ? stockNum * 0.8 : 0;
    if (!umbralBajoStock) {
      nuevosErrores.umbral = "Ingrese la alerta de stock";
    } else if (stockNum > 0 && umbralNum > maxUmbralPermitido) {
      nuevosErrores.umbral = `No puede superar el 80% del stock (${Math.floor(maxUmbralPermitido)}g)`;
    }

    if (!costoCompra) {
      nuevosErrores.costo = "Ingrese el costo de compra";
    } else if (isNaN(costoNum) || costoNum <= 0) {
      nuevosErrores.costo = "Ingrese un valor válido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarYCerrar = () => {
    setMarca("");
    setTipo("PLA");
    setNombreColor("");
    setColorHex("");
    setStockGramos("");
    setCostoCompra("");
    setProveedor("");
    setUmbralBajoStock("");
    setIntentoGuardar(false);
    setErrores({});
    setImagenSeleccionada(null);
    onClose();
  };

  const guardar = async () => {
    setIntentoGuardar(true);
    const esValido = validarFormulario();

    if (!esValido || guardando) return;

    const nuevo = {
      marca: marca.trim(),
      tipo,
      color: nombreColor.trim(),
      colorHex: colorHex || "#808080",
      capacidadRolloGramos: 1000,
      costoCompra: Number(costoCompra),
      stockGramos: Number(stockGramos),
      umbralBajoStock: Number(umbralBajoStock),
      fechaCompra: formatToDbDate(new Date()),
      proveedor: proveedor.trim() || "—",
      imagenUrl: imagenSeleccionada || undefined,
    };

    try {
      setGuardando(true);
      await onGuardar(nuevo);
      limpiarYCerrar();
    } finally {
      setGuardando(false);
    }
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

            {/* SELECCIÓN Y PREVISUALIZACIÓN DE IMAGEN (ANTES DE MARCA) */}
            <Campo theme={theme} label="Imagen del filamento" icon="image-outline">
              <View style={styles.seccionImagenes}>
                {imagenSeleccionada ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: imagenSeleccionada }} style={styles.imgPreview} />
                    <TouchableOpacity
                      style={styles.quitarImgBtn}
                      onPress={() => setImagenSeleccionada(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.cargarImgBtn, { borderColor: theme.primary }]}
                    onPress={seleccionarImagenGaleria}
                  >
                    <Ionicons name="images-outline" size={18} color={theme.primary} />
                    <Text style={[styles.cargarImgText, { color: theme.primary }]}>
                      Subir imagen desde galería
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Campo>

            {/* MARCA */}
            <Campo
              theme={theme}
              label="Marca"
              icon="pricetag-outline"
              error={intentoGuardar ? errores.marca : ""}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.textPrimary,
                    borderColor:
                      intentoGuardar && errores.marca
                        ? theme.danger || "#EF4444"
                        : theme.bgSecondary,
                  },
                ]}
                value={marca}
                onChangeText={(v) => {
                  setMarca(v);
                  if (errores.marca) setErrores((prev) => ({ ...prev, marca: "" }));
                }}
                placeholder="Ej. Polymaker, eSun..."
                placeholderTextColor={theme.textSecondary}
              />
            </Campo>

            {/* MATERIAL */}
            <Campo theme={theme} label="Material" icon="cube-outline">
              <View style={styles.chipsRow}>
                {MATERIALES.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    activo={tipo === m}
                    theme={theme}
                    onPress={() => setTipo(m)}
                  />
                ))}
              </View>
            </Campo>

            {/* COLOR */}
            <Campo
              theme={theme}
              label="Color"
              icon="color-palette-outline"
              error={intentoGuardar ? errores.color : ""}
            >
              <View style={styles.colorInlineRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.colorNameInput,
                    {
                      color: theme.textPrimary,
                      borderColor:
                        intentoGuardar && errores.color
                          ? theme.danger || "#EF4444"
                          : theme.bgSecondary,
                    },
                  ]}
                  value={nombreColor}
                  onChangeText={(v) => {
                    handleColorInputChange(v);
                    if (errores.color) setErrores((prev) => ({ ...prev, color: "" }));
                  }}
                  placeholder="Ej. Blue, Silk Gold, #2563EB"
                  placeholderTextColor={theme.textSecondary}
                />

                <View
                  style={[
                    styles.colorPreviewBox,
                    {
                      backgroundColor: colorHex || "transparent",
                      borderColor: colorHex ? "rgba(0,0,0,0.15)" : theme.bgSecondary,
                    },
                  ]}
                >
                  {!colorHex && (
                    <Ionicons
                      name="color-filter-outline"
                      size={18}
                      color={theme.textSecondary}
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.hexReadOnlyBadge,
                    {
                      borderColor: theme.bgSecondary,
                      backgroundColor: theme.bgSecondary || "#F1F5F9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.hexReadOnlyText,
                      { color: theme.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {colorHex || "---"}
                  </Text>
                </View>
              </View>
            </Campo>

            {/* STOCK INICIAL Y COSTO */}
            <View style={styles.filaDoble}>
              <Campo
                theme={theme}
                label="Stock inicial"
                icon="scale-outline"
                flex
                error={intentoGuardar ? errores.stock : ""}
              >
                <InputConUnidad
                  theme={theme}
                  value={stockGramos}
                  onChangeText={(v) => {
                    setStockGramos(sanitizeInteger(v, 1000));
                    if (errores.stock) setErrores((prev) => ({ ...prev, stock: "" }));
                  }}
                  unidad="g"
                  keyboardType="number-pad"
                  placeholder="Máx 1000"
                  hasError={intentoGuardar && Boolean(errores.stock)}
                />
              </Campo>

              <Campo
                theme={theme}
                label="Costo por rollo"
                icon="cash-outline"
                flex
                error={intentoGuardar ? errores.costo : ""}
              >
                <InputConUnidad
                  theme={theme}
                  value={costoCompra}
                  onChangeText={(v) => {
                    setCostoCompra(sanitizeDecimal(v));
                    if (errores.costo) setErrores((prev) => ({ ...prev, costo: "" }));
                  }}
                  unidad="Bs"
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  hasError={intentoGuardar && Boolean(errores.costo)}
                />
              </Campo>
            </View>

            {/* ALERTA Y PROVEEDOR */}
            <View style={styles.filaDoble}>
              <Campo
                theme={theme}
                label="Alerta bajo stock"
                icon="warning-outline"
                flex
                error={intentoGuardar ? errores.umbral : ""}
              >
                <InputConUnidad
                  theme={theme}
                  value={umbralBajoStock}
                  onChangeText={(v) => {
                    setUmbralBajoStock(sanitizeInteger(v));
                    if (errores.umbral) setErrores((prev) => ({ ...prev, umbral: "" }));
                  }}
                  unidad="g"
                  keyboardType="number-pad"
                  placeholder="Ej. 200"
                  hasError={intentoGuardar && Boolean(errores.umbral)}
                />
              </Campo>

              <Campo
                theme={theme}
                label="Proveedor (opcional)"
                icon="business-outline"
                flex
              >
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.textPrimary, borderColor: theme.bgSecondary },
                  ]}
                  value={proveedor}
                  onChangeText={setProveedor}
                  placeholder="Ej. Import3D"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity
              style={[
                styles.guardarBtn,
                { backgroundColor: theme.primary },
              ]}
              disabled={guardando}
              onPress={guardar}
            >
              <Text style={styles.guardarBtnText}>
                {guardando ? "Guardando..." : "Guardar filamento"}
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

function InputConUnidad({
  theme,
  value,
  onChangeText,
  unidad,
  keyboardType = "default",
  placeholder,
  hasError,
}: {
  theme: any;
  value: string;
  onChangeText: (text: string) => void;
  unidad: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "numeric";
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <View
      style={[
        styles.inputUnidadContainer,
        {
          borderColor: hasError ? theme.danger || "#EF4444" : theme.bgSecondary,
        },
      ]}
    >
      <TextInput
        style={[styles.inputUnidadText, { color: theme.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
      />
      <Text style={[styles.unidadText, { color: theme.textSecondary }]}>
        {unidad}
      </Text>
    </View>
  );
}

function Campo({
  theme,
  label,
  icon,
  children,
  flex,
  error,
}: {
  theme: any;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  flex?: boolean;
  error?: string;
}) {
  return (
    <View style={[styles.campo, flex && { flex: 1 }]}>
      <View style={styles.labelRow}>
        {icon && (
          <Ionicons name={icon} size={13} color={theme.textSecondary} />
        )}
        <Text style={[styles.campoLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>
      {children}
      {Boolean(error) && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={12} color={theme.danger || "#EF4444"} />
          <Text style={[styles.errorText, { color: theme.danger || "#EF4444" }]}>
            {error}
          </Text>
        </View>
      )}
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
    maxHeight: "92%",
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

  campo: { marginBottom: 14, gap: 4 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
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

  colorInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorNameInput: {
    flex: 1,
  },
  colorPreviewBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  hexReadOnlyBadge: {
    width: 75,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.85,
  },
  hexReadOnlyText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  seccionImagenes: {
    marginTop: 4,
  },
  cargarImgBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  cargarImgText: {
    fontSize: 13,
    fontWeight: "700",
  },
  previewContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  imgPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  quitarImgBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },

  inputUnidadContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputUnidadText: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14.5,
  },
  unidadText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 4,
  },

  filaDoble: { flexDirection: "row", gap: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },

  guardarBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  guardarBtnText: { fontSize: 14.5, fontWeight: "700", color: "#fff" },
  cancelarBtn: { alignItems: "center", paddingVertical: 12 },
  cancelarBtnText: { fontSize: 13, fontWeight: "600" },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
  },
});