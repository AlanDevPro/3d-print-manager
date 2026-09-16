// src/features/cotizacion/components/forms/CotizacionForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { UseCotizacionReturn } from "@/features/cotizacion/hooks/useCotizacion";
import type {
  MaterialItem,
  ReglaMargen,
} from "@/features/cotizacion/types/formTypes";
import type { ResultadoValidacionSecuencial } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";

import { ImpresoraSelector } from "./sections/ImpresoraSelector";
import { MargenGananciaSelector } from "./sections/MargenGananciaSelector";
import { MaterialSelector } from "./sections/MaterialSelector";
import { PersonalizacionSwitch } from "./sections/PersonalizacionSwitch";
import { PiezasSection } from "./sections/PiezasSection";
import { RiesgoInput } from "./sections/RiesgoInput";

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
> & {
  materiales: MaterialItem[];
  reglasMargen?: ReglaMargen[];
  validacion: ResultadoValidacionSecuencial;
  esPersonalizado: boolean;
  onTogglePersonalizado: (val: boolean) => void;
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
  cargandoDatos,
  calculando,
  error,
  reglasMargen = [],
  validacion,
  esPersonalizado,
  onTogglePersonalizado,
}: CotizacionFormProps) {
  const { theme } = useTheme();

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

  const { pasosPorId, pesoTotalGramos, pesoMinimoConMargen, materialesDisponibles } =
    validacion;

  const pasosCompletos = validacion.pasos.filter((p) => p.completo).length;
  const totalPasos = validacion.pasos.length;
  const progreso = Math.round((pasosCompletos / totalPasos) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      {/* Encabezado + progreso */}
      <View style={styles.headerRealtime}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={22} color={theme.primary} />
          <Text style={[styles.mainSectionTitle, { color: theme.textPrimary }]}>
            Parámetros de Cotización
          </Text>
        </View>
        {calculando && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      <View style={styles.progressWrapper}>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progreso}%`,
                backgroundColor: progreso === 100 ? "#16A34A" : theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Paso {Math.min(pasosCompletos + (progreso === 100 ? 0 : 1), totalPasos)} de{" "}
          {totalPasos} · {pasosCompletos} completados
        </Text>
      </View>

      {/* 1. PIEZAS */}
      <PiezasSection
        piezas={piezas}
        piezaActivaId={piezaActivaId}
        updatePiezaField={updatePiezaField}
        agregarPieza={agregarPieza}
        eliminarPieza={eliminarPieza}
        seleccionarPieza={seleccionarPieza}
        errores={pasosPorId.piezas.errores}
        completo={pasosPorId.piezas.completo}
      />

      <View style={styles.sectionDivider} />

      {/* 2. MATERIAL */}
      <MaterialSelector
        materialesDisponibles={materialesDisponibles}
        filamentoId={form.filamento_id}
        onSeleccionar={(id) => updateField("filamento_id", id)}
        pesoTotalRequerido={pesoTotalGramos}
        pesoMinimoConMargen={pesoMinimoConMargen}
        bloqueado={pasosPorId.material.bloqueado}
        bloqueadoPor={pasosPorId.material.bloqueadoPor}
        erroresBloqueantes={pasosPorId.material.erroresBloqueantes}
        errores={pasosPorId.material.errores}
        completo={pasosPorId.material.completo}
      />

      <View style={styles.sectionDivider} />

      {/* 3. IMPRESORA */}
      <ImpresoraSelector
        impresoras={impresoras as any}
        impresoraId={form.impresora_id}
        onSeleccionar={(id) => updateField("impresora_id", id)}
        bloqueado={pasosPorId.impresora.bloqueado}
        bloqueadoPor={pasosPorId.impresora.bloqueadoPor}
        erroresBloqueantes={pasosPorId.impresora.erroresBloqueantes}
        errores={pasosPorId.impresora.errores}
        completo={pasosPorId.impresora.completo}
      />

      <View style={styles.sectionDivider} />

      {/* 4. RIESGO */}
      <RiesgoInput
        value={form.porcentaje_riesgo}
        onChangeText={(v) => updateField("porcentaje_riesgo", v)}
        bloqueado={pasosPorId.riesgo.bloqueado}
        bloqueadoPor={pasosPorId.riesgo.bloqueadoPor}
        erroresBloqueantes={pasosPorId.riesgo.erroresBloqueantes}
        errores={pasosPorId.riesgo.errores}
        completo={pasosPorId.riesgo.completo}
      />

      <View style={styles.sectionDivider} />

      {/* 5. UTILIDAD */}
      <MargenGananciaSelector
        reglasMargen={reglasMargen}
        reglaMargenId={form.regla_margen_id}
        margenGananciaPct={form.margen_ganancia_pct}
        onSeleccionar={(regla: any) => {
          updateField(
            "margen_ganancia_pct",
            String(regla.margen_ganancia_pct ?? regla.porcentaje ?? 0),
          );
          updateField("regla_margen_id", regla.id);
        }}
        bloqueado={pasosPorId.utilidad.bloqueado}
        bloqueadoPor={pasosPorId.utilidad.bloqueadoPor}
        erroresBloqueantes={pasosPorId.utilidad.erroresBloqueantes}
        errores={pasosPorId.utilidad.errores}
        completo={pasosPorId.utilidad.completo}
      />

      <View style={styles.sectionDivider} />

      {/* 6. PERSONALIZACIÓN */}
      <PersonalizacionSwitch
        activo={esPersonalizado}
        precio={form.precio_personalizacion}
        onToggle={(val) => {
          onTogglePersonalizado(val);
          if (!val) updateField("precio_personalizacion", "0");
        }}
        onChangePrecio={(v) => updateField("precio_personalizacion", v)}
        bloqueado={pasosPorId.personalizacion.bloqueado}
        bloqueadoPor={pasosPorId.personalizacion.bloqueadoPor}
        erroresBloqueantes={pasosPorId.personalizacion.erroresBloqueantes}
        errores={pasosPorId.personalizacion.errores}
        completo={pasosPorId.personalizacion.completo}
      />

      {Boolean(error) && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 8 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  headerRealtime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  mainSectionTitle: { fontSize: 18, fontWeight: "700" },
  progressWrapper: { marginBottom: 6 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11.5, fontWeight: "600", marginTop: 6 },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginVertical: 12,
  },
  mutedText: { marginTop: 8, fontSize: 14 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: "500" },
});