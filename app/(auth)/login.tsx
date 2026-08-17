import {
  loginWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "@/features/auth/services/authService";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await signUpWithEmail(email, password);
        Alert.alert(
          "Registro exitoso",
          "Si el registro requiere confirmación, revisa tu correo electrónico.",
        );
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      Alert.alert(
        "Error de autenticación",
        err.message || "Ocurrió un error inesperado",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      Alert.alert(
        "Error con Google",
        err.message || "No se pudo iniciar sesión con Google",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cotizador 3D</Text>
      <Text style={styles.subtitle}>
        {isRegister
          ? "Crea una cuenta para comenzar"
          : "Inicia sesión para continuar"}
      </Text>

      {/* Formulario Email / Password */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isRegister ? "Registrarse" : "Iniciar Sesión"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>O</Text>
        <View style={styles.divider} />
      </View>

      {/* Botón de Google */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>Continuar con Google</Text>
      </TouchableOpacity>

      {/* Toggle entre Login y Registro */}
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsRegister(!isRegister)}
      >
        <Text style={styles.switchText}>
          {isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate aquí"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
    gap: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#94A3B8",
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
});
