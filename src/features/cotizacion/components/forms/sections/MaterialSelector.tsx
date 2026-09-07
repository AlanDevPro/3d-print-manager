// src/features/cotizacion/components/forms/sections/MaterialSelector.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { useTheme } from "@/hooks/useTheme";
import type { MaterialItem } from "@/features/cotizacion/types/formTypes";

interface MaterialSelectorProps {
  materiales: MaterialItem[];
  filamentoId?: string;
  onSeleccionar: (id: string) => void;
}

export function MaterialSelector({
  materiales,
  filamentoId,
  onSeleccionar,
}: MaterialSelectorProps) {
  const { theme } = useTheme();

  // Agrupar los materiales por su tipo
  const materialesAgrupados = useMemo(() => {
    if (!materiales || materiales.length === 0) return {};

    return materiales.reduce<Record<string, MaterialItem[]>>((acc, mat) => {
      const tipo = (mat.tipo_material || mat.material || "Otros")
        .trim()
        .toUpperCase();

      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(mat);
      return acc;
    }, {});
  }, [materiales]);

  const categorias = Object.keys(materialesAgrupados);

  // Estado para la categoría actualmente seleccionada
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(() => {
    return categorias.length > 0 ? categorias[0] : null;
  });

  // Si cambia el filamentoId externamente, sincronizar la categoría activa
  useEffect(() => {
    if (!filamentoId || materiales.length === 0) return;

    const seleccionado = materiales.find((m) => m.id === filamentoId);
    if (seleccionado) {
      const tipo = (seleccionado.tipo_material || seleccionado.material || "Otros")
        .trim()
        .toUpperCase();
      setCategoriaActiva(tipo);
    }
  }, [filamentoId, materiales]);

  // Si la categoría activa no es válida, tomar la primera
  useEffect(() => {
    if (categorias.length > 0 && (!categoriaActiva || !materialesAgrupados[categoriaActiva])) {
      setCategoriaActiva(categorias[0]);
    }
  }, [categorias, categoriaActiva, materialesAgrupados]);

  if (materiales.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelGroup}>
          <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Material / Filamento
          </Text>
        </View>
        <EmptyStateCard
          icon="cube-outline"
          title="Sin materiales disponibles"
          description="No hay materiales activos en el catálogo. Para cotizar, primero debes registrar materiales en el sistema."
          actionIcon="information-circle-outline"
          actionText="Contacta al administrador"
        />
      </View>
    );
  }

  const coloresDisponibles = categoriaActiva
    ? materialesAgrupados[categoriaActiva] || []
    : [];

  return (
    <View style={styles.container}>
      {/* Paso 1: Selección de Tipo de Material */}
      <View style={styles.labelGroup}>
        <Ionicons name="cube-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          1. Selecciona el Tipo de Material
        </Text>
      </View>

      <View style={styles.categoriesRow}>
        {categorias.map((cat) => {
          const isSelected = categoriaActiva === cat;
          const cantidad = materialesAgrupados[cat].length;

          return (
            <Pressable
              key={cat}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isSelected ? theme.primary : theme.bgSurface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Ionicons
                name="layers-outline"
                size={14}
                color={isSelected ? "#FFFFFF" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  { color: isSelected ? "#FFFFFF" : theme.textPrimary },
                ]}
              >
                {cat}
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

      {/* Paso 2: Selección de Color del Filamento */}
      {categoriaActiva && (
        <View
          style={[
            styles.colorsCard,
            {
              backgroundColor: theme.bgSurface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.colorsHeader}>
            <Ionicons
              name="color-palette-outline"
              size={15}
              color={theme.primary}
            />
            <Text style={[styles.colorsTitle, { color: theme.textPrimary }]}>
              2. Color / Variante de {categoriaActiva}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {coloresDisponibles.map((mat) => {
              const nombreMaterial =
                mat.nombre ?? mat.material ?? mat.tipo_material ?? "Material";
              const displayLabel = mat.color ? mat.color : nombreMaterial;

              return (
                <SelectableChip
                  key={mat.id}
                  label={displayLabel}
                  selected={filamentoId === mat.id}
                  onPress={() => onSeleccionar(mat.id)}
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
  colorsCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  colorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  colorsTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});