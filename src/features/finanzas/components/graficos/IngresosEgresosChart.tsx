// src/features/finanzas/components/graficos/IngresosEgresosChart.tsx
//
// Barras agrupadas (ingresos / egresos) + línea de utilidad neta.
// Recibe la serie mensual ya calculada desde `useSerieMensual`.

import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { MesFinancieroUI } from "../../types";
import {
  formatearCompacto,
  formatearMoneda,
} from "../../utils/finanzasFormato";
import { coloresFinanzas } from "../../utils/finanzasTema";
import { estilosLeyenda, LeyendaItem, TarjetaGrafico } from "./TarjetaGrafico";

interface Props {
  serie: MesFinancieroUI[];
  moneda: string;
  cargando?: boolean;
}

const ALTO = 220;
const PAD_IZQ = 38;
const PAD_DER = 10;
const PAD_SUP = 16;
const PAD_INF = 26;
const TICKS = 4;

export default function IngresosEgresosChart({
  serie,
  moneda,
  cargando,
}: Props) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);

  const vacio = !serie.some((m) => m.ingresos > 0 || m.egresos > 0);
  const ultimo = serie[serie.length - 1];

  return (
    <TarjetaGrafico
      titulo="Ingresos vs. Egresos y Utilidad Neta"
      subtitulo={`Últimos ${serie.length} meses · en ${moneda}`}
      cargando={cargando}
      vacio={vacio}
      alto={ALTO}
      leyenda={
        <View style={estilosLeyenda.fila}>
          <LeyendaItem color={c.ingresos} label="Ingresos" />
          <LeyendaItem color={c.egresos} label="Egresos" />
          <LeyendaItem color={c.margen} label="Utilidad Neta" esLinea />
        </View>
      }
      pie={
        ultimo ? (
          <Text style={[styles.pieTexto, { color: c.textSecondary }]}>
            Utilidad neta de {ultimo.etiqueta}:{" "}
            <Text style={[styles.pieFuerte, { color: c.textPrimary }]}>
              {formatearMoneda(ultimo.utilidad, moneda)}
            </Text>
          </Text>
        ) : null
      }
    >
      {(ancho) => {
        const anchoPlot = ancho - PAD_IZQ - PAD_DER;
        const altoPlot = ALTO - PAD_SUP - PAD_INF;

        const maxBarra =
          Math.max(...serie.map((m) => Math.max(m.ingresos, m.egresos)), 0) *
            1.15 || 1;
        const anchoGrupo = anchoPlot / serie.length;
        const anchoBarra = anchoGrupo * 0.28;

        const grid = Array.from(
          { length: TICKS + 1 },
          (_, i) => (maxBarra / TICKS) * i,
        );

        const puntosUtilidad = serie.map((m, i) => {
          const x = PAD_IZQ + anchoGrupo * i + anchoGrupo / 2;
          const y =
            PAD_SUP +
            altoPlot -
            (Math.max(m.utilidad, 0) / maxBarra) * altoPlot;
          return { x, y };
        });

        const polyline = puntosUtilidad
          .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(" ");

        return (
          <Svg width={ancho} height={ALTO}>
            {grid.map((val, i) => {
              const y = PAD_SUP + altoPlot - (val / maxBarra) * altoPlot;
              return (
                <G key={`grid-${i}`}>
                  <Line
                    x1={PAD_IZQ}
                    x2={ancho - PAD_DER}
                    y1={y}
                    y2={y}
                    stroke={c.gridLine}
                    strokeWidth={1}
                    strokeDasharray={i === 0 ? undefined : "4,4"}
                  />
                  <SvgText x={0} y={y + 3} fontSize={9} fill={c.textSecondary}>
                    {formatearCompacto(val)}
                  </SvgText>
                </G>
              );
            })}

            {serie.map((m, i) => {
              const xGrupo = PAD_IZQ + anchoGrupo * i;
              const hIngresos = (m.ingresos / maxBarra) * altoPlot;
              const hEgresos = (m.egresos / maxBarra) * altoPlot;

              return (
                <G key={`barras-${m.clave}`}>
                  <Rect
                    x={xGrupo + anchoGrupo / 2 - anchoBarra - 2}
                    y={PAD_SUP + altoPlot - hIngresos}
                    width={anchoBarra}
                    height={hIngresos}
                    rx={3}
                    fill={c.ingresos}
                  />
                  <Rect
                    x={xGrupo + anchoGrupo / 2 + 2}
                    y={PAD_SUP + altoPlot - hEgresos}
                    width={anchoBarra}
                    height={hEgresos}
                    rx={3}
                    fill={c.egresos}
                  />
                  <SvgText
                    x={xGrupo + anchoGrupo / 2}
                    y={ALTO - 8}
                    fontSize={10}
                    fill={c.textSecondary}
                    textAnchor="middle"
                  >
                    {m.etiqueta}
                  </SvgText>
                </G>
              );
            })}

            <Polyline
              points={polyline}
              fill="none"
              stroke={c.margen}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {puntosUtilidad.map((p, i) => (
              <Circle
                key={`pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={c.margen}
                stroke={c.card}
                strokeWidth={1.5}
              />
            ))}
          </Svg>
        );
      }}
    </TarjetaGrafico>
  );
}

const styles = StyleSheet.create({
  pieTexto: { fontSize: 12 },
  pieFuerte: { fontWeight: "700" },
});
