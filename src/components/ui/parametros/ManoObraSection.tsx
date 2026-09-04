// src/components/ui/parametros/ManoObraSection.tsx
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import { MonedaCodigo } from "@/features/parametros/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ParametroCampoNumero } from "../ParametroCampo";

interface ManoObraSectionProps {
  tiempoInvertidoMinutos: number;
  sueldoMensual: number;
  costoHoraBaseDatos?: number; // 👈 costo_mano_obra_hora recuperado de la BD
  monedaPrincipal?: MonedaCodigo; // 👈 Se acepta opcionalmente para evitar el error de asignación undefined
  onChangeTiempo: (valor: number) => void;
  onChangeSueldo: (valor: number) => void;
}

export function ManoObraSection({
  tiempoInvertidoMinutos,
  sueldoMensual,
  costoHoraBaseDatos,
  monedaPrincipal = "BOB", // 👈 Fallback por defecto si viene undefined
  onChangeTiempo,
  onChangeSueldo,
}: ManoObraSectionProps) {
  const { theme } = useContext(ThemeContext);

  // 💡 LÓGICA DE CÁLCULO EN TIEMPO REAL
  // 1. Si el usuario editó el sueldo (> 0), el costo/hora se recalcula al vuelo (sueldo / 160h).
  // 2. Si aún no editó el sueldo, se muestra por defecto el costo/hora que vino de la BD.
  const costoPorHoraCalculado =
    sueldoMensual > 0 ? sueldoMensual / 160 : (costoHoraBaseDatos ?? 0);

  // Precio final por trabajo = CostoHora * (Minutos / 60)
  const precioManoObraPorImpresion =
    costoPorHoraCalculado * (tiempoInvertidoMinutos / 60);

  return (
    <>
      <ParametroCampoNumero
        label="Tiempo dedicación por impresión (a)"
        value={tiempoInvertidoMinutos}
        onChange={onChangeTiempo}
        sufijo="min"
      />

      <ParametroCampoNumero
        label="Sueldo Mensual Objetivo (b)"
        value={sueldoMensual}
        onChange={onChangeSueldo}
        sufijo={monedaPrincipal}
      />

      <View
        style={[
          styles.readOnlyContainer,
          { backgroundColor: theme.bgSecondary, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.readOnlyLabel, { color: theme.textMuted }]}>
          Costo Hora c({monedaPrincipal}/h) = b / 160h ={" "}
          <Text style={{ fontWeight: "700", color: theme.textPrimary }}>
            {costoPorHoraCalculado.toFixed(2)} {monedaPrincipal}/h
          </Text>
        </Text>

        <Text
          style={[
            styles.readOnlyLabel,
            { color: theme.textMuted, marginTop: 2 },
          ]}
        >
          Precio Mano de Obra d({monedaPrincipal}) = c * a * (1/60)
        </Text>

        <View style={styles.readOnlyValueRow}>
          <Text style={[styles.readOnlyValueText, { color: theme.primary }]}>
            {precioManoObraPorImpresion.toFixed(2)}{" "}
            <Text style={styles.readOnlyCurrency}>{monedaPrincipal}</Text>
          </Text>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={theme.textMuted}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  readOnlyContainer: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: 4,
  },
  readOnlyLabel: { fontSize: 11, fontWeight: "500" },
  readOnlyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  readOnlyValueText: { fontSize: 15, fontWeight: "700" },
  readOnlyCurrency: { fontSize: 12, fontWeight: "500" },
});