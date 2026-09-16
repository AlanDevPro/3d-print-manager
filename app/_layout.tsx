// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "../src/context/AuthContext";
import { ConfiguracionTallerProvider } from "../src/context/ConfiguracionTallerContext";
import { EmpresaProvider, useEmpresa } from "../src/context/EmpresaContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { useTheme } from "../src/hooks/useTheme";

/**
 * Subcomponente interno para aislar y conectar el proveedor del taller
 * utilizando de forma segura el ID de la empresa activa.
 */
function ConfiguredTallerProvider({ children }: { children: React.ReactNode }) {
  const { empresa } = useEmpresa();
  const empresaId = empresa?.id ?? null;

  return (
    <ConfiguracionTallerProvider empresaId={empresaId}>
      {children}
    </ConfiguracionTallerProvider>
  );
}

/**
 * Componente encargado de gestionar la lógica de navegación,
 * protección de rutas y pantallas de carga iniciales.
 */
function RootNavigation() {
  const { session, user, initialized } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Redirección segura estrictamente dentro de useEffect para evitar errores de montaje
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [session, initialized, segments, router]);

  // Pantalla de carga mientras se inicializa la sesión de usuario
  if (!initialized) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.bgPrimary }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const userId = session?.user?.id ?? user?.id ?? null;

  return (
    <EmpresaProvider userId={userId}>
      <ConfiguredTallerProvider>
        <Slot />
      </ConfiguredTallerProvider>
    </EmpresaProvider>
  );
}

/**
 * Componente raíz de la aplicación que configura los proveedores globales
 * (Gestos, React Query, Temas y Autenticación).
 */
export default function RootLayout() {
  // Inicialización única de QueryClient utilizando lazy state para evitar recreaciones
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 1000 * 60 * 30, // 30 minutos
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigation />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
