// src/features/finanzas/components/graficos/ParetoProductosChart.tsx
//
// Pareto 80/20 de productos. La data viene de `useRankingProductos`, que
// agrupa `ingresos` por `producto_id` contra `catalogo_productos`.

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
import { ParetoUI } from "../../types";
import { abreviarNombre } from "../../utils/finanzasCalculos";
import {
  formatearCompacto,
  formatearMoneda,
} from "../../utils/finanzasFormato";
import { coloresFinanzas } from "../../utils/finanzasTema";
import { estilosLeyenda, LeyendaItem, TarjetaGrafico } from "./TarjetaGrafico";

interface Props {
  pareto: ParetoUI;
  moneda: string;
  subtitulo?: string;
  cargando?: boolean;
}

const ALTO = 230;
const PAD_IZQ = 34;
const PAD_DER = 30;
const PAD_SUP = 16;
const PAD_INF = 30;

export default function ParetoProductosChart({
  pareto,
  moneda,
  subtitulo = "Ingresos por producto del período",
  cargando,
}: Props) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);

  const { items, total, indiceCorte80 } = pareto;
  const vacio = items.length === 0 || total <= 0;
  const clave = indiceCorte80 >= 0 ? indiceCorte80 + 1 : items.length;

  return (
    <TarjetaGrafico
      titulo="Productos más Rentables (Regla 80/20)"
      subtitulo={subtitulo}
      cargando={cargando}
      vacio={vacio}
      alto={ALTO}
      mensajeVacio="Todavía no hay ingresos asociados a productos del catálogo en este período."
      leyenda={
        <View style={estilosLeyenda.fila}>
          <LeyendaItem color={c.destacado} label="Genera el 80% de ingresos" />
          <LeyendaItem color={c.neutro} label="Resto del catálogo" />
          <LeyendaItem color={c.acumulado} label="% Acumulado" esLinea />
        </View>
      }
      pie={
        <Text style={[styles.pieTexto, { color: c.textSecondary }]}>
          <Text style={[styles.pieFuerte, { color: c.textPrimary }]}>
            {clave} de {items.length} productos
          </Text>{" "}
          generan el 80% de {formatearMoneda(total, moneda)} en ingresos.
        </Text>
      }
    >
      {(ancho) => {
        const anchoPlot = ancho - PAD_IZQ - PAD_DER;
        const altoPlot = ALTO - PAD_SUP - PAD_INF;

        const maxMonto = (items[0]?.totalGenerado ?? 0) * 1.15 || 1;
        const slot = anchoPlot / items.length;
        const anchoBarra = Math.min(slot * 0.55, 42);

        const puntos = items.map((p, i) => {
          const x = PAD_IZQ + slot * i + slot / 2;
          const y = PAD_SUP + altoPlot - (p.pctAcumulado / 100) * altoPlot;
          return { x, y };
        });
        const polyline = puntos
          .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(" ");
        const y80 = PAD_SUP + altoPlot - 0.8 * altoPlot;

        return (
          <Svg width={ancho} height={ALTO}>
            {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
              const y = PAD_SUP + altoPlot - f * altoPlot;
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
                    {formatearCompacto(maxMonto * f)}
                  </SvgText>
                  <SvgText
                    x={ancho - PAD_DER + 4}
                    y={y + 3}
                    fontSize={9}
                    fill={c.textSecondary}
                  >
                    {Math.round(f * 100)}%
                  </SvgText>
                </G>
              );
            })}

            <Line
              x1={PAD_IZQ}
              x2={ancho - PAD_DER}
              y1={y80}
              y2={y80}
              stroke={c.acumulado}
              strokeWidth={1.2}
              strokeDasharray="6,3"
              opacity={0.7}
            />
            <SvgText
              x={ancho - PAD_DER - 24}
              y={y80 - 4}
              fontSize={9}
              fill={c.acumulado}
            >
              80%
            </SvgText>

            {items.map((p, i) => {
              const alturaBarra = (p.totalGenerado / maxMonto) * altoPlot;
              const x = PAD_IZQ + slot * i + (slot - anchoBarra) / 2;
              const esClave = indiceCorte80 < 0 || i <= indiceCorte80;
              return (
                <G key={p.productoId}>
                  <Rect
                    x={x}
                    y={PAD_SUP + altoPlot - alturaBarra}
                    width={anchoBarra}
                    height={alturaBarra}
                    rx={4}
                    fill={esClave ? c.destacado : c.neutro}
                  />
                  <SvgText
                    x={x + anchoBarra / 2}
                    y={ALTO - 16}
                    fontSize={9}
                    fill={c.textSecondary}
                    textAnchor="middle"
                  >
                    {abreviarNombre(p.nombre)}
                  </SvgText>
                  {!!p.categoria && (
                    <SvgText
                      x={x + anchoBarra / 2}
                      y={ALTO - 4}
                      fontSize={8}
                      fill={c.textSecondary}
                      opacity={0.7}
                      textAnchor="middle"
                    >
                      {abreviarNombre(p.categoria, 8)}
                    </SvgText>
                  )}
                </G>
              );
            })}

            <Polyline
              points={polyline}
              fill="none"
              stroke={c.acumulado}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {puntos.map((p, i) => (
              <Circle
                key={`pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.2}
                fill={c.acumulado}
                stroke={c.card}
                strokeWidth={1.2}
              />
            ))}
          </Svg>
        );
      }}
    </TarjetaGrafico>
  );
}

const styles = StyleSheet.create({
  pieTexto: { fontSize: 12, lineHeight: 17 },
  pieFuerte: { fontWeight: "700" },
});
