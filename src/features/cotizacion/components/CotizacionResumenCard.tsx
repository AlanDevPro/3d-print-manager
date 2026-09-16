// src/features/cotizacion/components/CotizacionResumenCard.tsx
import type { ResultadoCotizacion } from "@/features/cotizacion/types";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  BarraCostosVisual,
  type CostSegment,
} from "./resumen/BarraCostosVisual";
import { DesgloseDetallado } from "./resumen/DesgloseDetallado";
import { EstadisticasPiezaRow } from "./resumen/EstadisticasPiezaRow";
import { PiezasDetalleLista } from "./resumen/PiezasDetalleLista";
import { PrecioVentaDestacado } from "./resumen/PrecioVentaDestacado";
import { ResumenTabsBar } from "./resumen/ResumenTabsBar";

export interface CotizacionResumenCardProps {
  resultado: ResultadoCotizacion | null;
  cantidad: number;
  especificaciones?: any;
  clienteId?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  onGuardarCliente?: (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => Promise<string | { id?: string } | void>;
  onGuardarCotizacion?: (options?: {
    cliente_id?: string;
    imagenUri?: string | null;
  }) => Promise<any>;
}

type TabId = "general" | string;

export function CotizacionResumenCard({
  resultado,
  cantidad = 1,
  especificaciones,
  clienteId,
  nombreCliente = "",
  telefonoCliente = "",
  onGuardarCliente,
  onGuardarCotizacion,
}: CotizacionResumenCardProps) {
  const { theme } = useTheme();
  const moneda = "Bs";
  const [tabActivo, setTabActivo] = useState<TabId>("general");

  const tabs = useMemo(() => {
    const base = [{ id: "general" as TabId, label: "Cotización General" }];
    const piezaTabs = (resultado?.piezas ?? []).map((p, idx) => ({
      id: p.id as TabId,
      label: p.nombre_pieza?.trim() ? p.nombre_pieza : `Pieza ${idx + 1}`,
    }));
    return [...base, ...piezaTabs];
  }, [resultado]);

  useEffect(() => {
    if (!tabs.find((t) => t.id === tabActivo)) {
      setTabActivo("general");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  // Si el formulario es válido pero el resultado aún se está calculando en segundo plano
  if (!resultado || !resultado.desglose) {
    return (
      <View
        style={[
          styles.card,
          styles.emptyCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <ActivityIndicator size="small" color={theme.primary} />
        <Text
          style={[
            styles.emptyText,
            { color: theme.textSecondary, marginTop: 8 },
          ]}
        >
          Calculando cotización final...
        </Text>
      </View>
    );
  }

  // Si de plano no hay piezas en el resultado
  if (resultado.piezas.length === 0) {
    return (
      <View
        style={[
          styles.card,
          styles.emptyCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Ingresa los parámetros necesarios para calcular la cotización en
          tiempo real.
        </Text>
      </View>
    );
  }

  const piezaSeleccionada =
    tabActivo !== "general"
      ? resultado.piezas.find((p) => p.id === tabActivo)
      : undefined;
  const esVistaGeneral = tabActivo === "general" || !piezaSeleccionada;

  const { desglose } = resultado;
  const cantActualGeneral = resultado.cantidad || cantidad || 1;

  const matDirecto = esVistaGeneral
    ? (desglose.costo_material ?? 0)
    : piezaSeleccionada!.costo_material;
  const operacionMo = esVistaGeneral
    ? (desglose.costo_mano_obra ?? 0)
    : piezaSeleccionada!.costo_mano_obra;
  const depreciacion = esVistaGeneral
    ? (desglose.costo_depreciacion ?? 0)
    : piezaSeleccionada!.costo_depreciacion;
  const energia = esVistaGeneral
    ? (desglose.costo_energia ?? 0)
    : piezaSeleccionada!.costo_energia;
  const utilidadTotal = esVistaGeneral
    ? (resultado.monto_ganancia ?? 0)
    : piezaSeleccionada!.monto_ganancia_pieza;
  const cantActual = esVistaGeneral
    ? cantActualGeneral
    : piezaSeleccionada!.cantidad;
  const pctUtilidadAplicado = resultado.margen_ganancia_aplicado_pct ?? 0;
  const fondoRiesgo = esVistaGeneral
    ? (desglose.costo_fallos ?? 0)
    : piezaSeleccionada!.costo_fallos_pieza;
  const subtotalDirecto = matDirecto + operacionMo + depreciacion + energia;
  const costoBaseTotal = esVistaGeneral
    ? (resultado.subtotal_costo_base ?? 0)
    : piezaSeleccionada!.costo_base_pieza;
  const precioVentaMostrado = esVistaGeneral
    ? resultado.precio_final
    : piezaSeleccionada!.precio_total_pieza;

  const costSegments: CostSegment[] = [
    { key: "mat", label: "MATERIAL", flex: matDirecto || 0, color: "#1F2937" },
    {
      key: "ope",
      label: "OPERACIÓN",
      flex: operacionMo || 0,
      color: "#4B5563",
    },
    {
      key: "dep",
      label: "DEPRECIACIÓN",
      flex: depreciacion || 0,
      color: "#9CA3AF",
    },
    { key: "ene", label: "ENERGÍA", flex: energia || 0, color: "#D1D5DB" },
    {
      key: "uti",
      label: "UTILIDAD",
      flex: utilidadTotal || 0,
      color: theme.primary,
    },
  ];

  const tituloPieza = esVistaGeneral
    ? `Cotización General (${resultado.piezas.length} ${resultado.piezas.length === 1 ? "pieza" : "piezas"})`
    : piezaSeleccionada!.nombre_pieza;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      <ResumenTabsBar
        tabs={tabs}
        tabActivo={tabActivo}
        onSeleccionar={setTabActivo}
      />

      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={20} color={theme.primary} />
          <Text
            style={[styles.title, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {tituloPieza}
          </Text>
        </View>
        <Text
          style={[
            styles.badge,
            { backgroundColor: theme.primary + "1A", color: theme.primary },
          ]}
        >
          x{cantActual} {cantActual === 1 ? "unidad" : "unidades"}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <PrecioVentaDestacado
        precio={precioVentaMostrado}
        esVistaGeneral={esVistaGeneral}
        moneda={moneda}
      />

      <BarraCostosVisual
        segments={costSegments}
        textColor={theme.textSecondary}
      />

      {esVistaGeneral ? (
        <PiezasDetalleLista piezas={resultado.piezas} />
      ) : (
        <EstadisticasPiezaRow
          pesoGramos={piezaSeleccionada!.peso_gramos}
          tiempoHoras={piezaSeleccionada!.tiempo_impresion_horas}
          tiempoMinutos={piezaSeleccionada!.tiempo_impresion_minutos}
        />
      )}

      <DesgloseDetallado
        moneda={moneda}
        matDirecto={matDirecto}
        operacionMo={operacionMo}
        depreciacion={depreciacion}
        energia={energia}
        subtotalDirecto={subtotalDirecto}
        fondoRiesgo={fondoRiesgo}
        fondoRiesgoLabel={
          esVistaGeneral
            ? "Fondo de riesgo / Fallos"
            : "Fondo de riesgo (prorrateado)"
        }
        costoDiseno={
          esVistaGeneral ? Number(resultado.precio_personalizacion) : 0
        }
        costoBaseTotal={costoBaseTotal}
        utilidadLabel={
          esVistaGeneral
            ? "Utilidad total del proyecto"
            : "Utilidad de esta pieza"
        }
        utilidadSubtext={
          esVistaGeneral
            ? `Margen aplicado: ${pctUtilidadAplicado.toFixed(1)}%`
            : `Margen aplicado (Q=${cantActual}): ${pctUtilidadAplicado.toFixed(1)}%`
        }
        utilidadValor={utilidadTotal}
        impuesto={resultado.monto_impuesto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    gap: 10,
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 13, textAlign: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: "700", flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  divider: { height: 1, marginVertical: 4 },
});
