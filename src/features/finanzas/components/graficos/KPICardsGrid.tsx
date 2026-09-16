// src/features/finanzas/components/graficos/KPICardsGrid.tsx
//
// Tarjetas KPI del dashboard. 100% derivadas de la serie mensual real
// (ingresos, egresos y pedido_impresion_intentos). Sin mocks.

import { useTheme } from "@/hooks/useTheme";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { KpiUI, MesFinancieroUI } from "../../types";
import { construirKpis } from "../../utils/finanzasCalculos";
import { coloresFinanzas } from "../../utils/finanzasTema";

interface Props {
  serie: MesFinancieroUI[];
  moneda: string;
  cargando?: boolean;
}

const GAP = 12;

export default function KPICardsGrid({ serie, moneda, cargando }: Props) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);
  const [ancho, setAncho] = useState(0);

  const kpis = useMemo(() => construirKpis(serie, moneda), [serie, moneda]);
  const anchoTarjeta = ancho > 0 ? (ancho - GAP) / 2 : 0;

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={c.textSecondary} />
      </View>
    );
  }

  if (kpis.length === 0) return null;

  return (
    <View
      style={styles.grid}
      onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
    >
      {anchoTarjeta > 0 &&
        kpis.map((kpi) => (
          <TarjetaKpi key={kpi.id} kpi={kpi} ancho={anchoTarjeta} colores={c} />
        ))}
    </View>
  );
}

function TarjetaKpi({
  kpi,
  ancho,
  colores,
}: {
  kpi: KpiUI;
  ancho: number;
  colores: ReturnType<typeof coloresFinanzas>;
}) {
  const esBueno = kpi.invertido ? kpi.deltaPct <= 0 : kpi.deltaPct >= 0;
  const colorTendencia = esBueno ? colores.positivo : colores.negativo;
  const fondoBadge = esBueno ? colores.positivoBg : colores.negativoBg;
  const flecha = kpi.deltaPct >= 0 ? "▲" : "▼";

  return (
    <View
      style={[
        styles.card,
        {
          width: ancho,
          backgroundColor: colores.card,
          borderColor: colores.border,
        },
      ]}
    >
      <Text
        style={[styles.label, { color: colores.textSecondary }]}
        numberOfLines={2}
      >
        {kpi.label}
      </Text>

      <View style={styles.fila}>
        <Text
          style={[styles.valor, { color: colores.textPrimary }]}
          numberOfLines={1}
        >
          {kpi.valor}
        </Text>
        <Sparkline data={kpi.serie} color={colorTendencia} />
      </View>

      <View style={[styles.badge, { backgroundColor: fondoBadge }]}>
        <Text style={[styles.badgeText, { color: colorTendencia }]}>
          {flecha} {Math.abs(kpi.deltaPct).toFixed(1)}% vs. mes anterior
        </Text>
      </View>
    </View>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 66;
  const height = 28;

  if (data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rango = max - min || 1;

  const puntos = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / rango) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const ultimaY = height - ((data[data.length - 1] - min) / rango) * height;

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={puntos}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={width - 1} cy={ultimaY} r={2.5} fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cargando: { paddingVertical: 24, alignItems: "center" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: GAP,
  },
  label: { fontSize: 12, marginBottom: 8, minHeight: 32 },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valor: { fontSize: 19, fontWeight: "700", flexShrink: 1, marginRight: 6 },
  badge: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
