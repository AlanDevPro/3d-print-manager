// app/empresa.tsx
import { useEmpresa } from "@/context/EmpresaContext";
import type { EmpresaInfo } from "@/features/empresa/types";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// Estado por defecto defensivo para evitar runtime errors
const DEFAULT_EMPRESA_INFO: EmpresaInfo = {
  id: "",
  nombreComercial: "",
  nit: "",
  razonSocial: "",
  direccionFiscal: "",
  ciudad: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  sitioWeb: "",
  garantia: "",
  logoUrl: "",
};

export default function EmpresaScreen() {
  const { theme, isDark } = useTheme();
  const {
    empresa: empresaGuardada,
    cargando,
    guardando,
    error,
    guardar,
  } = useEmpresa();

  // Inicialización defensiva frente a estados iniciales nulos
  const [empresa, setEmpresa] = useState<EmpresaInfo>(
    empresaGuardada ?? DEFAULT_EMPRESA_INFO,
  );

  // Estados de edición independientes por sección
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingIdentidad, setEditingIdentidad] = useState(false);
  const [editingFiscal, setEditingFiscal] = useState(false);
  const [editingContacto, setEditingContacto] = useState(false);
  const [editingGarantia, setEditingGarantia] = useState(false);

  // Sincronización segura con el Contexto de Supabase/Backend
  useEffect(() => {
    if (empresaGuardada) {
      setEmpresa(empresaGuardada);
    }
  }, [empresaGuardada]);

  const update = <K extends keyof EmpresaInfo>(
    key: K,
    value: EmpresaInfo[K],
  ) => {
    setEmpresa((prev) => ({ ...prev, [key]: value }));
  };

  // Función para seleccionar la imagen/logo usando Expo ImagePicker
  const handlePickLogo = async () => {
    if (!editingHeader) return;

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso Denegado",
        "Se requiere acceso a la galería para cambiar el logo de la empresa.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // O ImagePicker.MediaType.IMAGE
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      update("logoUrl", result.assets[0].uri);
    }
  };

  // Reemplaza el método handleGuardarSeccion en app/empresa.tsx por esta implementación defensiva:

  const handleGuardarSeccion = async (
    setEditingState: (editing: boolean) => void,
  ) => {
    try {
      // Al invocar guardar(), el servicio detecta si empresa.logoUrl
      // empieza por "file://" y sube automáticamente la imagen a 'empresa-assets'
      await guardar(empresa);
      setEditingState(false);
    } catch (err: any) {
      Alert.alert(
        "Error al guardar",
        err?.message ?? "No se pudieron actualizar los datos de la empresa.",
      );
    }
  };

  // Cancelar cambios y revertir al estado global del Context
  const handleCancelarSeccion = (
    setEditingState: (editing: boolean) => void,
  ) => {
    setEmpresa(empresaGuardada ?? DEFAULT_EMPRESA_INFO);
    setEditingState(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mi Empresa",
          headerStyle: { backgroundColor: theme.bgSurface },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
        }}
      />

      {cargando ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.bgPrimary },
          ]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando información del taller...
          </Text>
        </View>
      ) : (
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
            {error && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* HERO: Logo + Nombre Comercial */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.heroTopActions}>
                <BotonEditar
                  isEditing={editingHeader}
                  guardando={guardando}
                  onEdit={() => setEditingHeader(true)}
                  onSave={() => handleGuardarSeccion(setEditingHeader)}
                  onCancel={() => handleCancelarSeccion(setEditingHeader)}
                />
              </View>

              <Pressable
                style={styles.logoWrapper}
                onPress={handlePickLogo}
                disabled={!editingHeader}
              >
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
                    <Ionicons name="business" size={36} color={theme.primary} />
                  </View>
                )}
                {editingHeader && (
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
                )}
              </Pressable>

              {editingHeader ? (
                <TextInput
                  style={[
                    styles.heroNombreInput,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.primary,
                      backgroundColor: theme.bgPrimary,
                    },
                  ]}
                  value={empresa.nombreComercial}
                  onChangeText={(t) => update("nombreComercial", t)}
                  placeholder="Nombre comercial"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <Text
                  style={[styles.heroNombreText, { color: theme.textPrimary }]}
                >
                  {empresa.nombreComercial || "Nombre comercial no asignado"}
                </Text>
              )}

              <Text
                style={[styles.heroSubtitulo, { color: theme.textSecondary }]}
              >
                Información de marca utilizada en cotizaciones y comprobantes
              </Text>
            </View>

            {/* SECCIÓN 1: Identidad del Taller */}
            <Seccion
              titulo="Identidad del Taller"
              icono="finger-print-outline"
              isEditing={editingIdentidad}
              guardando={guardando}
              onEdit={() => setEditingIdentidad(true)}
              onSave={() => handleGuardarSeccion(setEditingIdentidad)}
              onCancel={() => handleCancelarSeccion(setEditingIdentidad)}
            >
              <Campo
                label="Nombre comercial"
                value={empresa.nombreComercial}
                onChangeText={(t) => update("nombreComercial", t)}
                isEditing={editingIdentidad}
                placeholder="Ej. Mi Taller 3D"
              />
              <Campo
                label="NIT / RUC"
                value={empresa.nit}
                onChangeText={(t) => update("nit", t)}
                isEditing={editingIdentidad}
                keyboardType="number-pad"
                placeholder="Ej. 1029384019"
              />
            </Seccion>

            {/* SECCIÓN 2: Datos Fiscales */}
            <Seccion
              titulo="Datos Fiscales"
              icono="document-text-outline"
              isEditing={editingFiscal}
              guardando={guardando}
              onEdit={() => setEditingFiscal(true)}
              onSave={() => handleGuardarSeccion(setEditingFiscal)}
              onCancel={() => handleCancelarSeccion(setEditingFiscal)}
            >
              <Campo
                label="Razón social"
                value={empresa.razonSocial}
                onChangeText={(t) => update("razonSocial", t)}
                isEditing={editingFiscal}
                placeholder="Ej. Servicios de Impresión S.R.L."
              />
              <Campo
                label="Dirección fiscal"
                value={empresa.direccionFiscal}
                onChangeText={(t) => update("direccionFiscal", t)}
                isEditing={editingFiscal}
                placeholder="Ej. Av. Las Banderas #123"
              />
              <Campo
                label="Ciudad"
                value={empresa.ciudad}
                onChangeText={(t) => update("ciudad", t)}
                isEditing={editingFiscal}
                placeholder="Ej. Sucre"
              />
            </Seccion>

            {/* SECCIÓN 3: Contacto y Redes */}
            <Seccion
              titulo="Redes Sociales y Contacto"
              icono="share-social-outline"
              isEditing={editingContacto}
              guardando={guardando}
              onEdit={() => setEditingContacto(true)}
              onSave={() => handleGuardarSeccion(setEditingContacto)}
              onCancel={() => handleCancelarSeccion(setEditingContacto)}
            >
              <Campo
                label="WhatsApp"
                value={empresa.whatsapp}
                onChangeText={(t) => update("whatsapp", t)}
                isEditing={editingContacto}
                keyboardType="phone-pad"
                icono="logo-whatsapp"
                iconoColor="#25D366"
                placeholder="+591 70000000"
              />
              <Campo
                label="Instagram"
                value={empresa.instagram}
                onChangeText={(t) => update("instagram", t)}
                isEditing={editingContacto}
                icono="logo-instagram"
                iconoColor="#E1306C"
                placeholder="@mi.taller.3d"
              />
              <Campo
                label="Facebook"
                value={empresa.facebook}
                onChangeText={(t) => update("facebook", t)}
                isEditing={editingContacto}
                icono="logo-facebook"
                iconoColor="#1877F2"
                placeholder="facebook.com/mitaller3d"
              />
              <Campo
                label="Sitio web"
                value={empresa.sitioWeb}
                onChangeText={(t) => update("sitioWeb", t)}
                isEditing={editingContacto}
                icono="globe-outline"
                iconoColor={theme.primary}
                autoCapitalize="none"
                placeholder="https://mitaller3d.com"
              />
            </Seccion>

            {/* SECCIÓN 4: Políticas de Garantía */}
            <Seccion
              titulo="Políticas de Garantía"
              icono="shield-checkmark-outline"
              isEditing={editingGarantia}
              guardando={guardando}
              onEdit={() => setEditingGarantia(true)}
              onSave={() => handleGuardarSeccion(setEditingGarantia)}
              onCancel={() => handleCancelarSeccion(setEditingGarantia)}
            >
              {editingGarantia ? (
                <TextInput
                  style={[
                    styles.textarea,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.primary,
                      backgroundColor: theme.bgPrimary,
                    },
                  ]}
                  value={empresa.garantia}
                  onChangeText={(t) => update("garantia", t)}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholder="Describe tus términos de garantía..."
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <Text
                  style={[
                    styles.garantiaTextDisplay,
                    {
                      color: empresa.garantia
                        ? theme.textPrimary
                        : theme.textMuted,
                    },
                  ]}
                >
                  {empresa.garantia || "Sin políticas registradas."}
                </Text>
              )}
              <Text style={[styles.hint, { color: theme.textSecondary }]}>
                Este texto se adjuntará automáticamente en los reportes y
                documentos PDF.
              </Text>
            </Seccion>

            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SUBCOMPONENTES
// ---------------------------------------------------------------------------

function Seccion({
  titulo,
  icono,
  isEditing,
  guardando,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  isEditing: boolean;
  guardando: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.seccion}>
      <View style={styles.seccionHeaderRow}>
        <View style={styles.seccionTitleContainer}>
          <Ionicons name={icono} size={18} color={theme.primary} />
          <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
            {titulo}
          </Text>
        </View>

        <BotonEditar
          isEditing={isEditing}
          guardando={guardando}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
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

function BotonEditar({
  isEditing,
  guardando,
  onEdit,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  guardando: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();

  if (isEditing) {
    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onCancel}
          disabled={guardando}
          style={[styles.btnCancel, { borderColor: theme.border }]}
        >
          <Ionicons name="close-outline" size={16} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSave}
          disabled={guardando}
          style={[styles.btnSave, { backgroundColor: theme.primary }]}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={14} color="#FFF" />
              <Text style={styles.btnSaveText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onEdit}
      style={[
        styles.btnEditToggle,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <Ionicons name="pencil-outline" size={14} color={theme.primary} />
      <Text style={[styles.btnEditToggleText, { color: theme.primary }]}>
        Editar
      </Text>
    </TouchableOpacity>
  );
}

function Campo({
  label,
  value,
  onChangeText,
  isEditing,
  keyboardType,
  icono,
  iconoColor,
  autoCapitalize,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  isEditing: boolean;
  keyboardType?: "default" | "number-pad" | "phone-pad";
  icono?: keyof typeof Ionicons.glyphMap;
  iconoColor?: string;
  autoCapitalize?: "none" | "sentences";
  placeholder?: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.campo}>
      <Text style={[styles.campoLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>

      {isEditing ? (
        <View
          style={[
            styles.campoInputRow,
            {
              borderBottomColor: theme.primary,
              backgroundColor: theme.bgPrimary,
            },
          ]}
        >
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
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
          />
        </View>
      ) : (
        <View style={styles.campoReadOnlyRow}>
          {icono && (
            <Ionicons
              name={icono}
              size={16}
              color={iconoColor ?? theme.textMuted}
              style={styles.campoIcono}
            />
          )}
          <Text
            style={[
              styles.campoValueReadOnly,
              { color: value ? theme.textPrimary : theme.textMuted },
            ]}
          >
            {value || "No especificado"}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ESTILOS DE DISEÑO
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },

  // Pantalla de Carga
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },

  // Feedback de Errores
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },

  // Hero principal
  heroCard: {
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    position: "relative",
  },
  heroTopActions: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  logoWrapper: {
    marginTop: 8,
    marginBottom: 12,
  },
  logoImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  heroNombreText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  heroNombreInput: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 200,
  },
  heroSubtitulo: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  // Control de Secciones
  seccion: {
    gap: 8,
  },
  seccionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seccionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: "700",
  },
  seccionCard: {
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
  },

  // Botones de Edición / Acción
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnEditToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnEditToggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  btnSave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnSaveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  btnCancel: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Campos
  campo: {
    gap: 4,
  },
  campoLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  campoInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 8,
  },
  campoReadOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  campoIcono: {
    width: 18,
  },
  campoInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  campoValueReadOnly: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Garantías
  textarea: {
    fontSize: 13,
    lineHeight: 18,
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  garantiaTextDisplay: {
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
});
