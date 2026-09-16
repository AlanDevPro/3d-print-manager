import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { LabeledField } from "@/components/ui/LabeledField";
import type { PiezaFormState } from "@/features/cotizacion/types/formTypes";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeDecimal, sanitizeInteger } from "@/utils/formSanitizers";

interface PiezaCamposFormProps {
  pieza: PiezaFormState;
  onUpdateField: (
    id: string,
    field: keyof Omit<PiezaFormState, "id">,
    value: string,
  ) => void;
}

export function PiezaCamposForm({
  pieza,
  onUpdateField,
}: PiezaCamposFormProps) {
  const { theme } = useTheme();
  const [tomandoFoto, setTomandoFoto] = useState(false);

  const tomarFotoPieza = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requiere acceso a la cámara para fotografiar la pieza.",
        );
        return;
      }

      setTomandoFoto(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onUpdateField(pieza.id, "foto_pieza", result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Error",
        "No se pudo capturar la foto de la pieza. Intenta nuevamente.",
      );
    } finally {
      setTomandoFoto(false);
    }
  };

  return (
    <View style={styles.content}>
      <LabeledField
        icon="pricetag-outline"
        label="Nombre de la Pieza / Modelo"
        placeholder="Ej. Soporte para Headset / Engranaje M4"
        value={pieza.nombre_pieza}
        onChangeText={(v) => onUpdateField(pieza.id, "nombre_pieza", v)}
        surface="primary"
      />

      <View style={styles.row}>
        <LabeledField
          icon="scale-outline"
          label="Peso por pieza"
          placeholder="Ej. 120"
          value={pieza.peso_gramos}
          onChangeText={(v) =>
            onUpdateField(pieza.id, "peso_gramos", sanitizeDecimal(v))
          }
          keyboardType="decimal-pad"
          unit="g"
          surface="primary"
          containerStyle={styles.flex1}
        />
        <LabeledField
          icon="layers-outline"
          label="Cantidad"
          placeholder="Ej. 1"
          value={pieza.cantidad}
          onChangeText={(v) =>
            onUpdateField(pieza.id, "cantidad", sanitizeInteger(v))
          }
          keyboardType="number-pad"
          unit="uds"
          surface="primary"
          containerStyle={[styles.flex1, styles.ml8]}
        />
      </View>

      <View style={styles.row}>
        <LabeledField
          icon="time-outline"
          label="Tiempo de impresión"
          placeholder="Horas"
          value={pieza.tiempo_impresion_horas}
          onChangeText={(v) =>
            onUpdateField(
              pieza.id,
              "tiempo_impresion_horas",
              sanitizeInteger(v),
            )
          }
          keyboardType="number-pad"
          unit="hrs"
          surface="primary"
          containerStyle={styles.flex1}
        />
        <LabeledField
          label=" "
          placeholder="Minutos"
          value={pieza.tiempo_impresion_minutos}
          onChangeText={(v) =>
            onUpdateField(
              pieza.id,
              "tiempo_impresion_minutos",
              sanitizeInteger(v, 59),
            )
          }
          keyboardType="number-pad"
          maxLength={2}
          unit="min"
          surface="primary"
          containerStyle={[styles.flex1, styles.ml8]}
          icon={"search"}
        />
      </View>

      {/* 📸 Foto de la pieza — obligatoria, justo debajo del tiempo de impresión */}
      <View style={styles.labelGroup}>
        <Ionicons name="image-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Foto de la pieza
        </Text>
      </View>
      <Pressable
        style={[
          styles.fotoButton,
          {
            backgroundColor: theme.bgSurface,
            borderColor: pieza.foto_pieza ? theme.primary : theme.border,
          },
        ]}
        onPress={tomarFotoPieza}
        disabled={tomandoFoto}
      >
        <Ionicons
          name={
            pieza.foto_pieza ? "checkmark-circle-outline" : "camera-outline"
          }
          size={20}
          color={theme.primary}
        />
        <Text style={[styles.fotoButtonText, { color: theme.textSecondary }]}>
          {tomandoFoto
            ? "Abriendo cámara..."
            : pieza.foto_pieza
              ? "Volver a tomar foto"
              : "Tomar foto de la pieza"}
        </Text>
      </Pressable>
      {pieza.foto_pieza ? (
        <Image source={{ uri: pieza.foto_pieza }} style={styles.preview} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 6 },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  ml8: { marginLeft: 8 },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: "600" },
  fotoButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  fotoButtonText: { fontSize: 13, fontWeight: "500" },
  preview: { width: "100%", height: 160, borderRadius: 8, marginTop: 10 },
});
