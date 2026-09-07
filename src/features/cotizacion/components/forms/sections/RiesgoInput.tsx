// src/features/cotizacion/components/forms/sections/RiesgoInput.tsx
import React from "react";
import { LabeledField } from "@/components/ui/LabeledField";
import { sanitizeInteger } from "@/utils/formSanitizers";

interface RiesgoInputProps {
  value: string;
  onChangeText: (v: string) => void;
}

export function RiesgoInput({ value, onChangeText }: RiesgoInputProps) {
  return (
    <LabeledField
      icon="warning-outline"
      label="Riesgo de fallo / fallo de impresión (0-99%)"
      placeholder="Ej. 10"
      value={value}
      onChangeText={(v) => onChangeText(sanitizeInteger(v, 99))}
      keyboardType="number-pad"
      maxLength={2}
      unit="%"
    />
  );
}