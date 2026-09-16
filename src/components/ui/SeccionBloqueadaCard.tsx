// src/components/ui/SeccionBloqueadaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ListaErrores } from "@/components/ui/ListaErrores";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

interface SeccionBloqueadaCardProps {
  /** Título de la sección que está bloqueada (ej. "Impresora") */
  tituloSeccion: string;
  /** Título de la sección anterior que falta completar */
  bloqueadoPor?: string;
  errores: ErrorCampo[];
  icono?: keyof typeof Ionicons.glyphMap;
  numeroPaso?: number;
}

export function SeccionBloqueadaCard({
  tituloSeccion,
  bloqueadoPor,
  errores,
  icono = "lock-closed-outline",
  numeroPaso,
}: SeccionBloqueadaCardProps) {
  const { theme } = useTheme();
  const [expandido, setExpandido] = useState(false);

  // Si el bloqueo se resuelve y vuelve, siempre arranca colapsado
  useEffect(() => {
    if (errores.length === 0) setExpandido(false);
  }, [errores.length]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido((v) => !v);
  };

  const cantidad = errores.length;

  return (
    <View style={styles.container}>
      <View style={styles.labelGroup}>
        <Ionicons name={icono} size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {numeroPaso ? `${numeroPaso}. ` : ""}
          {tituloSeccion}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.bgSurface,
            borderColor: "rgba(217, 119, 6, 0.35)",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: "rgba(217, 119, 6, 0.12)" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Sección bloqueada
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {bloqueadoPor
                ? `Completa primero "${bloqueadoPor}" para habilitar esta sección.`
                : "Completa los pasos anteriores para continuar."}
            </Text>
          </View>
        </View>

        {cantidad > 0 && (
          <Pressable
            onPress={toggle}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: pressed
                  ? "rgba(217, 119, 6, 0.22)"
                  : "rgba(217, 119, 6, 0.12)",
                borderColor: "rgba(217, 119, 6, 0.45)",
              },
            ]}
          >
            <Ionicons
              name={expandido ? "eye-off-outline" : "list-circle-outline"}
              size={16}
              color="#D97706"
            />
            <Text style={[styles.actionText, { color: "#D97706" }]}>
              {expandido
                ? "Ocultar datos faltantes"
                : `Ver qué datos me faltan (${cantidad})`}
            </Text>
            <Ionicons
              name={expandido ? "chevron-up" : "chevron-down"}
              size={16}
              color="#D97706"
            />
          </Pressable>
        )}

        {expandido && <ListaErrores errores={errores} tono="warning" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextGroup: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700" },
  description: { fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  actionText: { fontSize: 12.5, fontWeight: "700" },
});
