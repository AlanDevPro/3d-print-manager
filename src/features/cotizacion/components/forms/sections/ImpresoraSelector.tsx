// src/features/cotizacion/components/forms/sections/ImpresoraSelector.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { useTheme } from "@/hooks/useTheme";
import type { Impresora } from "@/features/materiales/types";

interface ImpresoraSelectorProps {
  impresoras: Impresora[];
  impresoraId?: string;
  onSeleccionar: (id: string) => void;
}

export function ImpresoraSelector({
  impresoras,
  impresoraId,
  onSeleccionar,
}: ImpresoraSelectorProps) {
  const { theme } = useTheme();

  // Agrupar las impresoras por su marca (ej. "Ender", "Bambu Lab", "Creality", "Prusa")
  const impresorasAgrupadas = useMemo(() => {
    if (!impresoras || impresoras.length === 0) return {};

    return impresoras.reduce<Record<string, Impresora[]>>((acc, imp) => {
      const marca = (imp.marca || "Genérica").trim().toUpperCase();

      if (!acc[marca]) {
        acc[marca] = [];
      }
      acc[marca].push(imp);
      return acc;
    }, {});
  }, [impresoras]);

  const marcas = Object.keys(impresorasAgrupadas);

  // Estado para la marca actualmente seleccionada
  const [marcaActiva, setMarcaActiva] = useState<string | null>(() => {
    return marcas.length > 0 ? marcas[0] : null;
  });

  // Si cambia la impresoraId externamente, sincronizar la marca activa
  useEffect(() => {
    if (!impresoraId || impresoras.length === 0) return;

    const seleccionada = impresoras.find((imp) => imp.id === impresoraId);
    if (seleccionada) {
      const marca = (seleccionada.marca || "Genérica").trim().toUpperCase();
      setMarcaActiva(marca);
    }
  }, [impresoraId, impresoras]);

  // Asegurar que exista una marca activa válida si cambian los datos
  useEffect(() => {
    if (marcas.length > 0 && (!marcaActiva || !impresorasAgrupadas[marcaActiva])) {
      setMarcaActiva(marcas[0]);
    }
  }, [marcas, marcaActiva, impresorasAgrupadas]);

  if (impresoras.length === 0) {
    return (
      <View style={styles.container}>
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
      {/* Paso 1: Selección de Marca */}
      <View style={styles.labelGroup}>
        <Ionicons name="hardware-chip-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          1. Selecciona la Marca de Impresora
        </Text>
      </View>

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

      {/* Paso 2: Selección de Modelo */}
      {marcaActiva && (
        <View
          style={[
            styles.modelsCard,
            {
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.modelsHeader}>
            <Ionicons
              name="construct-outline"
              size={15}
              color={theme.primary}
            />
            <Text style={[styles.modelsTitle, { color: theme.textPrimary }]}>
              2. Modelo de {marcaActiva}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {modelosDisponibles.map((imp) => {
              const displayLabel = imp.modelo ?? "Modelo estándar";

              return (
                <SelectableChip
                  key={imp.id}
                  label={displayLabel}
                  selected={impresoraId === imp.id}
                  onPress={() => onSeleccionar(imp.id)}
                  showIcon
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
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
  categoryTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  badgeCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  modelsCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  modelsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  modelsTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});