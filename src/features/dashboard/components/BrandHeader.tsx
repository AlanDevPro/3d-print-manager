import { ParametrosDrawer } from "@/components/ui/ParametrosDrawer";
import { useAuth } from "@/context/AuthContext";
import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";
import { useEmpresaActual } from "@/context/EmpresaContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  theme: any;
  nombre: string;
  onPressNotificaciones?: () => void;
};

export function BrandHeader({ theme, nombre, onPressNotificaciones }: Props) {
  const router = useRouter();

  // 1. Datos de sesión y usuario activo
  const { profile } = useAuth();

  // 2. Datos de la empresa activa
  const { empresa } = useEmpresaActual();
  const empresaId = empresa?.id ?? null;

  // 3. Estado y contexto para el Drawer de Parámetros
  const { cargando: cargandoTaller, actualizarParametrosLocal } =
    useConfiguracionTaller();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Mapeos de imágenes e identidades
  const logoUri = empresa?.logoUrl || undefined;
  const nombreTaller = empresa?.nombreComercial || "Mi Taller 3D";
  const avatarUri = profile?.avatar_url || undefined;

  return (
    <View style={styles.container}>
      {/* ── Fila Superior: Logo + Nombre | Notificación + Engranaje + Avatar ── */}
      <View style={styles.topRow}>
        {/* [ 🏢 Logo + Nombre de la Empresa ] */}
        <Pressable
          style={styles.brandZone}
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
                { backgroundColor: theme.primary + "1A" },
              ]}
            >
              <Ionicons name="business" size={18} color={theme.primary} />
            </View>
          )}

          <Text
            style={[styles.nombreTaller, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {nombreTaller}
          </Text>
        </Pressable>

        {/* [ 🔘 Acciones Derecha: Notificaciones | Parámetros | Perfil ] */}
        <View style={styles.rightZone}>
          {/* 🔔 Notificaciones */}
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.bgSecondary || theme.bgPrimary,
                borderColor: theme.border,
              },
            ]}
            onPress={onPressNotificaciones}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ver notificaciones"
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={theme.textPrimary}
            />
          </Pressable>

          {/* ⚙️ Parámetros */}
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.bgSecondary || theme.bgPrimary,
                borderColor: theme.border,
              },
              cargandoTaller && styles.iconButtonDeshabilitado,
            ]}
            onPress={() => setDrawerVisible(true)}
            disabled={cargandoTaller}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir parámetros de cotización"
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={theme.textPrimary}
            />
          </Pressable>

          {/* 👤 Foto de Perfil */}
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.bgSecondary || theme.bgPrimary,
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
                  size={15}
                  color={theme.textSecondary || theme.textPrimary}
                />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Mensaje de Bienvenida ── */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.saludo, { color: theme.textSecondary }]}>
          ¡Bienvenido de nuevo!
        </Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {nombre} 👋
        </Text>
      </View>

      {/* Drawer de Configuración de Parámetros */}
      <ParametrosDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        empresaId={empresaId}
        onSave={(nuevos) => {
          actualizarParametrosLocal(nuevos);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  nombreTaller: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  rightZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconButtonDeshabilitado: {
    opacity: 0.4,
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    marginTop: 2,
  },
  saludo: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
});