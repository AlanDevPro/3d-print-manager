import { ParametroCampoNumero, ParametroCampoTexto } from "@/components/ui/ParametroCampo";
import { radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import { useReglasMargen } from "@/features/parametros/hook/useReglasMargen";
import { ReglaMargenGanancia } from "@/features/parametros/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { parametrosStyles } from "./styles";

interface ReglasMargenCardProps {
  reglas?: ReglaMargenGanancia[];
  onReglasChange: (reglas: ReglaMargenGanancia[]) => void;
  userId?: string;
}

export function ReglasMargenCard({
  reglas = [],
  onReglasChange,
  userId,
}: ReglasMargenCardProps) {
  const { theme } = useContext(ThemeContext);
  const {
    mostrandoForm,
    toggleFormulario,
    nombre,
    setNombre,
    porcentaje,
    setPorcentaje,
    agregarRegla,
    eliminarRegla,
    isSubmitting,
  } = useReglasMargen({ reglas, onReglasChange, userId });

  const sinDatos = !reglas || reglas.length === 0;

  return (
    <View
      style={[
        parametrosStyles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      {/* Header del Card */}
      <View style={parametrosStyles.cardHeaderRowBetween}>
        <View style={parametrosStyles.cardHeaderRow}>
          <Ionicons
            name="trending-up-outline"
            size={18}
            color={theme.primary}
          />
          <Text
            style={[parametrosStyles.cardTitle, { color: theme.textPrimary }]}
          >
            Márgenes de Utilidad
          </Text>
        </View>
        <Pressable
          style={[styles.btnNuevo, { backgroundColor: theme.primaryLight }]}
          onPress={toggleFormulario}
        >
          <Ionicons
            name={mostrandoForm ? "close" : "add"}
            size={14}
            color={theme.primary}
          />
          <Text style={[styles.btnNuevoTexto, { color: theme.primary }]}>
            {mostrandoForm ? "Cancelar" : "+ Nuevo margen"}
          </Text>
        </Pressable>
      </View>

      {/* Formulario de Alta */}
      {mostrandoForm && (
        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.bgSecondary, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
            Definir Margen de Ganancia
          </Text>

          <ParametroCampoTexto
            label="Nombre de la regla"
            placeholder="Ej. Estándar, Cliente VIP, Prototipos"
            value={nombre}
            onChange={setNombre}
          />

          <ParametroCampoNumero
            label="Porcentaje de Utilidad"
            value={porcentaje}
            onChange={setPorcentaje}
            sufijo="%"
          />

          <Pressable
            style={[
              styles.btnGuardar,
              {
                backgroundColor: theme.primary,
                opacity: isSubmitting ? 0.7 : 1,
              },
            ]}
            onPress={agregarRegla}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.btnGuardarTexto}>Guardar Margen</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Lista de Datos o Estado Vacío */}
      <View style={styles.lista}>
        {sinDatos ? (
          <View
            style={[styles.boxVacio, { backgroundColor: theme.bgSecondary }]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={theme.textMuted}
            />
            <Text style={[styles.vacioTexto, { color: theme.textMuted }]}>
              No existen márgenes de utilidad registrados. Presione + Nuevo
              margen para agregar uno.
            </Text>
          </View>
        ) : (
          reglas.map((regla) => (
            <View
              key={regla.id}
              style={[
                styles.item,
                {
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.itemInfo}>
                <Text style={[styles.itemNombre, { color: theme.textPrimary }]}>
                  {regla.nombre}
                </Text>
                <View
                  style={[styles.badge, { backgroundColor: theme.primaryLight }]}
                >
                  <Text style={[styles.badgeTexto, { color: theme.primary }]}>
                    {regla.porcentaje}% utilidad
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => eliminarRegla(regla.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#e53e3e" />
              </Pressable>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnNuevo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 2,
  },
  btnNuevoTexto: {
    fontSize: 11,
    fontWeight: "700",
  },
  formContainer: {
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  formTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  btnGuardar: {
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: 2,
  },
  btnGuardarTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  lista: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  boxVacio: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  vacioTexto: {
    fontSize: 11,
    fontStyle: "italic",
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemNombre: {
    fontSize: 13,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: "700",
  },
});