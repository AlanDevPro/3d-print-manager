import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { ChangePasswordModal } from "@/components/forms/ChangePasswordModal";
import { ItemDato } from "@/components/ui/ItemDato";
import { Seccion } from "@/components/ui/Seccion";
import { useAccount } from "@/features/auth/hooks/useAccount";
import { RolUsuario } from "@/features/auth/types";
import { useTheme } from "@/hooks/useTheme";

export default function CuentaScreen() {
  const { theme, isDark, mode, setThemeMode } = useTheme();
  const acc = useAccount();

  const handleToggleTheme = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

  const handleActionDatosPersonales = () => {
    if (acc.modoEdicion) {
      acc.handleGuardarPerfil();
    } else {
      acc.setModoEdicion(true);
    }
  };

  const nombreMostrar = acc.nombre || "Usuario";
  const emailMostrar = acc.email || "Cargando correo...";

  // Selección de fuente de avatar (Prioridad: Selección Local -> Avatar DB -> Fallback Generado)
  const avatarSourceUri =
    acc.newAvatarUri ||
    acc.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nombreMostrar,
    )}&background=DC2626&color=fff&size=128`;

  // Configuración de visualización profesional según el rol
  const getRoleBadgeConfig = (rol: RolUsuario) => {
    switch (rol) {
      case "admin":
        return {
          label: "ADMINISTRADOR",
          icon: "shield-checkmark" as const,
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
        };
      case "empleado":
        return {
          label: "EMPLEADO / OPERADOR",
          icon: "briefcase" as const,
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
        };
      case "cliente":
      default:
        return {
          label: "CLIENTE",
          icon: "person" as const,
          bg: "#F0FDF4",
          text: "#16A34A",
          border: "#BBF7D0",
        };
    }
  };

  const roleConfig = getRoleBadgeConfig(acc.rol);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mi Cuenta",
          headerStyle: { backgroundColor: theme.bgSurface },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        key={isDark ? "dark" : "light"}
        style={[styles.container, { backgroundColor: theme.bgPrimary }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER PERFIL */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: theme.bgSurface, borderColor: theme.border },
          ]}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarSourceUri }} style={styles.avatar} />
            <Pressable
              disabled={acc.saving}
              onPress={acc.handlePickAvatar}
              style={({ pressed }) => [
                styles.badgeEdit,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.bgSurface,
                  opacity: pressed || acc.saving ? 0.8 : 1,
                },
              ]}
            >
              {acc.saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
              )}
            </Pressable>
          </View>

          <Text style={[styles.userName, { color: theme.textPrimary }]}>
            {nombreMostrar}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {emailMostrar}
          </Text>

          {/* BADGE DE ROL PROFESIONAL */}
          <View
            style={[
              styles.roleBadgeContainer,
              {
                backgroundColor: isDark ? theme.borderLight : roleConfig.bg,
                borderColor: roleConfig.border,
              },
            ]}
          >
            <Ionicons
              name={roleConfig.icon}
              size={13}
              color={roleConfig.text}
            />
            <Text style={[styles.roleBadgeText, { color: roleConfig.text }]}>
              {roleConfig.label}
            </Text>
          </View>
        </View>

        {/* 1. DATOS PERSONALES */}
        <Seccion
          titulo="Datos Personales"
          actionText={
            acc.saving ? "Guardando..." : acc.modoEdicion ? "Guardar" : "Editar"
          }
          onActionPress={handleActionDatosPersonales}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <ItemDato
              icono="person-outline"
              label="Nombre Completo"
              valor={acc.nombre}
              editable={acc.modoEdicion}
              onChangeText={acc.setNombre}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.borderLight }]}
            />
            <ItemDato
              icono="mail-outline"
              label="Correo Electrónico"
              valor={acc.email}
              editable={false}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.borderLight }]}
            />
            <ItemDato
              icono="call-outline"
              label="Teléfono / WhatsApp"
              valor={acc.telefono}
              editable={acc.modoEdicion}
              onChangeText={acc.setTelefono}
              keyboardType="phone-pad"
            />
          </View>
        </Seccion>

        {/* 2. PREFERENCIAS DE APARIENCIA */}
        <Seccion titulo="Apariencia">
          <View
            style={[
              styles.card,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={isDark ? "moon-outline" : "sunny-outline"}
                  size={20}
                  color={theme.textPrimary}
                />
                <View>
                  <Text
                    style={[styles.menuItemText, { color: theme.textPrimary }]}
                  >
                    Modo Oscuro
                  </Text>
                  {mode === "system" && (
                    <Text
                      style={[styles.subText, { color: theme.textSecondary }]}
                    >
                      (Sincronizado con el sistema)
                    </Text>
                  )}
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleToggleTheme}
                trackColor={{
                  false: theme.border,
                  true: theme.primary,
                }}
                thumbColor={theme.bgSurface}
                ios_backgroundColor={theme.border}
              />
            </View>
          </View>
        </Seccion>

        {/* 3. SEGURIDAD */}
        <Seccion titulo="Seguridad">
          <View
            style={[
              styles.card,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: theme.borderLight },
              ]}
              onPress={() => acc.setModalPasswordVisible(true)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={theme.textPrimary}
                />
                <Text
                  style={[styles.menuItemText, { color: theme.textPrimary }]}
                >
                  Cambiar Contraseña
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textMuted}
              />
            </Pressable>
          </View>
        </Seccion>

        {/* 4. SESIÓN Y PRIVACIDAD */}
        <Seccion titulo="Sesión y Privacidad">
          <View
            style={[
              styles.card,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <Pressable
              disabled={acc.isSigningOut}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: theme.borderLight },
              ]}
              onPress={acc.handleCerrarSesion}
            >
              <View style={styles.menuItemLeft}>
                {acc.isSigningOut ? (
                  <ActivityIndicator size="small" color={theme.danger} />
                ) : (
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={theme.danger}
                  />
                )}
                <Text style={[styles.menuItemText, { color: theme.danger }]}>
                  {acc.isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                </Text>
              </View>
            </Pressable>
          </View>
        </Seccion>
      </ScrollView>

      {/* MODAL CAMBIO CONTRASEÑA */}
      <ChangePasswordModal
        visible={acc.modalPasswordVisible}
        onClose={() => acc.setModalPasswordVisible(false)}
        passActual={acc.passActual}
        setPassActual={acc.setPassActual}
        passNueva={acc.passNueva}
        setPassNueva={acc.setPassNueva}
        onSubmit={acc.handleCambiarPassword}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  badgeEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    marginLeft: 44,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  subText: {
    fontSize: 11,
    marginTop: 2,
  },
});
