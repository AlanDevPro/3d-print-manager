// src/features/cotizacion/components/forms/sections/PiezasSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

import { PiezaCamposForm } from "./PiezaCamposForm";
import { PiezaTabsBar } from "./PiezaTabsBar";

type PiezasSectionProps = Pick<
  UseCotizacionReturn,
  | "piezas"
  | "piezaActivaId"
  | "updatePiezaField"
  | "agregarPieza"
  | "eliminarPieza"
  | "seleccionarPieza"
> & {
  errores?: ErrorCampo[];
  completo?: boolean;
};

export function PiezasSection({
  piezas,
  piezaActivaId,
  updatePiezaField,
  agregarPieza,
  eliminarPieza,
  seleccionarPieza,
  errores = [],
  completo = false,
}: PiezasSectionProps) {
  const { theme } = useTheme();
  const piezaActiva = piezas.find((p) => p.id === piezaActivaId) ?? piezas[0];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgSurface,
          borderColor: completo ? "rgba(22, 163, 74, 0.45)" : theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
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
              <Text style={[styles.stepNumber, { color: theme.primary }]}>
                1
              </Text>
            )}
          </View>
          <Ionicons name="shapes-outline" size={18} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Datos por pieza
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={agregarPieza}
        >
          <Ionicons name="add-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Otra pieza</Text>
        </Pressable>
      </View>

      <PiezaTabsBar
        piezas={piezas}
        piezaActivaId={piezaActivaId}
        onSeleccionar={seleccionarPieza}
        onEliminar={eliminarPieza}
      />

      {piezaActiva && (
        <PiezaCamposForm pieza={piezaActiva} onUpdateField={updatePiezaField} />
      )}

      <SeccionErroresInline
        errores={errores}
        resumen={
          errores.length > 1
            ? `Faltan ${errores.length} datos en tus piezas para poder elegir el filamento.`
            : undefined
        }
      />

      {completo && (
        <View style={styles.okRow}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={[styles.okText, { color: "#16A34A" }]}>
            Piezas completas. Ya puedes seleccionar el filamento.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 7 },
  stepBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: 11, fontWeight: "800" },
  title: { fontSize: 15, fontWeight: "700" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  okRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  okText: { fontSize: 12, fontWeight: "600" },
});
