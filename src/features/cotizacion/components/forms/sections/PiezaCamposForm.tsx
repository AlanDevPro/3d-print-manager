// src/features/cotizacion/components/forms/sections/PiezaCamposForm.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { LabeledField } from "@/components/ui/LabeledField";
import { sanitizeDecimal, sanitizeInteger } from "@/utils/formSanitizers";
import type { PiezaFormState } from "@/features/cotizacion/types/formTypes";

interface PiezaCamposFormProps {
  pieza: PiezaFormState;
  onUpdateField: (
    id: string,
    field: keyof Omit<PiezaFormState, "id">,
    value: string
  ) => void;
}

export function PiezaCamposForm({ pieza, onUpdateField }: PiezaCamposFormProps) {
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
          onChangeText={(v) => onUpdateField(pieza.id, "peso_gramos", sanitizeDecimal(v))}
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
          onChangeText={(v) => onUpdateField(pieza.id, "cantidad", sanitizeInteger(v))}
          keyboardType="number-pad"
          unit="uds"
          surface="primary"
          containerStyle={[styles.flex1, styles.ml8]}
        />
      </View>

      {/* Bloque de Tiempo de Impresión en la misma línea */}
      <View style={styles.row}>
        <LabeledField
          icon="time-outline"
          label="Tiempo de impresión"
          placeholder="Horas"
          value={pieza.tiempo_impresion_horas}
          onChangeText={(v) => onUpdateField(pieza.id, "tiempo_impresion_horas", sanitizeInteger(v))}
          keyboardType="number-pad"
          unit="hrs"
          surface="primary"
          containerStyle={styles.flex1}
        />
        <LabeledField
          
          label=" "
          placeholder="Minutos"
          value={pieza.tiempo_impresion_minutos}
          onChangeText={(v) => onUpdateField(pieza.id, "tiempo_impresion_minutos", sanitizeInteger(v, 59))}
          keyboardType="number-pad"
          maxLength={2}
          unit="min"
          surface="primary"
          containerStyle={[styles.flex1, styles.ml8]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 6 },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  ml8: { marginLeft: 8 },
});