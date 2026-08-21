import { signOut } from "@/features/auth/services/authService";
import { useState } from "react";
import { Alert } from "react-native";

export const useAccount = () => {
  const [nombre, setNombre] = useState("Alan Nicolas Limachi");
  const [email] = useState("alan.limachi@ejemplo.com");
  const [telefono, setTelefono] = useState("+591 71234567");
  const [modoEdicion, setModoEdicion] = useState(false);

  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");

  // Estado para bloquear botones mientras se comunica con la API
  const [isSigningOut, setIsSigningOut] = useState(false);

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
              // Llama al servicio centralizado de autenticación
              await signOut();
              // Nota: Tu RootNavigation o AuthContext detectará que 'session' pasa a null
              // y manejará la redirección automáticamente a /(auth)/login.
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
      "Esta acción es irreversible. Se borrarán todos tus datos, impresoras y cotizaciones guardadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar Definitivamente",
          style: "destructive",
          onPress: () => {
            // Lógica para eliminar registro
          },
        },
      ],
    );
  };

  const handleCambiarPassword = () => {
    if (!passActual || !passNueva) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente.");
    setModalPasswordVisible(false);
    setPassActual("");
    setPassNueva("");
  };

  return {
    nombre,
    setNombre,
    email,
    telefono,
    setTelefono,
    modoEdicion,
    setModoEdicion,
    modalPasswordVisible,
    setModalPasswordVisible,
    passActual,
    setPassActual,
    passNueva,
    setPassNueva,
    isSigningOut,
    handleCerrarSesion,
    handleEliminarCuenta,
    handleCambiarPassword,
  };
};
