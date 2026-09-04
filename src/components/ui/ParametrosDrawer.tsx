import { drawerWidth, radii, spacing } from "@/constants/theme";
import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";
import { ThemeContext } from "@/context/ThemeContext";
import { parametrosService } from "@/features/parametros/services/parametrosService";
import {
  ConfigParametros,
  EspecificacionMaquina,
  ImpresoraDepreciacion,
  PARAMETROS_VACIOS,
  TarifasMoneda,
} from "@/features/parametros/types";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { DepreciacionSection } from "./parametros/DepreciacionSection";
import { DrawerSection } from "./parametros/DrawerSection";
import { EnvioSection } from "./parametros/EnvioSection";
import { ManoObraSection } from "./parametros/ManoObraSection";
import { PdfSection } from "./parametros/PdfSection";
import { RespaldoSection } from "./parametros/RespaldoSection";
import { TarifasSection } from "./parametros/TarifasSection";

export interface ParametrosDrawerProps {
  visible: boolean;
  onClose: () => void;
  empresaId?: string | null;
  initialParametros?: ConfigParametros;
  impresoras?: EspecificacionMaquina[];
  onSave?: (parametrosGuardados: ConfigParametros) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ANCHO_DRAWER = Math.min(drawerWidth, SCREEN_WIDTH * 0.86);

export function ParametrosDrawer({
  visible,
  onClose,
  empresaId,
  impresoras: propsImpresoras,
  onSave,
}: ParametrosDrawerProps) {
  const { theme } = useContext(ThemeContext);

  const {
    parametros: contextParametros,
    impresorasRaw,
    recargar,
  } = useConfiguracionTaller();

  const [guardando, setGuardando] = useState(false);
  const [parametros, setParametros] = useState<ConfigParametros>(
    contextParametros ?? PARAMETROS_VACIOS,
  );
  const [seccionAbierta, setSeccionAbierta] = useState<number | null>(1);

  // Sincroniza y normaliza campos devueltos en snake_case o camelCase
  useEffect(() => {
    if (!visible) return;
    if (contextParametros) {
      setParametros({
        ...contextParametros,
        tarifas: {
          ...contextParametros.tarifas,
          monedaPrincipal:
            contextParametros.tarifas?.monedaPrincipal ??
            (contextParametros as any)?.moneda ??
            "BOB",
          tarifaElectricaKwh:
            contextParametros.tarifas?.tarifaElectricaKwh ??
            (contextParametros as any)?.costo_kwh ??
            0,
          reglasMargen:
            contextParametros.tarifas?.reglasMargen ??
            (contextParametros as any)?.reglas_margen ??
            [],
        },
      });
    } else {
      setParametros(PARAMETROS_VACIOS);
    }
  }, [visible, contextParametros]);

  const coleccionOrigen =
    (propsImpresoras && propsImpresoras.length > 0 ? propsImpresoras : null) ??
    (impresorasRaw && impresorasRaw.length > 0 ? impresorasRaw : null) ??
    parametros.impresoras ??
    [];

  const listaImpresorasEfectiva: EspecificacionMaquina[] = coleccionOrigen.map(
    (item: any) => ({
      ...item,
      id: item.id || String(Math.random()),
      nombre: item.modelo || item.nombre || "Impresora 3D",
      potenciaWatts: Number(item.potenciaWatts ?? item.potencia_watts ?? 150),
    }),
  );

  const impresorasParaDepreciacion: ImpresoraDepreciacion[] =
    coleccionOrigen.map((item: any) => ({
      id: item.id || String(Math.random()),
      nombre: item.modelo || item.nombre || "Impresora 3D",
      costo: Number(item.costo ?? item.costo_compra ?? 0),
      horasImpresas: Number(item.horasImpresas ?? item.horas_impresas ?? 0),
      vidaUtilHoras: Number(item.vidaUtilHoras ?? item.vida_util_horas ?? 3000),
      potenciaWatts: Number(item.potenciaWatts ?? item.potencia_watts ?? 150),
      costoMantenimientoHora: Number(
        item.costoMantenimientoHora ?? item.costo_mantenimiento_hora ?? 0.5,
      ),
    }));

  const translateX = useRef(new Animated.Value(ANCHO_DRAWER)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : ANCHO_DRAWER,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateX]);

  const actualizarSeccion = <K extends keyof ConfigParametros>(
    seccion: K,
    cambios: Partial<NonNullable<ConfigParametros[K]>>,
  ) => {
    setParametros((prev) => {
      const valorPrevio = (prev[seccion] ?? {}) as object;
      return {
        ...prev,
        [seccion]: { ...valorPrevio, ...cambios },
      };
    });
  };

  const costoHoraBD = Number(
    parametros?.manoObra?.costoHora ??
      (parametros as any)?.costo_mano_obra_hora ??
      0,
  );

  const sueldoMensualActual = Number(
    parametros?.manoObra?.sueldoMensual ??
      (parametros as any)?.sueldo_mensual ??
      0,
  );

  const tiempoInvertidoActual = Number(
    parametros?.manoObra?.tiempoInvertidoMinutos ??
      (parametros as any)?.tiempo_dedicacion_minutos ??
      0,
  );

  const avanzadosActuales = {
    costoOperativoFijoMensual:
      parametros?.avanzados?.costoOperativoFijoMensual ?? 0,
    tasaFalloDefectoPct: parametros?.avanzados?.tasaFalloDefectoPct ?? 10,
    impuestoPct: parametros?.avanzados?.impuestoPct ?? 0,
    margenGananciaDefectoPct:
      parametros?.avanzados?.margenGananciaDefectoPct ?? 30,
  };

  const tarifasActuales: TarifasMoneda = {
    monedaPrincipal:
      parametros?.tarifas?.monedaPrincipal ??
      (parametros as any)?.moneda ??
      ("BOB" as const),
    tarifaElectricaKwh:
      parametros?.tarifas?.tarifaElectricaKwh ??
      (parametros as any)?.costo_kwh ??
      0,
    reglasMargen:
      parametros?.tarifas?.reglasMargen ??
      (parametros as any)?.reglas_margen ??
      [],
  };

  const handleGuardar = async () => {
    if (!empresaId) {
      Alert.alert(
        "No se pudo guardar",
        "No se identificó una empresa activa vinculada.",
      );
      return;
    }

    const costoHoraCalculadoFinal =
      sueldoMensualActual > 0 ? sueldoMensualActual / 160 : costoHoraBD;

    const manoObraPrevia = (parametros.manoObra ?? {}) as object;
    const avanzadosPrevios = (parametros.avanzados ?? {}) as object;

    const parametrosActualizados: ConfigParametros & Record<string, any> = {
      ...parametros,
      costo_mano_obra_hora: costoHoraCalculadoFinal,
      sueldo_mensual: sueldoMensualActual,
      tiempo_dedicacion_minutos: tiempoInvertidoActual,
      tarifas: {
        ...parametros.tarifas,
        ...tarifasActuales,
      },
      manoObra: {
        ...manoObraPrevia,
        sueldoMensual: sueldoMensualActual,
        tiempoInvertidoMinutos: tiempoInvertidoActual,
        costoHora: costoHoraCalculadoFinal,
      },
      avanzados: {
        ...avanzadosPrevios,
        ...avanzadosActuales,
      },
    };

    setGuardando(true);
    try {
      await parametrosService.saveConfiguracion(
        empresaId,
        parametrosActualizados,
      );

      const impresorasEditadas = parametrosActualizados.impresoras ?? [];
      await Promise.all(
        impresorasEditadas
          .filter((imp) => imp.id && !imp.id.startsWith("0."))
          .map((imp) => parametrosService.saveImpresora(empresaId, imp)),
      );

      await recargar();

      if (onSave) onSave(parametrosActualizados);
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Error al guardar",
        err?.message ?? "No se pudieron guardar los parámetros.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleSeccion = (id: number) => {
    setSeccionAbierta((prev) => (prev === id ? null : id));
  };

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
          onPress={guardando ? undefined : onClose}
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
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              ⚙️ Configuración de Cotización y Taller
            </Text>
            <Pressable onPress={onClose} hitSlop={12} disabled={guardando}>
              <Text style={{ color: theme.textPrimary }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DrawerSection
              icon="cash-outline"
              titulo="1. Tarifas y Moneda"
              abierto={seccionAbierta === 1}
              onToggle={() => toggleSeccion(1)}
            >
              <TarifasSection
                tarifas={tarifasActuales}
                empresaId={empresaId}
                impresoras={listaImpresorasEfectiva}
                onChange={(cambios) => actualizarSeccion("tarifas", cambios)}
              />
            </DrawerSection>

            <DrawerSection
              icon="hammer-outline"
              titulo="2. Costos de Mano de Obra"
              abierto={seccionAbierta === 2}
              onToggle={() => toggleSeccion(2)}
            >
              <ManoObraSection
                tiempoInvertidoMinutos={tiempoInvertidoActual}
                sueldoMensual={sueldoMensualActual}
                costoHoraBaseDatos={costoHoraBD}
                monedaPrincipal={tarifasActuales.monedaPrincipal}
                onChangeTiempo={(tiempoInvertidoMinutos) =>
                  actualizarSeccion("manoObra", { tiempoInvertidoMinutos })
                }
                onChangeSueldo={(sueldoMensual) =>
                  actualizarSeccion("manoObra", { sueldoMensual })
                }
              />
            </DrawerSection>

            <DrawerSection
              icon="print-outline"
              titulo="3. Depreciación y Mantenimiento"
              abierto={seccionAbierta === 3}
              onToggle={() => toggleSeccion(3)}
            >
              <DepreciacionSection
                impresoras={impresorasParaDepreciacion}
                monedaPrincipal={tarifasActuales.monedaPrincipal}
                tarifaElectricaKwh={tarifasActuales.tarifaElectricaKwh}
              />
            </DrawerSection>

            <DrawerSection
              icon="cube-outline"
              titulo="4. Costos y Métodos de Envío"
              abierto={seccionAbierta === 4}
              onToggle={() => toggleSeccion(4)}
            >
              <EnvioSection
                envio={parametros?.envio ?? {}}
                empresaId={empresaId}
                onChange={(cambios) => actualizarSeccion("envio", cambios)}
              />
            </DrawerSection>

            <DrawerSection
              icon="document-text-outline"
              titulo="5. Personalización de PDF y Cotización"
              abierto={seccionAbierta === 5}
              onToggle={() => toggleSeccion(5)}
            >
              <PdfSection
                pdf={parametros?.pdf ?? {}}
                onChange={(cambios) => actualizarSeccion("pdf", cambios)}
              />
            </DrawerSection>

            <DrawerSection
              icon="cloud-upload-outline"
              titulo="6. Respaldo y Exportación"
              abierto={seccionAbierta === 6}
              onToggle={() => toggleSeccion(6)}
            >
              <RespaldoSection
                respaldo={parametros?.respaldo ?? {}}
                onChange={(cambios) => actualizarSeccion("respaldo", cambios)}
              />
            </DrawerSection>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable
              style={[
                styles.boton,
                { backgroundColor: theme.bgSecondary },
                guardando && styles.botonDeshabilitado,
              ]}
              onPress={onClose}
              disabled={guardando}
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
              style={[
                styles.boton,
                { backgroundColor: theme.primary },
                guardando && styles.botonDeshabilitado,
              ]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              <Text
                style={[
                  styles.botonPrimarioTexto,
                  { color: theme.textPrimary },
                ]}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  overlay: { ...StyleSheet.absoluteFillObject },
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
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
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonSecundarioTexto: { fontWeight: "600" },
  botonPrimarioTexto: { fontWeight: "700" },
});