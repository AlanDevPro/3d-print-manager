// app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { ConfiguracionTallerProvider } from "../src/context/ConfiguracionTallerContext";
import { EmpresaProvider, useEmpresa } from "../src/context/EmpresaContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { useTheme } from "../src/hooks/useTheme";

// Subcomponente interno para envolver el Provider del taller con el ID de la empresa
function ConfiguredTallerProvider({ children }: { children: React.ReactNode }) {
  const { empresa } = useEmpresa();
  const empresaId = empresa?.id ?? null;

  return (
    <ConfiguracionTallerProvider empresaId={empresaId}>
      {children}
    </ConfiguracionTallerProvider>
  );
}

function RootNavigation() {
  const { session, user, initialized } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [session, initialized, segments, router]);

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
