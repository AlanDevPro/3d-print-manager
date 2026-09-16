// src/features/cotizacion/components/forms/sections/PersonalizacionSwitch.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

import { LabeledField } from "@/components/ui/LabeledField";
import { SeccionBloqueadaCard } from "@/components/ui/SeccionBloqueadaCard";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeDecimal } from "@/utils/formSanitizers";

interface PersonalizacionSwitchProps {
  activo: boolean;
  precio: string;
  onToggle: (val: boolean) => void;
  onChangePrecio: (v: string) => void;
  bloqueado: boolean;
  bloqueadoPor?: string;
  erroresBloqueantes: ErrorCampo[];
  errores: ErrorCampo[];
  completo: boolean;
}

export function PersonalizacionSwitch({
  activo,
  precio,
  onToggle,
  onChangePrecio,
  bloqueado,
  bloqueadoPor,
  erroresBloqueantes,
  errores,
  completo,
}: PersonalizacionSwitchProps) {
  const { theme } = useTheme();

  if (bloqueado) {
    return (
      <SeccionBloqueadaCard
        numeroPaso={6}
        tituloSeccion="Personalización"
        bloqueadoPor={bloqueadoPor}
        errores={erroresBloqueantes}
        icono="color-wand-outline"
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
            <Text style={[styles.stepNumber, { color: theme.primary }]}>6</Text>
          )}
        </View>
        <Ionicons name="color-wand-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Personalización
        </Text>
      </View>

      <View
        style={[
          styles.switchCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <View style={styles.switchTextGroup}>
          <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
            ¿Lleva trabajo personalizado?
          </Text>
          <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
            Diseño a medida, pintado, ensamblado o acabados especiales.
          </Text>
        </View>
        <Switch
          value={activo}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: `${theme.primary}88` }}
          thumbColor={activo ? theme.primary : "#F4F4F5"}
        />
      </View>

      {activo && (
        <View style={styles.precioWrapper}>
          <LabeledField
            icon="cash-outline"
            label="Precio adicional por personalización"
            placeholder="Ej. 50"
            value={precio}
            onChangeText={(v) => onChangePrecio(sanitizeDecimal(v))}
            keyboardType="decimal-pad"
          />
        </View>
      )}

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
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  switchTextGroup: { flex: 1 },
  switchTitle: { fontSize: 13.5, fontWeight: "700" },
  switchDesc: { fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  precioWrapper: { marginTop: 10 },
});
