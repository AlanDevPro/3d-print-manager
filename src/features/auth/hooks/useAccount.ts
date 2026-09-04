// src/features/auth/hooks/useAccount.ts
import { useAuth } from "@/context/AuthContext";
import * as authService from "@/features/auth/services/authService";
import {
  updateProfile,
  uploadAvatar,
} from "@/features/auth/services/perfilService";
import type { RolUsuario } from "@/features/auth/types";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useAccount = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [nombre, setNombre] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [telefono, setTelefono] = useState(profile?.telefono ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? null,
  );
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");

  const [isSigningOut, setIsSigningOut] = useState(false);

  const rol: RolUsuario = (profile?.rol as RolUsuario) ?? "cliente";

  useEffect(() => {
    if (profile) {
      setNombre(profile.full_name ?? "");
      setEmail(profile.email ?? user?.email ?? "");
      setTelefono(profile.telefono ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    } else if (user) {
      setEmail(user.email ?? "");
    }
  }, [profile, user]);

  // Selección de foto utilizando la galería del dispositivo
  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Se requieren permisos para acceder a la galería de fotos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const handleGuardarPerfil = async () => {
    if (!user) return;
    try {
      setSaving(true);
      let finalAvatarUrl = avatarUrl;

      // Si el usuario seleccionó una imagen nueva, se procesa la subida al Storage
      if (newAvatarUri) {
        finalAvatarUrl = await uploadAvatar(user.id, newAvatarUri);
      }

      await updateProfile(user.id, {
        full_name: nombre,
        telefono: telefono,
        avatarUrl: finalAvatarUrl ?? undefined,
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      setAvatarUrl(finalAvatarUrl);
      setNewAvatarUri(null);
      setModoEdicion(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await authService.signOut();
            } catch (error: any) {
              Alert.alert(
                "Error al cerrar sesión",
                error.message || "Ocurrió un problema de conexión.",
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const handleEliminarCuenta = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "Esta acción es irreversible. Se borrarán todos tus datos de perfil.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar Definitivamente",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                await authService.deleteAccount(user.id);
                await authService.signOut();
              }
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar la cuenta.",
              );
            }
          },
        },
      ],
    );
  };

  const handleCambiarPassword = async () => {
    if (!passActual || !passNueva) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    try {
      await authService.changePassword(passActual, passNueva);

      Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente.");
      setModalPasswordVisible(false);
      setPassActual("");
      setPassNueva("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar la contraseña.",
      );
    }
  };

  return {
    nombre,
    setNombre,
    email,
    telefono,
    setTelefono,
    avatarUrl,
    newAvatarUri,
    rol,
    isAdmin: rol === "admin" || rol === "cliente",
    isEmpleado: rol === "empleado",
    isCliente: rol === "cliente",
    loading: !profile && !!user,
    saving,
    modoEdicion,
    setModoEdicion,
    modalPasswordVisible,
    setModalPasswordVisible,
    passActual,
    setPassActual,
    passNueva,
    setPassNueva,
    isSigningOut,
    handlePickAvatar,
    handleGuardarPerfil,
    handleCerrarSesion,
    handleEliminarCuenta,
    handleCambiarPassword,
  };
};
