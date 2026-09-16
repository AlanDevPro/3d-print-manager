import {
  loginWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "@/features/auth/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  LayoutAnimation,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// ---------------------------------------------------------------------------
// Paleta "Impresión 3D Tech" (Colores optimizados)
// ---------------------------------------------------------------------------
const PRINT_ACCENT = "#00F2FE"; // Cyan LED reluciente
const ICON_ACTIVE_COLOR = "#0EA5E9"; // Azul vibrante para íconos/foco
const CARD_BG = "#FFFFFF";

// ---------------------------------------------------------------------------
// Componente SVG: Logo oficial de Google en 4 colores
// ---------------------------------------------------------------------------
function GoogleColorIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Tipos y Validación
// ---------------------------------------------------------------------------
type FormErrors = {
  nombreCompleto?: string;
  telefono?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{7,15}$/;

function validate(
  isRegister: boolean,
  values: {
    nombreCompleto: string;
    telefono: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
): FormErrors {
  const errors: FormErrors = {};

  if (isRegister && values.nombreCompleto.trim().length < 3) {
    errors.nombreCompleto = "Ingresa tu nombre completo";
  }

  if (isRegister && !PHONE_REGEX.test(values.telefono.trim())) {
    errors.telefono = "Teléfono inválido (mín. 7 dígitos)";
  }

  if (!values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Ingresa un correo electrónico válido";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (values.password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres";
  }

  if (isRegister) {
    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Componente Campo de Formulario (Con estado de foco activo)
// ---------------------------------------------------------------------------
function FormField({
  icon,
  error,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getBorderColor = () => {
    if (error) return styles.inputContainerError;
    if (isFocused) return styles.inputContainerFocused;
    return null;
  };

  const getIconColor = () => {
    if (error) return "#EF4444";
    if (isFocused) return ICON_ACTIVE_COLOR;
    return "#94A3B8";
  };

  return (
    <View style={styles.fieldWrapper}>
      <View style={[styles.inputContainer, getBorderColor()]}>
        <Ionicons
          name={icon}
          size={20}
          color={getIconColor()}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={10}>
            <Ionicons name={rightIcon} size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Fondo Animado: Piezas 3D Flotantes
// ---------------------------------------------------------------------------
type SpinSpeed = "slow" | "fast" | "none";

function FloatingPiece({
  icon,
  size,
  color,
  startX,
  startY,
  duration,
  delay,
  spin = "slow",
  bounce = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  spin?: SpinSpeed;
  bounce?: boolean;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: bounce ? -24 : -16,
          duration: bounce ? duration * 0.55 : duration,
          delay,
          easing: bounce ? Easing.out(Easing.quad) : Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: bounce ? duration * 0.75 : duration,
          easing: bounce ? Easing.bounce : Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const loops: Animated.CompositeAnimation[] = [floatLoop];

    if (spin !== "none") {
      const rotateDuration = spin === "fast" ? duration * 1.5 : duration * 4;
      const rotateLoop = Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: rotateDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loops.push(rotateLoop);
    }

    if (bounce) {
      const scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 0.85,
            duration: duration * 0.55,
            delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration * 0.35,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loops.push(scaleLoop);
    }

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [translateY, rotate, scale, duration, delay, spin, bounce]);

  const spinInterp = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        opacity: 0.4,
        transform: [{ translateY }, { rotate: spinInterp }, { scale }],
      }}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Overlay de Capas de Impresión
// ---------------------------------------------------------------------------
function LayerLinesOverlay({ height }: { height: number }) {
  if (!height) return null;
  const spacing = 12;
  const count = Math.ceil(height / spacing);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * spacing,
            height: 1,
            backgroundColor: "#0F172A",
            opacity: i % 4 === 0 ? 0.05 : 0.02,
          }}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta "Impresa"
// ---------------------------------------------------------------------------
function PrintedCard({
  children,
  isRegister,
}: {
  children: React.ReactNode;
  isRegister: boolean;
}) {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const printProgress = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMeasuredHeight(0);
    printProgress.setValue(0);
  }, [isRegister]);

  const onMeasureLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== measuredHeight) {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setMeasuredHeight(h);
    }
  };

  useEffect(() => {
    if (measuredHeight > 0) {
      Animated.timing(printProgress, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanLine, {
              toValue: 1,
              duration: 2200,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scanLine, {
              toValue: 0,
              duration: 2200,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [measuredHeight]);

  const animatedHeight = printProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, measuredHeight || 1],
  });

  const scanTranslateY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(measuredHeight - 4, 0)],
  });

  return (
    <View style={styles.printedCardOuter}>
      <View style={styles.printSkirt} pointerEvents="none" />

      <View style={styles.hiddenMeasurer} pointerEvents="none">
        <View onLayout={onMeasureLayout} style={styles.card}>
          {children}
        </View>
      </View>

      {measuredHeight > 0 && (
        <Animated.View style={{ height: animatedHeight, overflow: "hidden", width: "100%" }}>
          <View style={styles.card}>
            <LayerLinesOverlay height={measuredHeight} />
            {children}

            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanTranslateY }] },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["transparent", PRINT_ACCENT, "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.scanGradient}
              />
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {measuredHeight > 0 && (
        <Animated.View
          style={[styles.printHeadLine, { top: animatedHeight }]}
          pointerEvents="none"
        />
      )}

      <View style={[styles.calibrationMark, styles.calibrationTopLeft]} pointerEvents="none" />
      <View style={[styles.calibrationMark, styles.calibrationTopRight]} pointerEvents="none" />
      <View style={[styles.calibrationMark, styles.calibrationBottomLeft]} pointerEvents="none" />
      <View style={[styles.calibrationMark, styles.calibrationBottomRight]} pointerEvents="none" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla Principal
// ---------------------------------------------------------------------------
export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const resetErrorsOnToggle = (nextIsRegister: boolean) => {
    setIsRegister(nextIsRegister);
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validate(isRegister, {
      nombreCompleto,
      telefono,
      email,
      password,
      confirmPassword,
    });

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      if (isRegister) {
        await signUpWithEmail(email.trim(), password);
        setErrors({});
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        email: err?.message || "Ocurrió un error inesperado",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        email: err?.message || "No se pudo iniciar sesión con Google",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0B132B", "#1C2541", "#0B132B"]} style={styles.screen}>
      <FloatingPiece icon="cube-outline" size={36} color="#00F2FE" startX={20} startY={80} duration={2600} delay={0} spin="slow" />
      <FloatingPiece icon="prism-outline" size={28} color="#38BDF8" startX={290} startY={120} duration={3200} delay={300} spin="slow" />
      <FloatingPiece icon="diamond-outline" size={24} color="#FBBF24" startX={30} startY={450} duration={2400} delay={200} spin="fast" />
      <FloatingPiece icon="ellipse-outline" size={22} color="#F472B6" startX={320} startY={520} duration={1500} delay={100} spin="none" bounce />
      <FloatingPiece icon="disc-outline" size={18} color="#A78BFA" startX={60} startY={210} duration={1300} delay={450} spin="none" bounce />
      <FloatingPiece icon="hardware-chip-outline" size={26} color="#10B981" startX={270} startY={60} duration={3600} delay={150} spin="slow" />
      <FloatingPiece icon="cube" size={20} color="#38BDF8" startX={330} startY={360} duration={2200} delay={350} spin="slow" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <PrintedCard isRegister={isRegister}>
            <View style={styles.headerRow}>
              <Ionicons name="cube" size={26} color={PRINT_ACCENT} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Cotizador 3D</Text>
            </View>
            <Text style={styles.subtitle}>
              {isRegister
                ? "Crea tu cuenta para empezar a cotizar"
                : "Inicia sesión para continuar"}
            </Text>

            <View style={styles.form}>
              {isRegister && (
                <FormField
                  icon="person-outline"
                  placeholder="Nombre completo"
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                  error={errors.nombreCompleto}
                  autoCapitalize="words"
                />
              )}

              {isRegister && (
                <FormField
                  icon="call-outline"
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={setTelefono}
                  error={errors.telefono}
                  keyboardType="phone-pad"
                />
              )}

              <FormField
                icon="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormField
                icon="lock-closed-outline"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword((prev) => !prev)}
              />

              {isRegister && (
                <FormField
                  icon="lock-closed-outline"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
                />
              )}

              {/* Botón Principal (Azul) */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={[PRINT_ACCENT, "#0284C7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>
                    {loading
                      ? "Procesando..."
                      : isRegister
                      ? "Registrarse"
                      : "Iniciar Sesión"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.divider} />
            </View>

            {/* Botón de Google Profesional (Degradado Morado + Logo SVG Oficial) */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <View style={styles.googleIconContainer}>
                  <GoogleColorIcon size={18} />
                </View>
                <Text style={styles.primaryButtonText}>Continuar con Google</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => resetErrorsOnToggle(!isRegister)}
            >
              <Text style={styles.switchText}>
                {isRegister
                  ? "¿Ya tienes cuenta? "
                  : "¿No tienes cuenta? "}
                <Text style={styles.switchTextHighlight}>
                  {isRegister ? "Inicia sesión" : "Regístrate aquí"}
                </Text>
              </Text>
            </TouchableOpacity>
          </PrintedCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  // Tarjeta contenedora
  printedCardOuter: {
    width: "90%",
    maxWidth: 400,
    position: "relative",
  },
  printSkirt: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: PRINT_ACCENT,
    opacity: 0.45,
    borderRadius: 28,
  },
  hiddenMeasurer: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    width: "100%",
  },
  printHeadLine: {
    position: "absolute",
    left: -2,
    right: -2,
    height: 3,
    marginTop: -1.5,
    backgroundColor: PRINT_ACCENT,
    shadowColor: PRINT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 2,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    justifyContent: "center",
    zIndex: 10,
  },
  scanGradient: {
    height: 3,
    width: "100%",
    opacity: 0.85,
    shadowColor: PRINT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  calibrationMark: {
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: PRINT_ACCENT,
    opacity: 0.7,
  },
  calibrationTopLeft: {
    top: -12,
    left: -12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  calibrationTopRight: {
    top: -12,
    right: -12,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  calibrationBottomLeft: {
    bottom: -12,
    left: -12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  calibrationBottomRight: {
    bottom: -12,
    right: -12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // Tarjeta principal
  card: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 22,
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },

  // Campos de Texto
  fieldWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: ICON_ACTIVE_COLOR,
    backgroundColor: "#F0F9FF",
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 2,
    gap: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
  },

  // Botón Principal
  primaryButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: PRINT_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // Separador
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },

  // Botón de Google
  googleButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  // Toggle Login/Registro
  switchButton: {
    marginTop: 18,
    alignItems: "center",
  },
  switchText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  switchTextHighlight: {
    color: "#0284C7",
    fontWeight: "700",
  },
});