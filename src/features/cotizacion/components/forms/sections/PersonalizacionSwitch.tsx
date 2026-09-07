// src/features/cotizacion/components/forms/sections/PersonalizacionSwitch.tsx
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LabeledField } from "@/components/ui/LabeledField";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeDecimal } from "@/utils/formSanitizers";

interface PersonalizacionSwitchProps {
  activo: boolean;
  precio: string;
  onToggle: (val: boolean) => void;
  onChangePrecio: (v: string) => void;
}

export function PersonalizacionSwitch({ activo, precio, onToggle, onChangePrecio }: PersonalizacionSwitchProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Ionicons name="brush-outline" size={18} color={theme.textPrimary} />
          <Text style={[styles.label, { color: theme.textPrimary }]}>Trabajo de Diseño</Text>
        </View>
        <Switch
          value={activo}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {activo && (
        <LabeledField
          icon="cash-outline"
          label=""
          placeholder="Costo adicional por modelado o post-procesado"
          value={precio}
          onChangeText={(v) => onChangePrecio(sanitizeDecimal(v))}
          keyboardType="decimal-pad"
          unit="Bs"
          surface="primary"
          containerStyle={styles.mt8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, padding: 12, marginTop: 16, borderWidth: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labelGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  mt8: { marginTop: 8 },
});