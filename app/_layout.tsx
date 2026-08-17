import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function RootNavigation() {
  const { session, initialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && inAuthGroup) {
      // Si está autenticado y está en pantallas de auth, ir al dashboard
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup) {
      // Si NO está autenticado y está fuera de auth, ir a login
      router.replace("/(auth)/login");
    }
  }, [session, initialized, segments]);

  if (!initialized) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
});
