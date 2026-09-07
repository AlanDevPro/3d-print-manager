// src/components/forms/FormularioImpresora.tsx
import type { NuevaImpresora } from "@/features/inventario/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
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

interface ErroresFormulario {
  modelo?: string;
  marca?: string;
  consumoWatts?: string;
  costoAdquisicion?: string;
  vidaUtilHoras?: string;
  costoMantenimientoHora?: string;
}

export function FormularioImpresora({
  visible,
  theme,
  onClose,
  onGuardar,
}: {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onGuardar: (i: NuevaImpresora) => void | Promise<void>;
}) {
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [consumoWatts, setConsumoWatts] = useState("");
  const [costoAdquisicion, setCostoAdquisicion] = useState("");
  const [vidaUtilHoras, setVidaUtilHoras] = useState("8000");
  const [costoMantenimientoHora, setCostoMantenimientoHora] = useState("");
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<ErroresFormulario>({});

  // --- Selección de Imagen ---
  const seleccionarImagen = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Se requieren permisos para acceder a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagenUrl(result.assets[0].uri);
    }
  };

  const eliminarImagen = () => {
    setImagenUrl(null);
  };

  // --- Máscaras de Sanitización Sincrónicas ---
  const handleEnteroPositive = (
    text: string,
    setter: (val: string) => void,
    fieldKey: keyof ErroresFormulario
  ) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setter(cleaned);
    if (errores[fieldKey]) {
      setErrores((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  const handleDecimalPositive = (
    text: string,
    setter: (val: string) => void,
    fieldKey: keyof ErroresFormulario
  ) => {
    let cleaned = text.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    setter(cleaned);
    if (errores[fieldKey]) {
      setErrores((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  const handleTextChange = (
    text: string,
    setter: (val: string) => void,
    fieldKey: keyof ErroresFormulario
  ) => {
    setter(text);
    if (errores[fieldKey]) {
      setErrores((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  // --- Validación Profesional ---
  const validarCampos = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    if (!marca.trim()) {
      nuevosErrores.marca = "La marca es requerida";
    }

    if (!modelo.trim()) {
      nuevosErrores.modelo = "El modelo es requerido";
    }

    const consumoNum = Number(consumoWatts);
    if (!consumoWatts.trim()) {
      nuevosErrores.consumoWatts = "Requerido";
    } else if (isNaN(consumoNum) || consumoNum <= 0) {
      nuevosErrores.consumoWatts = "Debe ser > 0";
    }

    const costoAdqNum = Number(costoAdquisicion);
    if (!costoAdquisicion.trim()) {
      nuevosErrores.costoAdquisicion = "Requerido";
    } else if (isNaN(costoAdqNum) || costoAdqNum < 0) {
      nuevosErrores.costoAdquisicion = "Inválido";
    }

    const vidaUtilNum = Number(vidaUtilHoras);
    if (!vidaUtilHoras.trim()) {
      nuevosErrores.vidaUtilHoras = "Requerido";
    } else if (isNaN(vidaUtilNum) || vidaUtilNum <= 0) {
      nuevosErrores.vidaUtilHoras = "Debe ser > 0";
    }

    if (costoMantenimientoHora.trim() !== "") {
      const mantNum = Number(costoMantenimientoHora);
      if (isNaN(mantNum) || mantNum < 0) {
        nuevosErrores.costoMantenimientoHora = "Inválido";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarYCerrar = () => {
    setModelo("");
    setMarca("");
    setConsumoWatts("");
    setCostoAdquisicion("");
    setVidaUtilHoras("8000");
    setCostoMantenimientoHora("");
    setImagenUrl(null);
    setErrores({});
    onClose();
  };

  const guardar = async () => {
    if (guardando) return;

    if (!validarCampos()) {
      return;
    }

    const nueva: NuevaImpresora = {
      modelo: modelo.trim(),
      marca: marca.trim(),
      costoAdquisicion: Number(costoAdquisicion),
      vidaUtilHoras: Number(vidaUtilHoras) || 8000,
      consumoWatts: Number(consumoWatts),
      costoMantenimientoHora: Number(costoMantenimientoHora) || 0,
      ...(imagenUrl ? { imagenUrl } : {}),
    };

    try {
      setGuardando(true);
      await onGuardar(nueva);
      limpiarYCerrar();
    } finally {
      setGuardando(false);
    }
  };

  const dangerColor = theme.danger || "#EF4444";

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

            {/* --- SECCIÓN DE SELECCIÓN DE IMAGEN --- */}
            <Campo theme={theme} label="Fotografía de la Impresora">
              {imagenUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imagenUrl }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={eliminarImagen}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.uploadContainer,
                    {
                      borderColor: theme.border ? theme.border + "60" : theme.bgSecondary,
                      backgroundColor: theme.bgSecondary + "40",
                    },
                  ]}
                  onPress={seleccionarImagen}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={26} color={theme.primary} />
                  <Text style={[styles.uploadText, { color: theme.textSecondary }]}>
                    Toca para subir una foto
                  </Text>
                </TouchableOpacity>
              )}
            </Campo>

            {/* Marca y Modelo */}
            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Marca" icon="pricetag-outline" error={errores.marca} flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: errores.marca ? dangerColor : theme.bgSecondary,
                    },
                  ]}
                  value={marca}
                  onChangeText={(t) => handleTextChange(t, setMarca, "marca")}
                  placeholder="Ej. Creality"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>

              <Campo theme={theme} label="Modelo" icon="cube-outline" error={errores.modelo} flex>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: errores.modelo ? dangerColor : theme.bgSecondary,
                    },
                  ]}
                  value={modelo}
                  onChangeText={(t) => handleTextChange(t, setModelo, "modelo")}
                  placeholder="Ej. Ender 3 V2"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            </View>

            {/* Consumo y Costo de Adquisición */}
            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Consumo" icon="flash-outline" error={errores.consumoWatts} flex>
                <InputConUnidad
                  theme={theme}
                  value={consumoWatts}
                  onChangeText={(t) => handleEnteroPositive(t, setConsumoWatts, "consumoWatts")}
                  unidad="W"
                  keyboardType="numeric"
                  placeholder="220"
                  hasError={!!errores.consumoWatts}
                />
              </Campo>

              <Campo theme={theme} label="Costo adquisición" icon="cash-outline" error={errores.costoAdquisicion} flex>
                <InputConUnidad
                  theme={theme}
                  value={costoAdquisicion}
                  onChangeText={(t) => handleDecimalPositive(t, setCostoAdquisicion, "costoAdquisicion")}
                  unidad="Bs"
                  keyboardType="numeric"
                  placeholder="1400"
                  hasError={!!errores.costoAdquisicion}
                />
              </Campo>
            </View>

            {/* Vida Útil y Mantenimiento */}
            <View style={styles.filaDoble}>
              <Campo theme={theme} label="Vida útil estimada" icon="time-outline" error={errores.vidaUtilHoras} flex>
                <InputConUnidad
                  theme={theme}
                  value={vidaUtilHoras}
                  onChangeText={(t) => handleEnteroPositive(t, setVidaUtilHoras, "vidaUtilHoras")}
                  unidad="h"
                  keyboardType="numeric"
                  hasError={!!errores.vidaUtilHoras}
                />
              </Campo>

              <Campo theme={theme} label="Mantenimiento" icon="build-outline" error={errores.costoMantenimientoHora} flex>
                <InputConUnidad
                  theme={theme}
                  value={costoMantenimientoHora}
                  onChangeText={(t) => handleDecimalPositive(t, setCostoMantenimientoHora, "costoMantenimientoHora")}
                  unidad="Bs/h"
                  keyboardType="numeric"
                  placeholder="0.00"
                  hasError={!!errores.costoMantenimientoHora}
                />
              </Campo>
            </View>

            {/* Botones de Acción */}
            <TouchableOpacity
              style={[
                styles.guardarBtn,
                {
                  backgroundColor: guardando ? theme.bgSecondary : theme.primary,
                },
              ]}
              disabled={guardando}
              onPress={guardar}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.guardarBtnText,
                  {
                    color: guardando ? theme.textSecondary : "#fff",
                  },
                ]}
              >
                {guardando ? "Guardando..." : "Guardar impresora"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelarBtn}
              onPress={limpiarYCerrar}
              disabled={guardando}
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
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  hasError?: boolean;
}) {
  const dangerColor = theme.danger || "#EF4444";

  return (
    <View
      style={[
        styles.inputUnidadContainer,
        { borderColor: hasError ? dangerColor : theme.bgSecondary },
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
  const dangerColor = theme.danger || "#EF4444";

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
      {error && (
        <Text style={[styles.errorText, { color: dangerColor }]}>
          {error}
        </Text>
      )}
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

  /* --- Subida de Imagen --- */
  uploadContainer: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    padding: 6,
    borderRadius: 8,
  },

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
    fontSize: 12.5,
    fontWeight: "700",
    marginLeft: 4,
  },

  errorText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  filaDoble: { flexDirection: "row", gap: 10 },

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