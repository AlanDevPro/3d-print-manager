si tengo estos codigos en app/:
en app/\_layout.tsx:
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

app/index.tsx:
import React, { useState } from "react";
import {
ActivityIndicator,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";
import { loginWithGoogle } from "../src/features/auth/services/authService";

export default function LoginScreen() {
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
try {
setLoading(true);
await loginWithGoogle();
} catch (err) {
// Manejar error si es necesario
} finally {
setLoading(false);
}
};

return (
<View style={styles.container}>
<Text style={styles.title}>Cotizador 3D</Text>
<Text style={styles.subtitle}>
Gestiona y cotiza tus impresiones fácilmente
</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        )}
      </TouchableOpacity>
    </View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#F8F9FA",
alignItems: "center",
justifyContent: "center",
padding: 24,
},
title: {
fontSize: 32,
fontWeight: "bold",
color: "#1A1A1A",
marginBottom: 8,
},
subtitle: {
fontSize: 16,
color: "#6C757D",
marginBottom: 40,
textAlign: "center",
},
googleButton: {
backgroundColor: "#4285F4",
paddingVertical: 14,
paddingHorizontal: 28,
borderRadius: 12,
width: "100%",
alignItems: "center",
elevation: 2,
},
buttonText: {
color: "#FFFFFF",
fontWeight: "600",
fontSize: 16,
},
});

app/(auth)/\_layout.tsx:
import { Stack } from "expo-router";

export default function AuthLayout() {
return <Stack screenOptions={{ headerShown: false }} />;
}

app/(auth)/\_login.tsx:
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

app/(tabs)/\_layout.tsx:
import { Tabs } from "expo-router";

export default function TabsLayout() {
return (
<Tabs screenOptions={{ headerShown: false }}>
<Tabs.Screen name="index" options={{ title: "Inicio" }} />
</Tabs>
);
}

app/(tabs)/explore.tsx:
import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

export default function TabTwoScreen() {
return (
<ParallaxScrollView
headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
headerImage={
<IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
} >
<ThemedView style={styles.titleContainer}>
<ThemedText
type="title"
style={{
            fontFamily: Fonts.rounded,
          }} >
Explore
</ThemedText>
</ThemedView>
<ThemedText>
This app includes example code to help you get started.
</ThemedText>
<Collapsible title="File-based routing">
<ThemedText>
This app has two screens:{" "}
<ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
and{" "}
<ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
</ThemedText>
<ThemedText>
The layout file in{" "}
<ThemedText type="defaultSemiBold">app/(tabs)/\_layout.tsx</ThemedText>{" "}
sets up the tab navigator.
</ThemedText>
<ExternalLink href="https://docs.expo.dev/router/introduction">
<ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Android, iOS, and web support">
<ThemedText>
You can open this project on Android, iOS, and the web. To open the
web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
in the terminal running this project.
</ThemedText>
</Collapsible>
<Collapsible title="Images">
<ThemedText>
For static images, you can use the{" "}
<ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
<ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to
provide files for different screen densities
</ThemedText>
<Image
source={require("@/assets/images/react-logo.png")}
style={{ width: 100, height: 100, alignSelf: "center" }}
/>
<ExternalLink href="https://reactnative.dev/docs/images">
<ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Light and dark mode components">
<ThemedText>
This template has light and dark mode support. The{" "}
<ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
lets you inspect what the user&apos;s current color scheme is, and so
you can adjust UI colors accordingly.
</ThemedText>
<ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
<ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Animations">
<ThemedText>
This template includes an example of an animated component. The{" "}
<ThemedText type="defaultSemiBold">
components/HelloWave.tsx
</ThemedText>{" "}
component uses the powerful{" "}
<ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
react-native-reanimated
</ThemedText>{" "}
library to create a waving hand animation.
</ThemedText>
{Platform.select({
ios: (
<ThemedText>
The{" "}
<ThemedText type="defaultSemiBold">
components/ParallaxScrollView.tsx
</ThemedText>{" "}
component provides a parallax effect for the header image.
</ThemedText>
),
})}
</Collapsible>
</ParallaxScrollView>
);
}

const styles = StyleSheet.create({
headerImage: {
color: "#808080",
bottom: -90,
left: -35,
position: "absolute",
},
titleContainer: {
flexDirection: "row",
gap: 8,
},
});

app/(tabs)/index.tsx:
import React, { useState } from "react";
import {
ActivityIndicator,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";
import { loginWithGoogle } from "../src/features/auth/services/authService";

export default function LoginScreen() {
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
try {
setLoading(true);
await loginWithGoogle();
} catch (err) {
// Manejar error si es necesario
} finally {
setLoading(false);
}
};

return (
<View style={styles.container}>
<Text style={styles.title}>Cotizador 3D</Text>
<Text style={styles.subtitle}>
Gestiona y cotiza tus impresiones fácilmente
</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        )}
      </TouchableOpacity>
    </View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#F8F9FA",
alignItems: "center",
justifyContent: "center",
padding: 24,
},
title: {
fontSize: 32,
fontWeight: "bold",
color: "#1A1A1A",
marginBottom: 8,
},
subtitle: {
fontSize: 16,
color: "#6C757D",
marginBottom: 40,
textAlign: "center",
},
googleButton: {
backgroundColor: "#4285F4",
paddingVertical: 14,
paddingHorizontal: 28,
borderRadius: 12,
width: "100%",
alignItems: "center",
elevation: 2,
},
buttonText: {
color: "#FFFFFF",
fontWeight: "600",
fontSize: 16,
},
});

si tengo todos estos codigos explicame detalladamente por envez de mostrarme mi formualrio que me pide email + password o iniicaiar session con google o registrarse solo me muestra en la pantalla de inicio: cotizador 3D gestiona y cotiza tus impresiones facilmente y un boton que dice iniciar session con google explicame detalladamente por que solo me muesrtra eso y no mi formulario para registrarme y inicioar session con google o registrarse explicame eso y que archovs tenggo que modificar o elimnar para solucionar el error que tegno
