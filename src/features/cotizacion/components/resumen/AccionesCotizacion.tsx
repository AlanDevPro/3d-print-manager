// src/features/cotizacion/components/resumen/AccionesCotizacion.tsx
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface AccionesCotizacionProps {
  onEnviarWhatsapp: () => void;
  generandoVoucher: boolean;
  puedeEnviarVoucher: boolean;
  errorVoucher?: string | null;
}

export function AccionesCotizacion({
  
  onEnviarWhatsapp,
  generandoVoucher,
  puedeEnviarVoucher,
  errorVoucher,
}: AccionesCotizacionProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={styles.row}>

        <Pressable
          style={[styles.whatsapp, { opacity: generandoVoucher || !puedeEnviarVoucher ? 0.6 : 1 }]}
          onPress={onEnviarWhatsapp}
          disabled={generandoVoucher || !puedeEnviarVoucher}
        >
          {generandoVoucher ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.whatsappText}>Enviar por WhatsApp</Text>
            </>
          )}
        </Pressable>
      </View>

      {Boolean(errorVoucher) && <Text style={[styles.error, { color: theme.danger }]}>{errorVoucher}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  secondary: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontWeight: "700", fontSize: 13 },
  whatsapp: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 12,
  },
  whatsappText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  error: { fontSize: 11, fontWeight: "500", textAlign: "center", marginTop: 4 },
});