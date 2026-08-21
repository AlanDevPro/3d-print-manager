// app/cuenta.tsx
import { ChangePasswordModal } from "@/components/forms/ChangePasswordModal";
import { ItemDato } from "@/components/ui/ItemDato";
import { Seccion } from "@/components/ui/Seccion";
import { useAccount } from "@/features/auth/hooks/useAccount";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function CuentaScreen() {
  const { theme, isDark, mode, setThemeMode } = useTheme();
  const acc = useAccount();

  const handleToggleTheme = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

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
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  acc.nombre || "Usuario",
                )}&background=DC2626&color=fff&size=128`,
              }}
              style={styles.avatar}
            />
            <Pressable
              style={[
                styles.badgeEdit,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.bgSurface,
                },
              ]}
            >
              <Ionicons name="camera" size={14} color="#FFF" />
            </Pressable>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>
            {acc.nombre}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {acc.email}
          </Text>
          <View
            style={[styles.roleTag, { backgroundColor: theme.primaryLight }]}
          >
            <Text style={[styles.roleText, { color: theme.primary }]}>
              Plan Pro / Usuario Verificado
            </Text>
          </View>
        </View>

        {/* 1. DATOS PERSONALES */}
        <Seccion
          titulo="Datos Personales"
          actionText={acc.modoEdicion ? "Guardar" : "Editar"}
          onActionPress={() => acc.setModoEdicion(!acc.modoEdicion)}
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
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: theme.borderLight },
              ]}
              onPress={acc.handleCerrarSesion}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.danger}
                />
                <Text style={[styles.menuItemText, { color: theme.danger }]}>
                  Cerrar Sesión
                </Text>
              </View>
            </Pressable>

            <View
              style={[styles.divider, { backgroundColor: theme.borderLight }]}
            />

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: theme.borderLight },
              ]}
              onPress={acc.handleEliminarCuenta}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="trash-outline" size={20} color={theme.danger} />
                <Text style={[styles.menuItemText, { color: theme.danger }]}>
                  Eliminar Cuenta
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badgeEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
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
