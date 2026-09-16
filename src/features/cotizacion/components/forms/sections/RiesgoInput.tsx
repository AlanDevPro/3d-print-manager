// src/features/cotizacion/components/forms/sections/RiesgoInput.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { LabeledField } from "@/components/ui/LabeledField";
import { SeccionBloqueadaCard } from "@/components/ui/SeccionBloqueadaCard";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeDecimal } from "@/utils/formSanitizers";

interface RiesgoInputProps {
  value: string;
  onChangeText: (v: string) => void;
  bloqueado: boolean;
  bloqueadoPor?: string;
  erroresBloqueantes: ErrorCampo[];
  errores: ErrorCampo[];
  completo: boolean;
}

export function RiesgoInput({
  value,
  onChangeText,
  bloqueado,
  bloqueadoPor,
  erroresBloqueantes,
  errores,
  completo,
}: RiesgoInputProps) {
  const { theme } = useTheme();

  if (bloqueado) {
    return (
      <SeccionBloqueadaCard
        numeroPaso={4}
        tituloSeccion="Riesgo de fallos"
        bloqueadoPor={bloqueadoPor}
        errores={erroresBloqueantes}
        icono="warning-outline"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelGroup}>
        <View
          style={[
            styles.stepBubble,
            {
              backgroundColor: completo
                ? "rgba(22, 163, 74, 0.15)"
                : `${theme.primary}1F`,
            },
          ]}
        >
          {completo ? (
            <Ionicons name="checkmark" size={13} color="#16A34A" />
          ) : (
            <Text style={[styles.stepNumber, { color: theme.primary }]}>4</Text>
          )}
        </View>
        <Ionicons name="warning-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Riesgo de fallos
        </Text>
      </View>

      <LabeledField
        icon="pulse-outline"
        label="Porcentaje de riesgo / reimpresión"
        placeholder="Ej. 10"
        value={value}
        onChangeText={(v) => onChangeText(sanitizeDecimal(v))}
        keyboardType="decimal-pad"
        unit="%"
        maxLength={5}
      />

      <View style={styles.hintRow}>
        <Ionicons
          name="information-circle-outline"
          size={13}
          color={theme.textSecondary}
        />
        <Text style={[styles.hintText, { color: theme.textSecondary }]}>
          Colchón para cubrir fallas de impresión. Puedes dejarlo en 0.
        </Text>
      </View>

      <SeccionErroresInline errores={errores} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  stepBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: 11, fontWeight: "800" },
  label: { fontSize: 14, fontWeight: "700" },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  hintText: { fontSize: 11.5, flex: 1 },
});
