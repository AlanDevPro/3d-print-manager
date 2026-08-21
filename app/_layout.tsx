import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Componente interno para acceder a los hooks de Auth y Theme
function RootNavigation() {
  const { session, initialized } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && inAuthGroup) {
      // Redirigir al dashboard si ya inició sesión
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup) {
      // Redirigir a login si no hay sesión
      router.replace("/(auth)/login");
    }
  }, [session, initialized, segments]);

  // Loader de inicialización adaptado al tema activo
  if (!initialized) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.bgPrimary }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <Slot />;
}

// RootLayout con la jerarquía de proveedores correcta
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
