// app/empresa.tsx
// Destino de [ 🏢 Logo Taller ]: branding e información fiscal.
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — reemplazar por fetch/mutation a Supabase luego
// ---------------------------------------------------------------------------
const EMPRESA_MOCK = {
  logoUrl: null as string | null,
  nombreComercial: "Taller 3D Andino",
  nit: "1023456789",
  razonSocial: "Andino Impresiones 3D S.R.L.",
  direccionFiscal: "Av. Hernando Siles #245, Zona Central",
  ciudad: "Sucre, Chuquisaca",
  whatsapp: "+591 700 12345",
  instagram: "@taller3dandino",
  facebook: "Taller 3D Andino",
  sitioWeb: "www.taller3dandino.com",
  garantia:
    "Ofrecemos 15 días de garantía por defectos de impresión atribuibles al taller. No cubre daños por mal uso, exposición al sol o cargas mecánicas fuera de especificación.",
};

export default function EmpresaScreen() {
  const { theme, isDark } = useTheme();
  const [empresa, setEmpresa] = useState(EMPRESA_MOCK);
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof typeof EMPRESA_MOCK>(
    key: K,
    value: (typeof EMPRESA_MOCK)[K],
  ) => {
    setEmpresa((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handlePickLogo = () => {
    // TODO: integrar expo-image-picker
  };

  const handleGuardar = () => {
    // TODO: persistir en Supabase (tabla empresas)
    setDirty(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mi Empresa",
          headerStyle: { backgroundColor: theme.bgSurface },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
          headerRight: () =>
            dirty ? (
              <TouchableOpacity
                onPress={handleGuardar}
                style={styles.headerSaveBtn}
              >
                <Text style={[styles.headerSaveText, { color: theme.primary }]}>
                  Guardar
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          key={isDark ? "dark" : "light"}
          style={[styles.container, { backgroundColor: theme.bgPrimary }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* --- Logo + nombre comercial --- */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <Pressable style={styles.logoWrapper} onPress={handlePickLogo}>
              {empresa.logoUrl ? (
                <Image
                  source={{ uri: empresa.logoUrl }}
                  style={styles.logoImg}
                />
              ) : (
                <View
                  style={[
                    styles.logoPlaceholder,
                    {
                      backgroundColor: theme.bgPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Ionicons name="business" size={32} color={theme.primary} />
                </View>
              )}
              <View
                style={[
                  styles.logoEditBadge,
                  {
                    backgroundColor: theme.primary,
                    borderColor: theme.bgSurface,
                  },
                ]}
              >
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </Pressable>

            <TextInput
              style={[styles.heroNombre, { color: theme.textPrimary }]}
              value={empresa.nombreComercial}
              onChangeText={(t) => update("nombreComercial", t)}
              placeholder="Nombre comercial"
              placeholderTextColor={theme.textMuted}
            />
            <Text
              style={[styles.heroSubtitulo, { color: theme.textSecondary }]}
            >
              Este nombre y logo aparecerán en tus cotizaciones y PDFs
            </Text>
          </View>

          {/* --- Identidad del Taller --- */}
          <Seccion titulo="Identidad del Taller" icono="finger-print-outline">
            <Campo
              label="Nombre comercial"
              value={empresa.nombreComercial}
              onChangeText={(t) => update("nombreComercial", t)}
            />
            <Campo
              label="NIT / RUC"
              value={empresa.nit}
              onChangeText={(t) => update("nit", t)}
              keyboardType="number-pad"
            />
          </Seccion>

          {/* --- Datos Fiscales --- */}
          <Seccion titulo="Datos Fiscales" icono="document-text-outline">
            <Campo
              label="Razón social"
              value={empresa.razonSocial}
              onChangeText={(t) => update("razonSocial", t)}
            />
            <Campo
              label="Dirección fiscal"
              value={empresa.direccionFiscal}
              onChangeText={(t) => update("direccionFiscal", t)}
            />
            <Campo
              label="Ciudad"
              value={empresa.ciudad}
              onChangeText={(t) => update("ciudad", t)}
            />
          </Seccion>

          {/* --- Redes Sociales y Contacto --- */}
          <Seccion
            titulo="Redes Sociales y Contacto"
            icono="share-social-outline"
          >
            <Campo
              label="WhatsApp"
              value={empresa.whatsapp}
              onChangeText={(t) => update("whatsapp", t)}
              keyboardType="phone-pad"
              icono="logo-whatsapp"
              iconoColor="#25D366"
            />
            <Campo
              label="Instagram"
              value={empresa.instagram}
              onChangeText={(t) => update("instagram", t)}
              icono="logo-instagram"
              iconoColor="#E1306C"
            />
            <Campo
              label="Facebook"
              value={empresa.facebook}
              onChangeText={(t) => update("facebook", t)}
              icono="logo-facebook"
              iconoColor="#1877F2"
            />
            <Campo
              label="Sitio web"
              value={empresa.sitioWeb}
              onChangeText={(t) => update("sitioWeb", t)}
              icono="globe-outline"
              iconoColor={theme.primary}
              autoCapitalize="none"
            />
          </Seccion>

          {/* --- Políticas de Garantía --- */}
          <Seccion
            titulo="Políticas de Garantía"
            icono="shield-checkmark-outline"
          >
            <TextInput
              style={[
                styles.textarea,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor: theme.bgSurface,
                },
              ]}
              value={empresa.garantia}
              onChangeText={(t) => update("garantia", t)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Describe tu política de garantía..."
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Este texto se incluirá automáticamente en tus cotizaciones y PDFs.
            </Text>
          </Seccion>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function Seccion({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.seccion}>
      <View style={styles.seccionHeader}>
        <Ionicons name={icono} size={18} color={theme.primary} />
        <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
          {titulo}
        </Text>
      </View>
      <View
        style={[
          styles.seccionCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Campo({
  label,
  value,
  onChangeText,
  keyboardType,
  icono,
  iconoColor,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "number-pad" | "phone-pad";
  icono?: keyof typeof Ionicons.glyphMap;
  iconoColor?: string;
  autoCapitalize?: "none" | "sentences";
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.campo}>
      <Text style={[styles.campoLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.campoInputRow, { borderBottomColor: theme.border }]}>
        {icono && (
          <Ionicons
            name={icono}
            size={16}
            color={iconoColor ?? theme.textMuted}
            style={styles.campoIcono}
          />
        )}
        <TextInput
          style={[styles.campoInput, { color: theme.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
          placeholderTextColor={theme.textMuted}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },

  // Hero (logo + nombre)
  heroCard: {
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
  },
  logoWrapper: {
    marginBottom: 8,
  },
  logoImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  heroNombre: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    minWidth: 160,
  },
  heroSubtitulo: {
    fontSize: 12,
    textAlign: "center",
  },

  // Secciones
  seccion: {
    gap: 8,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "700",
  },
  seccionCard: {
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
  },

  // Campos
  campo: {
    gap: 6,
  },
  campoLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  campoInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 6,
    gap: 8,
  },
  campoIcono: {
    width: 18,
  },
  campoInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Garantía
  textarea: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  hint: {
    fontSize: 11,
  },

  // Header
  headerSaveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerSaveText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
