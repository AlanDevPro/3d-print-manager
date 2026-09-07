// src/features/cotizacion/components/forms/CotizacionForm.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ClienteResumen } from "@/features/clientes/types";
import { useAutoCalculoCotizacion } from "@/features/cotizacion/hooks/useAutoCalculoCotizacion";
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import type {
  MaterialItem,
  ReglaMargen,
} from "@/features/cotizacion/types/formTypes";
import { useTheme } from "@/hooks/useTheme";

import { ClienteInfoSection } from "./sections/ClienteInfoSection";
import { ImagenReferenciaPicker } from "./sections/ImagenReferenciaPicker";
import { ImpresoraSelector } from "./sections/ImpresoraSelector";
import { MargenGananciaSelector } from "./sections/MargenGananciaSelector";
import { MaterialSelector } from "./sections/MaterialSelector";
import { PersonalizacionSwitch } from "./sections/PersonalizacionSwitch";
import { PiezasSection } from "./sections/PiezasSection";
import { RiesgoInput } from "./sections/RiesgoInput";

type CotizacionFormProps = Pick<
  UseCotizacionReturn,
  | "form"
  | "updateField"
  | "piezas"
  | "piezaActivaId"
  | "updatePiezaField"
  | "agregarPieza"
  | "eliminarPieza"
  | "seleccionarPieza"
  | "impresoras"
  | "cargandoDatos"
  | "calculando"
  | "error"
  | "calcular"
> & {
  materiales: MaterialItem[];
  clientes?: ClienteResumen[];
  reglasMargen?: ReglaMargen[];
};

export function CotizacionForm({
  form,
  updateField,
  piezas,
  piezaActivaId,
  updatePiezaField,
  agregarPieza,
  eliminarPieza,
  seleccionarPieza,
  impresoras = [],
  materiales = [],
  cargandoDatos,
  calculando,
  error,
  calcular,
  clientes = [],
  reglasMargen = [],
}: CotizacionFormProps) {
  const { theme } = useTheme();

  const [esPersonalizado, setEsPersonalizado] = useState<boolean>(
    () => Number(form.precio_personalizacion) > 0,
  );
  
  // Usamos form.imagen_referencia como la fuente de verdad directa
  const imagenUri = form.imagen_referencia || null;

  const { validationError } = useAutoCalculoCotizacion({
    form,
    piezas,
    updateField,
    calcular,
    reglasMargen,
    esPersonalizado,
  });

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requiere acceso a la cámara para tomar fotos de referencia.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7, // 0.7 reduce el consumo de memoria en dispositivos móviles
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        // Se actualiza el campo del formulario global sin romper el cálculo
        updateField("imagen_referencia", uri);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo capturar la imagen. Intenta nuevamente.");
    }
  };

  if (cargandoDatos) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.mutedText, { color: theme.textSecondary }]}>
          Cargando impresoras y materiales...
        </Text>
      </View>
    );
  }

  const activeError = validationError || error;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bgPrimary }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRealtime}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={22} color={theme.primary} />
          <Text style={[styles.mainSectionTitle, { color: theme.textPrimary }]}>
            Parámetros de Cotización
          </Text>
        </View>
        {calculando && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>
        Información del Cliente
      </Text>
      <ClienteInfoSection
        clientes={clientes}
        clienteId={form.cliente_id}
        nombreCliente={form.nombre_cliente}
        telefonoCliente={form.telefono_cliente}
        onSeleccionarCliente={(c) => {
          updateField("cliente_id", c.id);
          updateField("nombre_cliente", c.nombre);
          if (c.telefono) updateField("telefono_cliente", c.telefono);
        }}
        onChangeNombre={(v) => updateField("nombre_cliente", v)}
        onChangeTelefono={(v) => updateField("telefono_cliente", v)}
      />

      <View style={styles.sectionDivider} />

      <MaterialSelector
        materiales={materiales}
        filamentoId={form.filamento_id}
        onSeleccionar={(id) => updateField("filamento_id", id)}
      />

      <PiezasSection
        piezas={piezas}
        piezaActivaId={piezaActivaId}
        updatePiezaField={updatePiezaField}
        agregarPieza={agregarPieza}
        eliminarPieza={eliminarPieza}
        seleccionarPieza={seleccionarPieza}
      />

      <ImpresoraSelector
        impresoras={impresoras as any}
        impresoraId={form.impresora_id}
        onSeleccionar={(id) => updateField("impresora_id", id)}
      />

      <RiesgoInput
        value={form.porcentaje_riesgo}
        onChangeText={(v) => updateField("porcentaje_riesgo", v)}
      />

      <MargenGananciaSelector
        reglasMargen={reglasMargen}
        reglaMargenId={form.regla_margen_id}
        margenGananciaPct={form.margen_ganancia_pct}
        onSeleccionar={(regla) => {
          updateField("margen_ganancia_pct", String(regla.margen_ganancia_pct));
          updateField("regla_margen_id", regla.id);
        }}
      />

      <PersonalizacionSwitch
        activo={esPersonalizado}
        precio={form.precio_personalizacion}
        onToggle={(val) => {
          setEsPersonalizado(val);
          if (!val) updateField("precio_personalizacion", "0");
        }}
        onChangePrecio={(v) => updateField("precio_personalizacion", v)}
      />

      <ImagenReferenciaPicker
        imagenUri={imagenUri}
        onTomarFoto={tomarFoto}
      />

      {Boolean(activeError) && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {activeError}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
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
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  mainSectionTitle: { fontSize: 18, fontWeight: "700" },
  subSectionTitle: { fontSize: 15, fontWeight: "700", marginVertical: 4 },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginVertical: 14,
  },
  mutedText: { marginTop: 8, fontSize: 14 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: { fontSize: 13, fontWeight: "500" },
});