// src/features/cotizacion/components/forms/sections/MaterialSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SeccionBloqueadaCard } from "@/components/ui/SeccionBloqueadaCard";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import { SelectableChip } from "@/components/ui/SelectableChip";
import type { MaterialItem } from "@/features/cotizacion/types/formTypes";
import {
  obtenerStockGramos,
  type ErrorCampo,
} from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

interface MaterialSelectorProps {
  /** Materiales que ya pasaron el filtro de stock (calculado en la validación) */
  materialesDisponibles: MaterialItem[];
  filamentoId?: string;
  onSeleccionar: (id: string) => void;
  pesoTotalRequerido: number;
  pesoMinimoConMargen: number;
  bloqueado: boolean;
  bloqueadoPor?: string;
  erroresBloqueantes: ErrorCampo[];
  errores: ErrorCampo[];
  completo: boolean;
}

export function MaterialSelector({
  materialesDisponibles,
  filamentoId,
  onSeleccionar,
  pesoTotalRequerido,
  pesoMinimoConMargen,
  bloqueado,
  bloqueadoPor,
  erroresBloqueantes,
  errores,
  completo,
}: MaterialSelectorProps) {
  const { theme } = useTheme();

  const materialesAgrupados = useMemo(() => {
    if (materialesDisponibles.length === 0) return {};

    return materialesDisponibles.reduce<Record<string, MaterialItem[]>>(
      (acc, mat: any) => {
        const tipo = (mat.tipo_material || mat.material || "Otros")
          .trim()
          .toUpperCase();
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(mat);
        return acc;
      },
      {},
    );
  }, [materialesDisponibles]);

  const categorias = useMemo(
    () => Object.keys(materialesAgrupados),
    [materialesAgrupados],
  );

  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  useEffect(() => {
    if (
      categorias.length > 0 &&
      (!categoriaActiva || !materialesAgrupados[categoriaActiva])
    ) {
      setCategoriaActiva(categorias[0]);
    } else if (categorias.length === 0 && categoriaActiva !== null) {
      setCategoriaActiva(null);
    }
  }, [categorias, categoriaActiva, materialesAgrupados]);

  // Sincronizar la categoría con el filamento ya seleccionado
  useEffect(() => {
    if (!filamentoId) return;
    const sel: any = materialesDisponibles.find((m) => m.id === filamentoId);
    if (!sel) return;
    const tipo = (sel.tipo_material || sel.material || "Otros")
      .trim()
      .toUpperCase();
    setCategoriaActiva(tipo);
  }, [filamentoId, materialesDisponibles]);

  /* ---------- Estado bloqueado (piezas incompletas) ---------- */
  if (bloqueado) {
    return (
      <SeccionBloqueadaCard
        numeroPaso={2}
        tituloSeccion="Material / Filamento"
        bloqueadoPor={bloqueadoPor}
        errores={erroresBloqueantes}
        icono="cube-outline"
      />
    );
  }

  /* ---------- Sin stock suficiente ---------- */
  if (materialesDisponibles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.labelGroup}>
          <Ionicons name="cube-outline" size={16} color={theme.danger} />
          <Text style={[styles.label, { color: theme.danger }]}>
            2. Material / Filamento
          </Text>
        </View>
        <EmptyStateCard
          icon="alert-circle-outline"
          title="Sin filamentos con stock suficiente"
          description={`El peso total requerido es de ${pesoTotalRequerido}g (+50g de margen = ${pesoMinimoConMargen}g necesarios). No hay bobinas en el inventario con esa cantidad disponible.`}
          actionIcon="warning-outline"
          actionText="Revisa el inventario de materiales"
        />
      </View>
    );
  }

  const coloresDisponibles = categoriaActiva
    ? materialesAgrupados[categoriaActiva] || []
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
            <Text style={[styles.stepNumber, { color: theme.primary }]}>2</Text>
          )}
        </View>
        <Ionicons name="cube-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Material / Filamento
        </Text>
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="scale-outline" size={13} color={theme.textSecondary} />
        <Text style={[styles.hintText, { color: theme.textSecondary }]}>
          Requerido: {pesoTotalRequerido}g + 50g de margen ={" "}
          {pesoMinimoConMargen}g
        </Text>
      </View>

      <Text style={[styles.stepCaption, { color: theme.textSecondary }]}>
        2.1 Tipo de material
      </Text>

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

      {categoriaActiva && (
        <View
          style={[
            styles.colorsCard,
            { backgroundColor: theme.bgSurface, borderColor: theme.border },
          ]}
        >
          <View style={styles.colorsHeader}>
            <Ionicons
              name="color-palette-outline"
              size={15}
              color={theme.primary}
            />
            <Text style={[styles.colorsTitle, { color: theme.textPrimary }]}>
              2.2 Color / Variante de {categoriaActiva}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {coloresDisponibles.map((mat: any) => {
              const nombreMaterial =
                mat.nombre ?? mat.material ?? mat.tipo_material ?? "Material";
              const displayLabel = mat.color ? mat.color : nombreMaterial;
              const stock = obtenerStockGramos(mat);

              return (
                <SelectableChip
                  key={mat.id}
                  label={`${displayLabel}${stock ? ` · ${stock}g` : ""}`}
                  selected={filamentoId === mat.id}
                  onPress={() => onSeleccionar(mat.id)}
                  showIcon
                />
              );
            })}
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
    marginBottom: 6,
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
    marginBottom: 10,
  },
  hintText: { fontSize: 11.5, fontWeight: "500" },
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
  colorsCard: { borderWidth: 1, borderRadius: 10, padding: 12 },
  colorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  colorsTitle: { fontSize: 13, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
