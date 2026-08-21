// src/components/ui/ParametrosDrawer.tsx
import { drawerWidth, radii, spacing } from "@/constants/theme";
import { ThemeContext } from "@/context/ThemeContext";
import { MonedaCodigo } from "@/features/parametros/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ParametroCampoNumero,
  ParametroCampoSwitch,
  ParametroCampoTexto,
} from "./ParametroCampo";

// Interfaz fuertemente tipada para las secciones colapsables
interface DrawerSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  abierto: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function DrawerSection({
  icon,
  titulo,
  abierto,
  onToggle,
  children,
}: DrawerSectionProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.sectionContainer,
        {
          backgroundColor: theme.bgSurface,
          borderColor: theme.border,
        },
      ]}
    >
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderTitleRow}>
          <Ionicons name={icon} size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {titulo}
          </Text>
        </View>
        <Ionicons
          name={abierto ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.textMuted}
        />
      </Pressable>
      {abierto && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

interface RangoUtilidad {
  id: string;
  minimo: number;
  maximo: number;
  porcentaje: number;
}

interface ImpresoraDepreciacion {
  id: string;
  nombre: string;
  costo: number;
  horasImpresas: number;
  vidaUtilHoras: number;
}

interface ParametrosDrawerProps {
  visible: boolean;
  onClose: () => void;
  userId?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ANCHO_DRAWER = Math.min(drawerWidth, SCREEN_WIDTH * 0.86);

// Datos estáticos iniciales
const PARAMETROS_ESTATICOS_INICIALES = {
  tarifas: {
    monedaPrincipal: "BOB" as MonedaCodigo,
    tarifaElectricaKwh: 0.8,
    rangosUtilidad: [
      { id: "1", minimo: 1, maximo: 19, porcentaje: 80 },
    ] as RangoUtilidad[],
  },
  manoObra: {
    tiempoInvertidoMinutos: 90, // 'a' en minutos (1.5 horas = 90 min)
    sueldoMensual: 3500, // 'b' en Bs
  },
  impresoras: [
    {
      id: "1",
      nombre: "Ender 3 V2",
      costo: 2200,
      horasImpresas: 650,
      vidaUtilHoras: 2500,
    },
    {
      id: "2",
      nombre: "Bambu Lab P1S",
      costo: 6800,
      horasImpresas: 1200,
      vidaUtilHoras: 5000,
    },
  ] as ImpresoraDepreciacion[],
  envio: {
    recogidaLocal: 0,
    envioLocalDelivery: 15,
    envioNacionalCourier: 35,
  },
  pdf: {
    encabezadoPdf: "Taller 3D Sucre",
    piePaginaPdf: "Gracias por su preferencia. Cotización válida por 15 días.",
    mostrarDesgloseTecnicoCliente: false,
    diasValidezCotizacion: 15,
  },
  respaldo: {
    backupNubeActivo: true,
  },
};

export function ParametrosDrawer({ visible, onClose }: ParametrosDrawerProps) {
  const { theme } = useContext(ThemeContext);
  const translateX = useRef(new Animated.Value(ANCHO_DRAWER)).current;

  // Estado para gestionar acordeones abiertos
  const [seccionAbierta, setSeccionAbierta] = useState<number | null>(1);

  // Estado local con datos estáticos de parámetros
  const [parametros, setParametros] = useState(PARAMETROS_ESTATICOS_INICIALES);

  // Estados para formulario de nueva utilidad por rango
  const [mostrandoFormUtilidad, setMostrandoFormUtilidad] = useState(false);
  const [nuevoMinimo, setNuevoMinimo] = useState(1);
  const [nuevoMaximo, setNuevoMaximo] = useState(10);
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState(50);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : ANCHO_DRAWER,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateX]);

  // Actualizador genérico
  const actualizarSeccion = <
    K extends keyof typeof PARAMETROS_ESTATICOS_INICIALES,
  >(
    seccion: K,
    cambios: Partial<(typeof PARAMETROS_ESTATICOS_INICIALES)[K]>,
  ) => {
    setParametros((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        ...cambios,
      },
    }));
  };

  // Manejo de rangos de utilidad
  const handleAgregarUtilidad = () => {
    const nuevaUtilidad: RangoUtilidad = {
      id: Date.now().toString(),
      minimo: nuevoMinimo,
      maximo: nuevoMaximo,
      porcentaje: nuevoPorcentaje,
    };

    const listaActual = parametros.tarifas.rangosUtilidad ?? [];
    actualizarSeccion("tarifas", {
      rangosUtilidad: [...listaActual, nuevaUtilidad],
    });

    setMostrandoFormUtilidad(false);
  };

  const handleEliminarUtilidad = (id: string) => {
    const listaActual = parametros.tarifas.rangosUtilidad ?? [];
    actualizarSeccion("tarifas", {
      rangosUtilidad: listaActual.filter((item) => item.id !== id),
    });
  };

  // --- CÁLCULO DE MANO DE OBRA CON LAS FÓRMULAS EXACTAS SOLICITADAS ---
  // a = Tiempo dedicación para cada impresión (min)
  // b = Sueldo mensual (Bs)
  // c = Precio Bs/hora = b * (1 / 160)
  // d = Precio mano de obra por impresión = c * a * (1 / 60)
  const HORAS_LABORALES_MES = 160;
  const a = parametros?.manoObra?.tiempoInvertidoMinutos ?? 0;
  const b = parametros?.manoObra?.sueldoMensual ?? 0;

  const c = b > 0 ? b / HORAS_LABORALES_MES : 0; // Costo en Bs/hora
  const d = c * a * (1 / 60); // Costo en Bs por impresión
  const precioManoObraPorImpresion = d.toFixed(2);

  const handleGuardar = () => {
    onClose();
  };

  const toggleSeccion = (id: number) => {
    setSeccionAbierta((prev) => (prev === id ? null : id));
  };

  const listaImpresoras = parametros?.impresoras ?? [];
  const listaUtilidades = parametros?.tarifas?.rangosUtilidad ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        <Pressable
          style={[
            styles.overlay,
            { backgroundColor: theme.modalOverlay ?? "rgba(0,0,0,0.5)" },
          ]}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              width: ANCHO_DRAWER,
              backgroundColor: theme.bgPrimary,
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Encabezado */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              ⚙️ Configuración de Cotización y Taller
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Sección 1: Tarifas y Moneda Base */}
            <DrawerSection
              icon="cash-outline"
              titulo="1. Tarifas y Moneda Base"
              abierto={seccionAbierta === 1}
              onToggle={() => toggleSeccion(1)}
            >
              <MonedaSelector
                value={parametros?.tarifas?.monedaPrincipal ?? "BOB"}
                onChange={(monedaPrincipal) =>
                  actualizarSeccion("tarifas", { monedaPrincipal })
                }
              />

              <ParametroCampoNumero
                label="Tarifa Eléctrica"
                value={parametros?.tarifas?.tarifaElectricaKwh ?? 0}
                onChange={(tarifaElectricaKwh) =>
                  actualizarSeccion("tarifas", { tarifaElectricaKwh })
                }
                sufijo="/kWh"
              />

              {/* CARD DE UTILIDADES POR RANGO */}
              <View
                style={[
                  styles.cardImpresora,
                  {
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.cardHeaderRowBetween}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons
                      name="trending-up-outline"
                      size={18}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.cardTitle, { color: theme.textPrimary }]}
                    >
                      Rangos de Utilidad
                    </Text>
                  </View>
                  <Pressable
                    style={[
                      styles.btnNuevaUtilidad,
                      { backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() =>
                      setMostrandoFormUtilidad(!mostrandoFormUtilidad)
                    }
                  >
                    <Ionicons
                      name={mostrandoFormUtilidad ? "close" : "add"}
                      size={14}
                      color={theme.primary}
                    />
                    <Text
                      style={[
                        styles.btnNuevaUtilidadTexto,
                        { color: theme.primary },
                      ]}
                    >
                      {mostrandoFormUtilidad ? "Cancelar" : "+ Nueva utilidad"}
                    </Text>
                  </Pressable>
                </View>

                {/* Formulario desplegable para agregar nueva utilidad */}
                {mostrandoFormUtilidad && (
                  <View
                    style={[
                      styles.formUtilidadContainer,
                      {
                        backgroundColor: theme.bgSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formUtilidadTitle,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Definir Escala por Volumen
                    </Text>

                    {/* Fila de Mínimo y Máximo */}
                    <View style={styles.rowMinMax}>
                      <View style={styles.colMinMax}>
                        <ParametroCampoNumero
                          label="Mínimo (unid)"
                          value={nuevoMinimo}
                          onChange={(val) => setNuevoMinimo(val)}
                        />
                      </View>
                      <View style={styles.colMinMax}>
                        <ParametroCampoNumero
                          label="Máximo (unid)"
                          value={nuevoMaximo}
                          onChange={(val) => setNuevoMaximo(val)}
                        />
                      </View>
                    </View>

                    {/* Porcentaje debajo de Min/Max */}
                    <ParametroCampoNumero
                      label="Porcentaje de Utilidad"
                      value={nuevoPorcentaje}
                      onChange={(val) => setNuevoPorcentaje(val)}
                      sufijo="%"
                    />

                    <Pressable
                      style={[
                        styles.btnGuardarUtilidad,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={handleAgregarUtilidad}
                    >
                      <Text
                        style={[
                          styles.btnGuardarUtilidadTexto,
                          { color: theme.textPrimary },
                        ]}
                      >
                        Confirmar Rango
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Visualización de Cards con la información de utilidad guardada */}
                <View style={styles.utilidadesList}>
                  {listaUtilidades.length === 0 ? (
                    <Text
                      style={[styles.emptyTexto, { color: theme.textMuted }]}
                    >
                      No hay rangos configurados.
                    </Text>
                  ) : (
                    listaUtilidades.map((u) => (
                      <View
                        key={u.id}
                        style={[
                          styles.itemUtilidadCard,
                          {
                            backgroundColor: theme.bgSecondary,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <View style={styles.itemUtilidadInfo}>
                          <Text
                            style={[
                              styles.itemUtilidadPorcentaje,
                              { color: theme.primary },
                            ]}
                          >
                            Utilidad de {u.porcentaje}%
                          </Text>
                          <View
                            style={[
                              styles.badgeRango,
                              { backgroundColor: theme.bgSurface },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeRangoText,
                                { color: theme.textMuted },
                              ]}
                            >
                              Rango: {u.minimo} - {u.maximo} unid.
                            </Text>
                          </View>
                        </View>
                        <Pressable
                          onPress={() => handleEliminarUtilidad(u.id)}
                          hitSlop={8}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#e53e3e"
                          />
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Card descriptivo de Impresora y Potencia */}
              <View
                style={[
                  styles.cardImpresora,
                  {
                    backgroundColor: theme.bgSurface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={18}
                    color={theme.primary}
                  />
                  <Text
                    style={[styles.cardTitle, { color: theme.textPrimary }]}
                  >
                    Especificaciones de Máquina
                  </Text>
                </View>
                <View style={styles.cardContentRow}>
                  <View style={styles.cardCol}>
                    <Text
                      style={[styles.cardLabel, { color: theme.textMuted }]}
                    >
                      Impresora Activa
                    </Text>
                    <Text
                      style={[styles.cardVal, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      Ender 3 V2 (Estático)
                    </Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardCol}>
                    <Text
                      style={[styles.cardLabel, { color: theme.textMuted }]}
                    >
                      Potencia Estimada
                    </Text>
                    <Text style={[styles.cardVal, { color: theme.primary }]}>
                      350 W
                    </Text>
                  </View>
                </View>
              </View>
            </DrawerSection>

            {/* Sección 2: Costos de Mano de Obra */}
            <DrawerSection
              icon="hammer-outline"
              titulo="2. Costos de Mano de Obra"
              abierto={seccionAbierta === 2}
              onToggle={() => toggleSeccion(2)}
            >
              <ParametroCampoNumero
                label="Tiempo dedicación por impresión (a)"
                value={parametros?.manoObra?.tiempoInvertidoMinutos ?? 0}
                onChange={(tiempoInvertidoMinutos) =>
                  actualizarSeccion("manoObra", { tiempoInvertidoMinutos })
                }
                sufijo="min"
              />

              <ParametroCampoNumero
                label="Sueldo Mensual (b)"
                value={parametros?.manoObra?.sueldoMensual ?? 0}
                onChange={(sueldoMensual) =>
                  actualizarSeccion("manoObra", { sueldoMensual })
                }
                sufijo={parametros?.tarifas?.monedaPrincipal ?? "BOB"}
              />

              {/* Cálculo automático de Mano de Obra usando las fórmulas solicitadas */}
              <View
                style={[
                  styles.readOnlyContainer,
                  {
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[styles.readOnlyLabel, { color: theme.textMuted }]}
                >
                  Costo Hora c(Bs/h) = b / 160h = {c.toFixed(2)}{" "}
                  {parametros?.tarifas?.monedaPrincipal ?? "BOB"}/h
                </Text>
                <Text
                  style={[
                    styles.readOnlyLabel,
                    { color: theme.textMuted, marginTop: 2 },
                  ]}
                >
                  Precio Mano de Obra d(Bs) = c * a * (1/60)
                </Text>

                <View style={styles.readOnlyValueRow}>
                  <Text
                    style={[styles.readOnlyValueText, { color: theme.primary }]}
                  >
                    {precioManoObraPorImpresion}{" "}
                    <Text style={styles.readOnlyCurrency}>
                      {parametros?.tarifas?.monedaPrincipal ?? "BOB"}
                    </Text>
                  </Text>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={theme.textMuted}
                  />
                </View>
              </View>
            </DrawerSection>

            {/* Sección 3: Depreciación y Mantenimiento */}
            <DrawerSection
              icon="print-outline"
              titulo="3. Depreciación y Mantenimiento"
              abierto={seccionAbierta === 3}
              onToggle={() => toggleSeccion(3)}
            >
              {listaImpresoras.map((impresora) => {
                const horasRestantes = Math.max(
                  0,
                  (impresora.vidaUtilHoras || 0) -
                    (impresora.horasImpresas || 0),
                );

                return (
                  <View
                    key={impresora.id}
                    style={[
                      styles.cardDepreciacionImpresora,
                      {
                        backgroundColor: theme.bgSurface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.cardDepHeader}>
                      <View style={styles.impresoraNombreRow}>
                        <Ionicons
                          name="print"
                          size={16}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.impresoraNombreText,
                            { color: theme.textPrimary },
                          ]}
                        >
                          {impresora.nombre}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.miniCardCosto,
                          {
                            backgroundColor: theme.bgSecondary,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniCardCostoLabel,
                            { color: theme.textMuted },
                          ]}
                        >
                          Costo
                        </Text>
                        <Text
                          style={[
                            styles.miniCardCostoValue,
                            { color: theme.primary },
                          ]}
                        >
                          {impresora.costo}{" "}
                          {parametros?.tarifas?.monedaPrincipal ?? "BOB"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.horasDetalleContainer,
                        { borderTopColor: theme.border },
                      ]}
                    >
                      <View style={styles.horasCol}>
                        <Text
                          style={[styles.cardLabel, { color: theme.textMuted }]}
                        >
                          Uso Actual / Vida Útil
                        </Text>
                        <Text
                          style={[
                            styles.horasRatioText,
                            { color: theme.textPrimary },
                          ]}
                        >
                          {impresora.horasImpresas} h /{" "}
                          {impresora.vidaUtilHoras} h
                        </Text>
                      </View>

                      <View style={styles.horasColRight}>
                        <Text
                          style={[styles.cardLabel, { color: theme.textMuted }]}
                        >
                          Horas Restantes
                        </Text>
                        <Text
                          style={[
                            styles.horasRestantesText,
                            {
                              color:
                                horasRestantes < 300
                                  ? "#e53e3e"
                                  : theme.primary,
                            },
                          ]}
                        >
                          {horasRestantes} h
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </DrawerSection>

            {/* Sección 4: Costos y Métodos de Envío */}
            <DrawerSection
              icon="cube-outline"
              titulo="4. Costos y Métodos de Envío"
              abierto={seccionAbierta === 4}
              onToggle={() => toggleSeccion(4)}
            >
              <ParametroCampoNumero
                label="Recogida en Local"
                value={parametros?.envio?.recogidaLocal ?? 0}
                onChange={(recogidaLocal) =>
                  actualizarSeccion("envio", { recogidaLocal })
                }
              />
              <ParametroCampoNumero
                label="Envíos Locales / Delivery"
                value={parametros?.envio?.envioLocalDelivery ?? 0}
                onChange={(envioLocalDelivery) =>
                  actualizarSeccion("envio", { envioLocalDelivery })
                }
              />
              <ParametroCampoNumero
                label="Envíos Nacionales / Courier"
                value={parametros?.envio?.envioNacionalCourier ?? 0}
                onChange={(envioNacionalCourier) =>
                  actualizarSeccion("envio", { envioNacionalCourier })
                }
              />
            </DrawerSection>

            {/* Sección 5: Personalización de PDF y Cotización */}
            <DrawerSection
              icon="document-text-outline"
              titulo="5. Personalización de PDF y Cotización"
              abierto={seccionAbierta === 5}
              onToggle={() => toggleSeccion(5)}
            >
              <ParametroCampoTexto
                label="Encabezado en PDF"
                value={parametros?.pdf?.encabezadoPdf ?? ""}
                onChange={(encabezadoPdf) =>
                  actualizarSeccion("pdf", { encabezadoPdf })
                }
                placeholder="Ej: Taller 3D Sucre"
              />
              <ParametroCampoTexto
                label="Pie de Página en PDF"
                value={parametros?.pdf?.piePaginaPdf ?? ""}
                onChange={(piePaginaPdf) =>
                  actualizarSeccion("pdf", { piePaginaPdf })
                }
                placeholder="Ej: Gracias por su preferencia"
                multiline
              />
              <ParametroCampoSwitch
                label="Mostrar Desglose Técnico al Cliente"
                value={parametros?.pdf?.mostrarDesgloseTecnicoCliente ?? false}
                onChange={(mostrarDesgloseTecnicoCliente) =>
                  actualizarSeccion("pdf", {
                    mostrarDesgloseTecnicoCliente,
                  })
                }
              />
              <ParametroCampoNumero
                label="Días de Validez de la Cotización"
                value={parametros?.pdf?.diasValidezCotizacion ?? 15}
                onChange={(diasValidezCotizacion) =>
                  actualizarSeccion("pdf", { diasValidezCotizacion })
                }
                sufijo="días"
                keyboardType="numeric"
              />
            </DrawerSection>

            {/* Sección 6: Respaldo y Exportación */}
            <DrawerSection
              icon="cloud-upload-outline"
              titulo="6. Respaldo y Exportación"
              abierto={seccionAbierta === 6}
              onToggle={() => toggleSeccion(6)}
            >
              <ParametroCampoSwitch
                label="Copia de Seguridad en la Nube"
                value={parametros?.respaldo?.backupNubeActivo ?? true}
                onChange={(backupNubeActivo) =>
                  actualizarSeccion("respaldo", { backupNubeActivo })
                }
              />
              <Text style={[styles.hintTexto, { color: theme.textMuted }]}>
                Exportar registros (CSV / Excel) disponible desde la pantalla de
                Comprobantes.
              </Text>
            </DrawerSection>
          </ScrollView>

          {/* Pie de página con botones */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable
              style={[styles.boton, { backgroundColor: theme.bgSecondary }]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.botonSecundarioTexto,
                  { color: theme.textMuted },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.boton, { backgroundColor: theme.primary }]}
              onPress={handleGuardar}
            >
              <Text
                style={[
                  styles.botonPrimarioTexto,
                  { color: theme.textPrimary },
                ]}
              >
                Guardar cambios
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MonedaSelector({
  value,
  onChange,
}: {
  value: MonedaCodigo;
  onChange: (moneda: MonedaCodigo) => void;
}) {
  const { theme } = useContext(ThemeContext);
  const opciones: MonedaCodigo[] = ["BOB", "USD", "EUR"];

  return (
    <View style={styles.monedaRow}>
      {opciones.map((opcion) => {
        const activo = opcion === value;
        return (
          <Pressable
            key={opcion}
            onPress={() => onChange(opcion)}
            style={[
              styles.monedaChip,
              {
                backgroundColor: activo ? theme.primaryLight : theme.bgSurface,
                borderColor: activo ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.monedaChipTexto,
                { color: activo ? theme.primary : theme.textMuted },
              ]}
            >
              {opcion}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    height: "100%",
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  sectionContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm + 2,
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionBody: {
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    gap: spacing.xs,
  },
  cardImpresora: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    gap: spacing.xs + 2,
  },
  cardHeaderRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCol: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardVal: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 1,
  },
  cardDivider: {
    width: StyleSheet.hairlineWidth,
    height: "80%",
    backgroundColor: "rgba(150,150,150,0.3)",
    marginHorizontal: spacing.xs,
  },
  /* RANGOS DE UTILIDAD STYLES */
  btnNuevaUtilidad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 2,
  },
  btnNuevaUtilidadTexto: {
    fontSize: 11,
    fontWeight: "700",
  },
  formUtilidadContainer: {
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  formUtilidadTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  rowMinMax: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  colMinMax: {
    flex: 1,
  },
  btnGuardarUtilidad: {
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: 2,
  },
  btnGuardarUtilidadTexto: {
    fontSize: 12,
    fontWeight: "700",
  },
  utilidadesList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  emptyTexto: {
    fontSize: 11,
    fontStyle: "italic",
  },
  itemUtilidadCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  itemUtilidadInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemUtilidadPorcentaje: {
    fontSize: 13,
    fontWeight: "700",
  },
  badgeRango: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeRangoText: {
    fontSize: 11,
    fontWeight: "600",
  },
  readOnlyContainer: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  readOnlyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  readOnlyValueText: {
    fontSize: 15,
    fontWeight: "700",
  },
  readOnlyCurrency: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardDepreciacionImpresora: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    gap: spacing.xs + 2,
  },
  cardDepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  impresoraNombreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  impresoraNombreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  miniCardCosto: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  miniCardCostoLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  miniCardCostoValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  horasDetalleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  horasCol: {
    flex: 1,
  },
  horasColRight: {
    alignItems: "flex-end",
  },
  horasRatioText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  horasRestantesText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  hintTexto: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  boton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  botonSecundarioTexto: {
    fontWeight: "600",
  },
  botonPrimarioTexto: {
    fontWeight: "700",
  },
  monedaRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  monedaChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  monedaChipTexto: {
    fontSize: 12,
    fontWeight: "600",
  },
});
