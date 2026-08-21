import { CotizacionForm } from "@/components/forms/CotizacionForm";
import { CotizacionResumenCard } from "@/components/ui/CotizacionResumenCard";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function CotizarScreen() {
  const { theme } = useTheme();
  const { resultado, form } = useCotizacion();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Sección Formulario */}
      <CotizacionForm />

      {/* Sección Resumen de Cotización */}
      <View style={styles.resumenContainer}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="receipt-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Resumen de Cotización
          </Text>
        </View>

        <CotizacionResumenCard
          resultado={resultado}
          cantidad={Number(form.cantidad) || 1}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  resumenContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});
