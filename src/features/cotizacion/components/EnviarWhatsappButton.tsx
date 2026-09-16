// src/features/cotizacion/components/EnviarWhatsappButton.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface EnviarWhatsappButtonProps {
  habilitado: boolean;
  motivoDeshabilitado?: string;
  onEnviar: () => Promise<void> | void;
}

export function EnviarWhatsappButton({
  habilitado,
  motivoDeshabilitado,
  onEnviar,
}: EnviarWhatsappButtonProps) {
  const { theme } = useTheme();
  const [enviando, setEnviando] = useState(false);

  const handlePress = async () => {
    if (!habilitado || enviando) return;
    try {
      setEnviando(true);
      await onEnviar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handlePress}
        disabled={!habilitado || enviando}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: !habilitado
              ? theme.border
              : pressed
                ? "#1DA851"
                : "#25D366",
            opacity: enviando ? 0.8 : 1,
          },
        ]}
      >
        {enviando ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color={habilitado ? "#FFFFFF" : theme.textSecondary}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            { color: habilitado ? "#FFFFFF" : theme.textSecondary },
          ]}
        >
          {enviando
            ? "Generando y enviando..."
            : "Enviar cotización por WhatsApp"}
        </Text>
      </Pressable>

      {!habilitado && Boolean(motivoDeshabilitado) && (
        <View style={styles.hintRow}>
          <Ionicons
            name="lock-closed-outline"
            size={13}
            color={theme.textSecondary}
          />
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            {motivoDeshabilitado}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 14 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
  },
  buttonText: { fontSize: 14, fontWeight: "800" },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    justifyContent: "center",
  },
  hintText: { fontSize: 11.5, fontWeight: "500", flex: 1 },
});
