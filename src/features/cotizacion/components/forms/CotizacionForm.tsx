// src/features/cotizacion/components/forms/CotizacionForm.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import type { ClienteResumen } from "@/features/clientes/types";
import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import { useTheme } from "@/hooks/useTheme";

export type MaterialItem = {
  id: string;
  material?: string;
  nombre?: string;
  tipo_material?: string;
  color?: string;
};

export type ReglaMargen = {
  id: string;
  nombre: string;
  margen_ganancia_pct: number;
  es_predeterminado?: boolean;
};

type CotizacionFormProps = Pick<
  UseCotizacionReturn,
  | "form"
  | "updateField"
  | "piezas"
  | "piezaActivaId"
  | "updatePiezaField"
  | "agregarPieza"
  | "eliminarPieza"
  | "seleccionarPieza"
  | "impresoras"
  | "cargandoDatos"
  | "calculando"
  | "error"
  | "calcular"
> & {
  materiales: MaterialItem[];
  clientes?: ClienteResumen[];
  reglasMargen?: ReglaMargen[];
};

// ---------------------------------------------------------------------
// HELPERS DE SANITIZACIÓN EN TIEMPO REAL (Evitan signos negativos)
// ---------------------------------------------------------------------
const sanitizeInteger = (value: string, maxVal?: number): string => {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10);
  if (maxVal !== undefined && num > maxVal) return String(maxVal);
  return String(num);
};

const sanitizeDecimal = (value: string): string => {
  let clean = value.replace(/[^0-9.]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return clean;
};

export function CotizacionForm({
  form,
  updateField,
  piezas,
  piezaActivaId,
  updatePiezaField,
  agregarPieza,
  eliminarPieza,
  seleccionarPieza,
  impresoras = [],
  materiales = [],
  cargandoDatos,
  calculando,
  error,
  calcular,
  clientes = [],
  reglasMargen = [],
}: CotizacionFormProps) {
  const { theme } = useTheme();

  const piezaActiva = piezas.find((p) => p.id === piezaActivaId) ?? piezas[0];

  const [esPersonalizado, setEsPersonalizado] = useState<boolean>(
    () => Number(form.precio_personalizacion) > 0,
  );
  const [imagenUri, setImagenUri] = useState<string | null>(
    form.imagen_referencia || null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if ((!form.regla_margen_id || !form.margen_ganancia_pct) && reglasMargen.length > 0) {
      const reglaDefault =
        reglasMargen.find((r) => r.es_predeterminado) || reglasMargen[0];
      if (reglaDefault) {
        updateField("margen_ganancia_pct", String(reglaDefault.margen_ganancia_pct));
        updateField("regla_margen_id", reglaDefault.id);
      }
    }
  }, [reglasMargen, form.regla_margen_id, form.margen_ganancia_pct]);

  // ---------------------------------------------------------------------
  // VALIDACIÓN ESTRUCTURADA ANTES DE EJECUTAR CÁLCULOS
  // ---------------------------------------------------------------------
  const validarFormulario = (): string | null => {
    if (form.telefono_cliente && form.telefono_cliente.trim().length > 0) {
      const phoneDigits = form.telefono_cliente.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        return "El teléfono de WhatsApp debe tener un número válido (mínimo 7 dígitos).";
      }
    }

    for (let i = 0; i < piezas.length; i++) {
      const p = piezas[i];
      const nombrePieza = p.nombre_pieza ? `"${p.nombre_pieza}"` : `Pieza ${i + 1}`;

      const peso = parseFloat(p.peso_gramos || "0");
      if (isNaN(peso) || peso <= 0) {
        return `El peso en gramos para ${nombrePieza} debe ser mayor a 0.`;
      }

      const cantidad = parseInt(p.cantidad || "0", 10);
      if (isNaN(cantidad) || cantidad <= 0) {
        return `La cantidad de unidades para ${nombrePieza} debe ser al menos 1.`;
      }

      const mins = parseInt(p.tiempo_impresion_minutos || "0", 10);
      if (isNaN(mins) || mins < 0 || mins >= 60) {
        return `Los minutos de impresión para ${nombrePieza} deben estar entre 0 y 59.`;
      }

      const horas = parseInt(p.tiempo_impresion_horas || "0", 10);
      if ((isNaN(horas) || horas === 0) && mins === 0) {
        return `Ingresa un tiempo de impresión válido para ${nombrePieza}.`;
      }
    }

    const riesgo = parseFloat(form.porcentaje_riesgo || "0");
    if (isNaN(riesgo) || riesgo < 0 || riesgo > 99) {
      return "El porcentaje de riesgo debe estar entre 0% y 99% (máximo 2 dígitos).";
    }

    if (esPersonalizado) {
      const precioPers = parseFloat(form.precio_personalizacion || "0");
      if (isNaN(precioPers) || precioPers < 0) {
        return "El costo de personalización no puede ser negativo.";
      }
    }

    return null;
  };

  // Auto-cálculo con debounce con guardián de validación
  useEffect(() => {
    const timer = setTimeout(() => {
      const errorEncontrado = validarFormulario();
      setValidationError(errorEncontrado);

      if (!errorEncontrado) {
        calcular();
      }
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.nombre_cliente,
    form.telefono_cliente,
    form.filamento_id,
    form.impresora_id,
    form.porcentaje_riesgo,
    form.precio_personalizacion,
    form.margen_ganancia_pct,
    form.regla_margen_id,
    form.tiempo_preparacion_minutos,
    form.tiempo_postprocesado_minutos,
    esPersonalizado,
    JSON.stringify(piezas),
  ]);

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setImagenUri(uri);
      updateField("imagen_referencia", uri);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.mutedText, { color: theme.textSecondary }]}>
          Cargando impresoras y materiales...
        </Text>
      </View>
    );
  }

  const activeError = validationError || error;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bgPrimary }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRealtime}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={22} color={theme.primary} />
          <Text style={[styles.mainSectionTitle, { color: theme.textPrimary }]}>
            Parámetros de Cotización
          </Text>
        </View>
        {calculando && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {/* 1. DATOS DEL CLIENTE */}
      <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>
        Información del Cliente
      </Text>

      {clientes.length > 0 && (
        <View style={styles.chipsRow}>
          {clientes.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => {
                updateField("cliente_id", c.id);
                updateField("nombre_cliente", c.nombre);
                if (c.telefono) updateField("telefono_cliente", c.telefono);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    form.cliente_id === c.id ? theme.primary : theme.bgSurface,
                  borderColor:
                    form.cliente_id === c.id ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      form.cliente_id === c.id ? "#FFFFFF" : theme.textPrimary,
                  },
                ]}
              >
                {c.nombre}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.flex1}>
          <View style={styles.labelGroup}>
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Nombre / Razón Social
            </Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={theme.textMuted}
              value={form.nombre_cliente}
              onChangeText={(v) => updateField("nombre_cliente", v)}
            />
          </View>
        </View>

        <View style={[styles.flex1, styles.ml8]}>
          <View style={styles.labelGroup}>
            <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Teléfono (WhatsApp)
            </Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Ej. 71234567"
              placeholderTextColor={theme.textMuted}
              value={form.telefono_cliente}
              onChangeText={(v) => updateField("telefono_cliente", sanitizeInteger(v, 9999999999915))}
              keyboardType="number-pad"
              maxLength={15}
            />
          </View>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* 2. SELECCIÓN DE MATERIAL - MEJORADO */}
      <View style={styles.labelGroup}>
        <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Material</Text>
      </View>
      
      {materiales.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            { 
              backgroundColor: theme.bgSurface, 
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.emptyStateIconContainer}>
            <View style={[styles.emptyStateIconWrapper, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="cube-outline" size={32} color={theme.primary} />
            </View>
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
            Sin materiales disponibles
          </Text>
          <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
            No hay materiales activos en el catálogo. 
            Para cotizar, primero debes registrar materiales en el sistema.
          </Text>
          <View style={[styles.emptyStateAction, { borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
            <Text style={[styles.emptyStateActionText, { color: theme.textMuted }]}>
              Contacta al administrador
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.chipsRow}>
          {materiales.map((mat) => {
            const selected = form.filamento_id === mat.id;
            const nombreMaterial =
              mat.material ?? mat.nombre ?? mat.tipo_material ?? "Material";
            return (
              <Pressable
                key={mat.id}
                onPress={() => updateField("filamento_id", mat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.primary : theme.bgSurface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={selected ? "#FFFFFF" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: selected ? "700" : "500",
                    },
                  ]}
                >
                  {nombreMaterial} {mat.color ? `- ${mat.color}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 3. CARD: DATOS POR PIEZA (multi-pieza) */}
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.labelGroupNoMargin}>
            <Ionicons name="shapes-outline" size={18} color={theme.primary} />
            <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>
              Datos por pieza
            </Text>
          </View>
          <Pressable
            style={[styles.addPiezaBtn, { backgroundColor: theme.primary }]}
            onPress={agregarPieza}
          >
            <Ionicons name="add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addPiezaBtnText}>Otra pieza</Text>
          </Pressable>
        </View>

        {/* Pestañas de Piezas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}
        >
          {piezas.map((item, index) => {
            const isSelected = item.id === piezaActivaId;
            return (
              <Pressable
                key={item.id}
                onPress={() => seleccionarPieza(item.id)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.bgPrimary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: isSelected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {item.nombre_pieza ? item.nombre_pieza : `Pieza ${index + 1}`}
                </Text>
                {piezas.length > 1 && (
                  <Pressable
                    onPress={() => eliminarPieza(item.id)}
                    hitSlop={8}
                    style={styles.closeTabBtn}
                  >
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={isSelected ? "#FFFFFF" : theme.danger}
                    />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Campos dinámicos según la pieza activa */}
        {piezaActiva && (
          <View style={styles.cardContent}>
            <View style={styles.labelGroup}>
              <Ionicons name="pricetag-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Nombre de la Pieza / Modelo
              </Text>
            </View>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.bgPrimary, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.inputField, { color: theme.textPrimary }]}
                placeholder="Ej. Soporte para Headset / Engranaje M4"
                placeholderTextColor={theme.textMuted}
                value={piezaActiva.nombre_pieza}
                onChangeText={(v) =>
                  updatePiezaField(piezaActiva.id, "nombre_pieza", v)
                }
              />
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <View style={styles.labelGroup}>
                  <Ionicons name="scale-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Peso por pieza
                  </Text>
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.bgPrimary, borderColor: theme.border },
                  ]}
                >
                  <TextInput
                    style={[styles.inputField, { color: theme.textPrimary }]}
                    placeholder="Ej. 120"
                    placeholderTextColor={theme.textMuted}
                    value={piezaActiva.peso_gramos}
                    onChangeText={(v) =>
                      updatePiezaField(piezaActiva.id, "peso_gramos", sanitizeDecimal(v))
                    }
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>g</Text>
                </View>
              </View>

              <View style={[styles.flex1, styles.ml8]}>
                <View style={styles.labelGroup}>
                  <Ionicons name="layers-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Cantidad
                  </Text>
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.bgPrimary, borderColor: theme.border },
                  ]}
                >
                  <TextInput
                    style={[styles.inputField, { color: theme.textPrimary }]}
                    placeholder="Ej. 1"
                    placeholderTextColor={theme.textMuted}
                    value={piezaActiva.cantidad}
                    onChangeText={(v) =>
                      updatePiezaField(piezaActiva.id, "cantidad", sanitizeInteger(v))
                    }
                    keyboardType="number-pad"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>
                    uds
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.labelGroup}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Tiempo de impresión por pieza
              </Text>
            </View>
            <View style={styles.row}>
              <View
                style={[
                  styles.inputContainer,
                  styles.flex1,
                  { backgroundColor: theme.bgPrimary, borderColor: theme.border },
                ]}
              >
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  placeholder="Horas"
                  placeholderTextColor={theme.textMuted}
                  value={piezaActiva.tiempo_impresion_horas}
                  onChangeText={(v) =>
                    updatePiezaField(
                      piezaActiva.id,
                      "tiempo_impresion_horas",
                      sanitizeInteger(v)
                    )
                  }
                  keyboardType="number-pad"
                />
                <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>hrs</Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  styles.flex1,
                  styles.ml8,
                  { backgroundColor: theme.bgPrimary, borderColor: theme.border },
                ]}
              >
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  placeholder="Minutos (0-59)"
                  placeholderTextColor={theme.textMuted}
                  value={piezaActiva.tiempo_impresion_minutos}
                  onChangeText={(v) =>
                    updatePiezaField(
                      piezaActiva.id,
                      "tiempo_impresion_minutos",
                      sanitizeInteger(v, 59)
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>min</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 4. SELECCIÓN DE IMPRESORA - MEJORADO */}
      <View style={styles.labelGroup}>
        <Ionicons name="hardware-chip-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Impresora</Text>
      </View>
      
      {impresoras.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            { 
              backgroundColor: theme.bgSurface, 
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.emptyStateIconContainer}>
            <View style={[styles.emptyStateIconWrapper, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="printer-outline" size={32} color={theme.primary} />
            </View>
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
            Sin impresoras registradas
          </Text>
          <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
            No hay impresoras activas en el sistema.
            Configura al menos una impresora para poder cotizar.
          </Text>
          <View style={[styles.emptyStateAction, { borderColor: theme.border }]}>
            <Ionicons name="construct-outline" size={18} color={theme.primary} />
            <Text style={[styles.emptyStateActionText, { color: theme.textMuted }]}>
              Configuración necesaria
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.chipsRow}>
          {impresoras.map((imp) => {
            const selected = form.impresora_id === imp.id;
            const marca = imp.marca ?? "";
            const modelo = imp.modelo ?? "Impresora";
            return (
              <Pressable
                key={imp.id}
                onPress={() => updateField("impresora_id", imp.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.primary : theme.bgSurface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={selected ? "#FFFFFF" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: selected ? "700" : "500",
                    },
                  ]}
                >
                  {marca} {modelo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 5. RIESGO DE IMPRESIÓN (%) */}
      <View style={styles.labelGroup}>
        <Ionicons name="warning-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Riesgo de fallo / fallo de impresión (0-99%)
        </Text>
      </View>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <TextInput
          style={[styles.inputField, { color: theme.textPrimary }]}
          placeholder="Ej. 10"
          placeholderTextColor={theme.textMuted}
          value={form.porcentaje_riesgo}
          onChangeText={(v) => updateField("porcentaje_riesgo", sanitizeInteger(v, 99))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>%</Text>
      </View>

      {/* 6. UTILIDAD (MARGEN DE GANANCIA) - MEJORADO */}
      <View style={styles.labelGroup}>
        <Ionicons name="trending-up-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Utilidad (Margen de ganancia)
        </Text>
      </View>
      
      {reglasMargen.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            { 
              backgroundColor: theme.bgSurface, 
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.emptyStateIconContainer}>
            <View style={[styles.emptyStateIconWrapper, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="percent-outline" size={32} color={theme.primary} />
            </View>
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
            Sin reglas de margen
          </Text>
          <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
            No hay reglas de margen de ganancia configuradas.
            Es necesario definir las reglas para calcular la utilidad.
          </Text>
          <View style={[styles.emptyStateAction, { borderColor: theme.border }]}>
            <Ionicons name="settings-outline" size={18} color={theme.primary} />
            <Text style={[styles.emptyStateActionText, { color: theme.textMuted }]}>
              Configurar en ajustes
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.chipsRow}>
          {reglasMargen.map((regla) => {
            const isSelected =
              form.regla_margen_id === regla.id ||
              (!form.regla_margen_id &&
                Number(form.margen_ganancia_pct) === regla.margen_ganancia_pct);

            return (
              <Pressable
                key={regla.id}
                onPress={() => {
                  updateField("margen_ganancia_pct", String(regla.margen_ganancia_pct));
                  updateField("regla_margen_id", regla.id);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.bgSurface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={isSelected ? "#FFFFFF" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? "#FFFFFF" : theme.textPrimary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {regla.nombre} ({regla.margen_ganancia_pct}%)
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 7. TRABAJO DE PERSONALIZACIÓN */}
      <View
        style={[
          styles.switchCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <View style={styles.switchRow}>
          <View style={styles.labelGroupNoMargin}>
            <Ionicons name="brush-outline" size={18} color={theme.textPrimary} />
            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
              Trabajo de Personalización / Acabado
            </Text>
          </View>
          <Switch
            value={esPersonalizado}
            onValueChange={(val) => {
              setEsPersonalizado(val);
              if (!val) updateField("precio_personalizacion", "0");
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        {esPersonalizado && (
          <View
            style={[
              styles.inputContainer,
              styles.mt8,
              { backgroundColor: theme.bgPrimary, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.inputField, { color: theme.textPrimary }]}
              placeholder="Costo adicional por modelado o post-procesado"
              placeholderTextColor={theme.textMuted}
              value={form.precio_personalizacion}
              onChangeText={(v) => updateField("precio_personalizacion", sanitizeDecimal(v))}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>Bs</Text>
          </View>
        )}
      </View>

      {/* 8. IMAGEN DE REFERENCIA */}
      <View style={styles.labelGroup}>
        <Ionicons name="image-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Imagen de referencia
        </Text>
      </View>
      <Pressable
        style={[
          styles.imagePickerButton,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
        onPress={seleccionarImagen}
      >
        <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
        <Text style={[styles.imagePickerText, { color: theme.textSecondary }]}>
          {imagenUri ? "Cambiar imagen de la pieza" : "Subir foto o render de la pieza"}
        </Text>
      </Pressable>
      {imagenUri && (
        <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
      )}

      {/* MOSTRAR ERRORES Y ADVERTENCIAS AL USUARIO */}
      {Boolean(activeError) && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {activeError}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  headerRealtime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  mainSectionTitle: { fontSize: 18, fontWeight: "700" },
  subSectionTitle: { fontSize: 15, fontWeight: "700", marginVertical: 4 },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginVertical: 14,
  },
  mutedText: { marginTop: 8, fontSize: 14 },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  labelGroupNoMargin: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputField: { flex: 1, paddingVertical: 10, fontSize: 14 },
  unitBadge: { fontSize: 13, fontWeight: "700", marginLeft: 6, opacity: 0.8 },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  ml8: { marginLeft: 8 },
  mt8: { marginTop: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  switchCard: { borderRadius: 10, padding: 12, marginTop: 16, borderWidth: 1 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  imagePickerButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  imagePickerText: { fontSize: 13, fontWeight: "500" },
  imagePreview: { width: "100%", height: 160, borderRadius: 8, marginTop: 10 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: { fontSize: 13, fontWeight: "500" },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addPiezaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addPiezaBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  tabsScrollView: { marginVertical: 6 },
  tabsContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: { fontSize: 12 },
  closeTabBtn: { padding: 2 },
  cardContent: { marginTop: 6 },
  // Nuevos estilos para los mensajes de vacío mejorados
  emptyStateCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
  },
  emptyStateIconContainer: {
    marginBottom: 12,
  },
  emptyStateIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  emptyStateAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  emptyStateActionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});