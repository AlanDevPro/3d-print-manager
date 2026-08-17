import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/features/auth/services/authService";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(); // Se invoca la función corregida
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email || "Usuario";

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>¡Hola, {userName}!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.subtext}>
        Bienvenido a tu panel de cotizaciones 3D.
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
  },
  welcomeText: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 14, color: "#6C757D", marginBottom: 8 },
  subtext: { fontSize: 14, color: "#666", marginBottom: 30 },
  logoutButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  logoutText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
});
