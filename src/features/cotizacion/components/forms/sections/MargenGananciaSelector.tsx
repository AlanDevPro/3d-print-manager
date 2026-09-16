// src/features/cotizacion/components/forms/sections/MargenGananciaSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SeccionBloqueadaCard } from "@/components/ui/SeccionBloqueadaCard";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import type { ReglaMargen } from "@/features/cotizacion/types/formTypes";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

interface MargenGananciaSelectorProps {
  reglasMargen: ReglaMargen[];
  reglaMargenId?: string;
  margenGananciaPct: string;
  onSeleccionar: (regla: ReglaMargen) => void;
  bloqueado: boolean;
  bloqueadoPor?: string;
  erroresBloqueantes: ErrorCampo[];
  errores: ErrorCampo[];
  completo: boolean;
}

const describirRango = (regla: any): string | null => {
  const min = regla.cantidad_minima ?? regla.minimo ?? null;
  const max = regla.cantidad_maxima ?? regla.maximo ?? null;
  if (min === null && max === null) return null;
  if (max === null) return `${min}+ uds`;
  return `${min ?? 1} - ${max} uds`;
};

export function MargenGananciaSelector({
  reglasMargen,
  reglaMargenId,
  margenGananciaPct,
  onSeleccionar,
  bloqueado,
  bloqueadoPor,
  erroresBloqueantes,
  errores,
  completo,
}: MargenGananciaSelectorProps) {
  const { theme } = useTheme();

  if (bloqueado) {
    return (
      <SeccionBloqueadaCard
        numeroPaso={5}
        tituloSeccion="Margen de utilidad"
        bloqueadoPor={bloqueadoPor}
        errores={erroresBloqueantes}
        icono="trending-up-outline"
      />
    );
  }

  if (!reglasMargen || reglasMargen.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelGroup}>
          <Ionicons name="trending-up-outline" size={16} color={theme.danger} />
          <Text style={[styles.label, { color: theme.danger }]}>
            5. Margen de utilidad
          </Text>
        </View>
        <EmptyStateCard
          icon="options-outline"
          title="Sin reglas de margen configuradas"
          description="Define los rangos de utilidad en Parámetros del Taller para poder aplicar un margen a esta cotización."
          actionIcon="construct-outline"
          actionText="Configuración necesaria"
        />
      </View>
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
            <Text style={[styles.stepNumber, { color: theme.primary }]}>5</Text>
          )}
        </View>
        <Ionicons name="trending-up-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Margen de utilidad
        </Text>
      </View>

      <View style={styles.optionsRow}>
        {reglasMargen.map((regla: any) => {
          const isSelected = reglaMargenId === regla.id;
          const rango = describirRango(regla);
          const pct = regla.margen_ganancia_pct ?? regla.porcentaje ?? 0;

          return (
            <Pressable
              key={regla.id}
              onPress={() => onSeleccionar(regla)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? theme.primary : theme.bgSurface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionPct,
                  { color: isSelected ? "#FFFFFF" : theme.textPrimary },
                ]}
              >
                {pct}%
              </Text>
              {rango && (
                <Text
                  style={[
                    styles.optionRango,
                    {
                      color: isSelected
                        ? "rgba(255,255,255,0.85)"
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {rango}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {Number(margenGananciaPct) > 0 && (
        <View style={styles.hintRow}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            Margen aplicado: {margenGananciaPct}%
          </Text>
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
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionCard: {
    minWidth: 82,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionPct: { fontSize: 16, fontWeight: "800" },
  optionRango: { fontSize: 10.5, fontWeight: "600", marginTop: 2 },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  hintText: { fontSize: 11.5, fontWeight: "500" },
});
