// src/components/ui/SeccionErroresInline.tsx
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

interface SeccionErroresInlineProps {
  errores: ErrorCampo[];
  /** Mensaje corto de resumen mostrado siempre */
  resumen?: string;
  /** Si true, muestra todos los errores sin necesidad del botón */
  siempreVisible?: boolean;
}

export function SeccionErroresInline({
  errores,
  resumen,
  siempreVisible = false,
}: SeccionErroresInlineProps) {
  const { theme } = useTheme();
  const [expandido, setExpandido] = useState(siempreVisible);

  useEffect(() => {
    if (errores.length === 0) setExpandido(siempreVisible);
  }, [errores.length, siempreVisible]);

  if (!errores || errores.length === 0) return null;

  const mensajeResumen =
    resumen ??
    (errores.length === 1
      ? errores[0].mensaje
      : `Faltan ${errores.length} datos por completar en esta sección.`);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido((v) => !v);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "rgba(239, 68, 68, 0.07)",
          borderColor: "rgba(239, 68, 68, 0.30)",
        },
      ]}
    >
      <View style={styles.row}>
        <Ionicons name="alert-circle" size={18} color={theme.danger} />
        <Text style={[styles.resumen, { color: theme.textPrimary }]}>
          {mensajeResumen}
        </Text>
      </View>

      {!siempreVisible && errores.length > 1 && (
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: pressed
                ? "rgba(239, 68, 68, 0.20)"
                : "rgba(239, 68, 68, 0.10)",
              borderColor: "rgba(239, 68, 68, 0.40)",
            },
          ]}
        >
          <Ionicons
            name={expandido ? "eye-off-outline" : "list-circle-outline"}
            size={15}
            color={theme.danger}
          />
          <Text style={[styles.actionText, { color: theme.danger }]}>
            {expandido
              ? "Ocultar detalle"
              : `Ver qué datos me faltan (${errores.length})`}
          </Text>
          <Ionicons
            name={expandido ? "chevron-up" : "chevron-down"}
            size={15}
            color={theme.danger}
          />
        </Pressable>
      )}

      {(expandido || errores.length === 1) && (
        <ListaErrores errores={errores} tono="danger" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  resumen: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
});
