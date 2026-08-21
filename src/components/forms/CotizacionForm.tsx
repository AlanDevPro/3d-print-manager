import { EmptyState } from "@/components/ui/EmptyState";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export function CotizacionForm() {
  const { theme } = useTheme();
  const {
    form,
    updateField,
    impresoras,
    materiales,
    cargandoDatos,
    calculando,
    error,
    calcular,
  } = useCotizacion();

  const [esPersonalizado, setEsPersonalizado] = useState(false);
  const [imagenUri, setImagenUri] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      calcular();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    form.material_id,
    form.impresora_id,
    form.peso_gramos,
    form.cantidad,
    form.tiempo_impresion_horas,
    form.tiempo_impresion_minutos,
    form.porcentaje_riesgo,
    form.precio_personalizacion,
    esPersonalizado,
  ]);

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setImagenUri(uri);
      updateField("imagen_referencia", uri);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.mutedText, { color: theme.textSecondary }]}>
          Cargando datos del sistema...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerRealtime}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={22} color={theme.primary} />
          <Text style={[styles.mainSectionTitle, { color: theme.textPrimary }]}>
            Parámetros de Cotización
          </Text>
        </View>
        {calculando && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {/* 1. SELECCIÓN DE MATERIAL */}
      <View style={styles.labelGroup}>
        <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Material
        </Text>
      </View>
      {materiales.length === 0 ? (
        <EmptyState
          icono="cube-outline"
          mensaje="No hay materiales registrados en tu catálogo."
        />
      ) : (
        <View style={styles.chipsRow}>
          {materiales.map((mat) => {
            const selected = form.material_id === mat.id;
            return (
              <Pressable
                key={mat.id}
                onPress={() => updateField("material_id", mat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.primary : theme.bgSurface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={selected ? "#FFFFFF" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: selected ? "700" : "500",
                    },
                  ]}
                >
                  {mat.tipo} {mat.color ? `- ${mat.color}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 2. PESO Y CANTIDAD */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <View style={styles.labelGroup}>
            <Ionicons
              name="scale-outline"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Peso por pieza
            </Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Ej. 120"
              placeholderTextColor={theme.textMuted}
              value={form.peso_gramos}
              onChangeText={(v) => updateField("peso_gramos", v)}
              keyboardType="numeric"
            />
            <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
              g
            </Text>
          </View>
        </View>

        <View style={[styles.flex1, styles.ml8]}>
          <View style={styles.labelGroup}>
            <Ionicons
              name="layers-outline"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Cantidad
            </Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Ej. 1"
              placeholderTextColor={theme.textMuted}
              value={form.cantidad}
              onChangeText={(v) => updateField("cantidad", v)}
              keyboardType="numeric"
            />
            <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
              uds
            </Text>
          </View>
        </View>
      </View>

      {/* 3. TIEMPO DE IMPRESIÓN */}
      <View style={styles.labelGroup}>
        <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Tiempo de impresión por pieza
        </Text>
      </View>
      <View style={styles.row}>
        <View
          style={[
            styles.inputContainer,
            styles.flex1,
            { backgroundColor: theme.bgSurface, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.inputField, { color: theme.textPrimary }]}
            placeholder="Horas"
            placeholderTextColor={theme.textMuted}
            value={form.tiempo_impresion_horas}
            onChangeText={(v) => updateField("tiempo_impresion_horas", v)}
            keyboardType="numeric"
          />
          <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
            hrs
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            styles.flex1,
            styles.ml8,
            { backgroundColor: theme.bgSurface, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.inputField, { color: theme.textPrimary }]}
            placeholder="Minutos"
            placeholderTextColor={theme.textMuted}
            value={form.tiempo_impresion_minutos}
            onChangeText={(v) => updateField("tiempo_impresion_minutos", v)}
            keyboardType="numeric"
          />
          <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
            min
          </Text>
        </View>
      </View>

      {/* 4. SELECCIÓN DE IMPRESORA */}
      <View style={styles.labelGroup}>
        <Ionicons
          name="hardware-chip-outline"
          size={16}
          color={theme.textSecondary}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Impresora
        </Text>
      </View>
      {impresoras.length === 0 ? (
        <EmptyState
          icono="hardware-chip-outline"
          mensaje="No tienes impresoras 3D registradas."
        />
      ) : (
        <View style={styles.chipsRow}>
          {impresoras.map((imp) => {
            const selected = form.impresora_id === imp.id;
            return (
              <Pressable
                key={imp.id}
                onPress={() => updateField("impresora_id", imp.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.primary : theme.bgSurface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={selected ? "#FFFFFF" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: selected ? "700" : "500",
                    },
                  ]}
                >
                  {imp.nombre}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 5. RIESGO DE IMPRESIÓN (%) */}
      <View style={styles.labelGroup}>
        <Ionicons
          name="warning-outline"
          size={16}
          color={theme.textSecondary}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Riesgo de impresión
        </Text>
      </View>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <TextInput
          style={[styles.inputField, { color: theme.textPrimary }]}
          placeholder="Ej. 20"
          placeholderTextColor={theme.textMuted}
          value={form.porcentaje_riesgo}
          onChangeText={(v) => updateField("porcentaje_riesgo", v)}
          keyboardType="numeric"
        />
        <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
          %
        </Text>
      </View>

      {/* 6. SWITCH PERSONALIZACIÓN */}
      <View
        style={[
          styles.switchCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <View style={styles.switchRow}>
          <View style={styles.labelGroupNoMargin}>
            <Ionicons
              name="brush-outline"
              size={18}
              color={theme.textPrimary}
            />
            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
              Trabajo de Personalización
            </Text>
          </View>
          <Switch
            value={esPersonalizado}
            onValueChange={(val) => {
              setEsPersonalizado(val);
              if (!val) updateField("precio_personalizacion", "0");
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        {esPersonalizado && (
          <View
            style={[
              styles.inputContainer,
              styles.mt8,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Costo por modelado o acabado"
              placeholderTextColor={theme.textMuted}
              value={form.precio_personalizacion}
              onChangeText={(v) => updateField("precio_personalizacion", v)}
              keyboardType="numeric"
            />
            <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
              Bs
            </Text>
          </View>
        )}
      </View>

      {/* 7. IMAGEN DE REFERENCIA */}
      <View style={styles.labelGroup}>
        <Ionicons name="image-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Imagen de referencia
        </Text>
      </View>
      <Pressable
        style={[
          styles.imagePickerButton,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
        onPress={seleccionarImagen}
      >
        <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
        <Text style={[styles.imagePickerText, { color: theme.textSecondary }]}>
          {imagenUri
            ? "Cambiar imagen de la pieza"
            : "Subir imagen o render de la pieza"}
        </Text>
      </Pressable>
      {imagenUri && (
        <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={16} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  headerRealtime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mainSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  mutedText: {
    marginTop: 8,
    fontSize: 14,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  labelGroupNoMargin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  unitBadge: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    opacity: 0.8,
  },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  ml8: { marginLeft: 8 },
  mt8: { marginTop: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  switchCard: {
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  imagePickerButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  imagePickerText: { fontSize: 13, fontWeight: "500" },
  imagePreview: { width: "100%", height: 160, borderRadius: 8, marginTop: 10 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  errorText: { fontSize: 13 },
});
