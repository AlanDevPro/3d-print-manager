// features/auth/hooks/useAccount.ts
import { useAuth } from "@/context/AuthContext";
import { useUpdatePerfil } from "@/features/auth/hooks/usePerfilHibrido";
import * as authService from "@/features/auth/services/authService";
import { uploadAvatar } from "@/features/auth/services/perfilService";
import type { RolUsuario } from "@/features/auth/types";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export const useAccount = () => {
  const { user, profile } = useAuth();
  const updatePerfilMutation = useUpdatePerfil();
  const queryClient = useQueryClient();

  const [nombreInput, setNombre] = useState<string | null>(null);
  const [telefonoInput, setTelefono] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const nombre = modoEdicion
    ? (nombreInput ?? profile?.full_name ?? "")
    : (profile?.full_name ?? "");
  const email = profile?.email ?? user?.email ?? "";
  const telefono = modoEdicion
    ? (telefonoInput ?? profile?.telefono ?? "")
    : (profile?.telefono ?? "");
  const avatarUrl = profile?.avatar_url ?? null;
  const rol: RolUsuario = (profile?.rol as RolUsuario) ?? "cliente";

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Se requieren permisos para acceder a la galería.",
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
      let finalAvatarUrl = avatarUrl;

      if (newAvatarUri) {
        finalAvatarUrl = await uploadAvatar(user.id, newAvatarUri);
      }

      await updatePerfilMutation.mutateAsync({
        userId: user.id,
        updates: {
          full_name: nombre,
          telefono: telefono,
          avatarUrl: finalAvatarUrl ?? undefined,
        },
      });

      setNewAvatarUri(null);
      setNombre(null);
      setTelefono(null);
      setModoEdicion(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil.");
    }
  };

  // Función para manejar el cambio de contraseña usando changePassword de authService
  const handleCambiarPassword = async () => {
    if (!passActual.trim() || !passNueva.trim()) {
      Alert.alert(
        "Error",
        "Por favor completa todos los campos de contraseña.",
      );
      return;
    }

    if (passNueva.length < 6) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    try {
      // Llamada correcta al método changePassword definido en authService
      await authService.changePassword(passActual, passNueva);

      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
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

  const handleCerrarSesion = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSigningOut(true);
            await authService.signOut();
            queryClient.clear();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
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
    isAdmin: rol === "admin",
    isEmpleado: rol === "empleado",
    isCliente: rol === "cliente",
    saving: updatePerfilMutation.isPending,
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
    handleCambiarPassword,
    handleCerrarSesion,
  };
};
