// src/features/cotizacion/components/forms/sections/ImpresoraSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SeccionBloqueadaCard } from "@/components/ui/SeccionBloqueadaCard";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import { SelectableChip } from "@/components/ui/SelectableChip";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import type { Impresora } from "@/features/materiales/types";
import { useTheme } from "@/hooks/useTheme";

interface ImpresoraSelectorProps {
  impresoras: Impresora[];
  impresoraId?: string;
  onSeleccionar: (id: string) => void;
  bloqueado: boolean;
  bloqueadoPor?: string;
  erroresBloqueantes: ErrorCampo[];
  errores: ErrorCampo[];
  completo: boolean;
}

export function ImpresoraSelector({
  impresoras,
  impresoraId,
  onSeleccionar,
  bloqueado,
  bloqueadoPor,
  erroresBloqueantes,
  errores,
  completo,
}: ImpresoraSelectorProps) {
  const { theme } = useTheme();

  const impresorasAgrupadas = useMemo(() => {
    if (!impresoras || impresoras.length === 0) return {};

    return impresoras.reduce<Record<string, Impresora[]>>((acc, imp) => {
      const marca = (imp.marca || "Genérica").trim().toUpperCase();
      if (!acc[marca]) acc[marca] = [];
      acc[marca].push(imp);
      return acc;
    }, {});
  }, [impresoras]);

  const marcas = useMemo(
    () => Object.keys(impresorasAgrupadas),
    [impresorasAgrupadas],
  );

  const [marcaActiva, setMarcaActiva] = useState<string | null>(null);

  useEffect(() => {
    if (
      marcas.length > 0 &&
      (!marcaActiva || !impresorasAgrupadas[marcaActiva])
    ) {
      setMarcaActiva(marcas[0]);
    } else if (marcas.length === 0 && marcaActiva !== null) {
      setMarcaActiva(null);
    }
  }, [marcas, marcaActiva, impresorasAgrupadas]);

  useEffect(() => {
    if (!impresoraId || impresoras.length === 0) return;
    const seleccionada = impresoras.find((imp) => imp.id === impresoraId);
    if (seleccionada) {
      setMarcaActiva((seleccionada.marca || "Genérica").trim().toUpperCase());
    }
  }, [impresoraId, impresoras]);

  /* ---------- Bloqueado por el paso anterior ---------- */
  if (bloqueado) {
    return (
      <SeccionBloqueadaCard
        numeroPaso={3}
        tituloSeccion="Impresora"
        bloqueadoPor={bloqueadoPor}
        errores={erroresBloqueantes}
        icono="hardware-chip-outline"
      />
    );
  }

  if (impresoras.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelGroup}>
          <Ionicons
            name="hardware-chip-outline"
            size={16}
            color={theme.danger}
          />
          <Text style={[styles.label, { color: theme.danger }]}>
            3. Impresora
          </Text>
        </View>
        <EmptyStateCard
          icon="print-outline"
          title="Sin impresoras registradas"
          description="No hay impresoras activas en el sistema. Configura al menos una impresora para poder cotizar."
          actionIcon="construct-outline"
          actionText="Configuración necesaria"
        />
      </View>
    );
  }

  const modelosDisponibles = marcaActiva
    ? impresorasAgrupadas[marcaActiva] || []
    : [];

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
            <Text style={[styles.stepNumber, { color: theme.primary }]}>3</Text>
          )}
        </View>
        <Ionicons
          name="hardware-chip-outline"
          size={16}
          color={theme.primary}
        />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Impresora
        </Text>
      </View>

      <Text style={[styles.stepCaption, { color: theme.textSecondary }]}>
        3.1 Marca
      </Text>

      <View style={styles.categoriesRow}>
        {marcas.map((marca) => {
          const isSelected = marcaActiva === marca;
          const cantidad = impresorasAgrupadas[marca].length;

          return (
            <Pressable
              key={marca}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isSelected ? theme.primary : theme.bgSurface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setMarcaActiva(marca)}
            >
              <Ionicons
                name="print-outline"
                size={14}
                color={isSelected ? "#FFFFFF" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  { color: isSelected ? "#FFFFFF" : theme.textPrimary },
                ]}
              >
                {marca}
              </Text>
              <View
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.25)"
                      : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeCountText,
                    { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  {cantidad}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {marcaActiva && (
        <View
          style={[
            styles.modelsCard,
            { backgroundColor: theme.bgSurface, borderColor: theme.border },
          ]}
        >
          <View style={styles.modelsHeader}>
            <Ionicons
              name="construct-outline"
              size={15}
              color={theme.primary}
            />
            <Text style={[styles.modelsTitle, { color: theme.textPrimary }]}>
              3.2 Modelo de {marcaActiva}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {modelosDisponibles.map((imp) => (
              <SelectableChip
                key={imp.id}
                label={imp.modelo ?? "Modelo estándar"}
                selected={impresoraId === imp.id}
                onPress={() => onSeleccionar(imp.id)}
                showIcon
              />
            ))}
          </View>
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
  stepCaption: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTabText: { fontSize: 13, fontWeight: "700" },
  badgeCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  badgeCountText: { fontSize: 10, fontWeight: "700" },
  modelsCard: { borderWidth: 1, borderRadius: 10, padding: 12 },
  modelsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  modelsTitle: { fontSize: 13, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
