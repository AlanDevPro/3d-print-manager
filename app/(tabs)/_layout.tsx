import { AppBar } from "@/components/ui/AppBar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const { user, initialized } = useAuth();
  const { theme } = useTheme();

  // Esperar a que Supabase recupere la sesión inicial antes de renderizar la UI
  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bgPrimary,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Extraer metadata personalizada almacenada en Supabase Auth
  const userMetadata = user?.user_metadata ?? {};

  const logoUri = userMetadata.taller_logo_url ?? userMetadata.tallerLogoUrl;
  const avatarUri = userMetadata.avatar_url ?? userMetadata.avatarUrl;
  const nombreTaller =
    userMetadata.nombre_taller ?? userMetadata.tallerNombre ?? "Mi Taller 3D";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => (
          <AppBar
            userId={user?.id ?? null}
            logoUri={logoUri}
            avatarUri={avatarUri}
            nombreTaller={nombreTaller}
          />
        ),
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary || theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.bgSurface || theme.bgPrimary,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cotizar"
        options={{
          title: "Cotizar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: "Inventario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finanzas"
        options={{
          title: "Finanzas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
