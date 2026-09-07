// app/(tabs)/index.tsx
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AccionesRapidasRow } from "@/features/dashboard/components/AccionesRapidasRow";
import { BrandHeader } from "@/features/dashboard/components/BrandHeader";
import { CatalogoSection } from "@/features/dashboard/components/CatalogoSection";
import { CotizacionesPendientesSection } from "@/features/dashboard/components/CotizacionesPendientesSection";
import { EstadoTallerSection } from "@/features/dashboard/components/EstadoTallerSection";
import { KpiCarousel } from "@/features/dashboard/components/KpiCarousel";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useTheme } from "@/hooks/useTheme";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InicioScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const nombre =
    user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email ?? "usuario";

  const {
    loading,
    refreshing,
    error,
    impresoras,
    cotizacionesPendientes,
    catalogo,
    kpis,
    refetch,
  } = useDashboardData();

  // Refrescar los datos cada vez que la pestaña entra en foco
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          styles.centered,
          { backgroundColor: theme.bgPrimary },
        ]}
      >
        <ActivityIndicator color={theme.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
      >
        <BrandHeader theme={theme} nombre={nombre} />

        {error && (
          <Text style={styles.errorText}>
            No se pudo actualizar el panel: {error}
          </Text>
        )}

        <KpiCarousel theme={theme} kpis={kpis} />
        <AccionesRapidasRow theme={theme} />
        <EstadoTallerSection theme={theme} impresoras={impresoras} />
        <CotizacionesPendientesSection
          theme={theme}
          cotizaciones={cotizacionesPendientes}
        />
        <CatalogoSection theme={theme} catalogo={catalogo} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 18 },
  errorText: { color: "#EF4444", fontSize: 12 },
});