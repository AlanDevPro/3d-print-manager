// src/components/ui/ParametroCampo.tsx
import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";

interface ParametroCampoNumeroProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  sufijo?: string;
  keyboardType?: "numeric" | "decimal-pad";
}

export function ParametroCampoNumero({
  label,
  value,
  onChange,
  sufijo,
  keyboardType = "decimal-pad",
}: ParametroCampoNumeroProps) {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={(texto) => {
            const limpio = texto.replace(",", ".").replace(/[^0-9.]/g, "");
            onChange(limpio === "" ? 0 : Number(limpio));
          }}
          keyboardType={keyboardType}
          placeholderTextColor={colors.textMuted}
        />
        {sufijo ? <Text style={styles.sufijo}>{sufijo}</Text> : null}
      </View>
    </View>
  );
}

interface ParametroCampoTextoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function ParametroCampoTexto({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: ParametroCampoTextoProps) {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          styles.inputTexto,
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
      />
    </View>
  );
}

interface ParametroCampoSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ParametroCampoSwitch({
  label,
  value,
  onChange,
}: ParametroCampoSwitchProps) {
  return (
    <View style={[styles.fila, styles.filaSwitch]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    gap: spacing.xs / 2,
  },
  filaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  inputTexto: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  sufijo: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
});
