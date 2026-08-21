// src/components/ui/AppBar.tsx
import { ParametrosDrawer } from "@/components/ui/ParametrosDrawer";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appBarHeight, radii, spacing } from "../../constants/theme";

interface AppBarProps {
  /** ID del usuario autenticado, requerido para cargar sus parámetros */
  userId: string | null;
  /** URI del logo del taller (Supabase Storage / assets) */
  logoUri?: string;
  /** URI del avatar del usuario */
  avatarUri?: string;
  /** Nombre corto mostrado junto al logo (opcional) */
  nombreTaller?: string;
}

export function AppBar({
  userId,
  logoUri,
  avatarUri,
  nombreTaller,
}: AppBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top,
          backgroundColor: theme.bgSurface || theme.bgPrimary,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.bar}>
        {/* [ 🏢 Logo Taller ] -> Mi Empresa */}
        <Pressable
          style={styles.logoZone}
          onPress={() => router.push("/empresa")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil de la empresa"
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImg} />
          ) : (
            <View
              style={[
                styles.logoFallback,
                { backgroundColor: theme.primary + "1A" }, // Opacidad suave según tema
              ]}
            >
              <Ionicons name="business" size={18} color={theme.primary} />
            </View>
          )}
          {nombreTaller ? (
            <Text
              style={[styles.nombreTaller, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {nombreTaller}
            </Text>
          ) : null}
        </Pressable>

        {/* Zona derecha: Engranaje + Avatar */}
        <View style={styles.rightZone}>
          {/* [ ⚙️ Engranaje ] -> Drawer de Parámetros */}
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.bgPrimary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setDrawerVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir parámetros de cotización"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.textPrimary}
            />
          </Pressable>

          {/* [ 👤 Avatar ] -> Mi Cuenta */}
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.bgPrimary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push("/cuenta")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ir a mi cuenta"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: theme.border },
                ]}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={theme.textSecondary || theme.textPrimary}
                />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ParametrosDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    height: appBarHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  logoZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
  },
  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  nombreTaller: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  rightZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
