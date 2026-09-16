// src/features/finanzas/components/graficos/EgresosDonutChart.tsx
//
// Egresos por categoría + desglose por concepto de la categoría seleccionada.
// La data se arma en `agruparEgresosPorCategoria(egresos)` a partir de la tabla
// `egresos` (categoria + concepto), sin datos estáticos.

import { useTheme } from "@/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { CategoriaEgreso, CategoriaEgresoUI } from "../../types";
import { formatearMoneda } from "../../utils/finanzasFormato";
import { coloresFinanzas } from "../../utils/finanzasTema";
import { TarjetaGrafico } from "./TarjetaGrafico";

interface Props {
  categorias: CategoriaEgresoUI[];
  moneda: string;
  cargando?: boolean;
}

const GROSOR = 34;

function polarACartesiano(cx: number, cy: number, r: number, grados: number) {
  const rad = ((grados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arco(
  centro: number,
  radio: number,
  anguloInicio: number,
  anguloFin: number,
) {
  // Un círculo completo no se puede dibujar con un solo arco SVG.
  const fin =
    anguloFin - anguloInicio >= 360 ? anguloInicio + 359.99 : anguloFin;
  const inicioPt = polarACartesiano(centro, centro, radio, fin);
  const finPt = polarACartesiano(centro, centro, radio, anguloInicio);
  const arcoGrande = fin - anguloInicio <= 180 ? 0 : 1;
  return `M ${inicioPt.x} ${inicioPt.y} A ${radio} ${radio} 0 ${arcoGrande} 0 ${finPt.x} ${finPt.y}`;
}

export default function EgresosDonutChart({
  categorias,
  moneda,
  cargando,
}: Props) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);
  const [seleccionId, setSeleccionId] = useState<CategoriaEgreso | null>(null);

  useEffect(() => {
    if (categorias.length === 0) {
      setSeleccionId(null);
    } else if (!categorias.some((cat) => cat.id === seleccionId)) {
      setSeleccionId(categorias[0].id);
    }
  }, [categorias, seleccionId]);

  const total = useMemo(
    () => categorias.reduce((acc, cat) => acc + cat.monto, 0),
    [categorias],
  );

  const segmentos = useMemo(() => {
    let acumulado = 0;
    return categorias.map((cat) => {
      const fraccion = total > 0 ? cat.monto / total : 0;
      const inicio = acumulado * 360;
      acumulado += fraccion;
      return { ...cat, anguloInicio: inicio, anguloFin: acumulado * 360 };
    });
  }, [categorias, total]);

  const seleccion = categorias.find((cat) => cat.id === seleccionId) ?? null;

  return (
    <TarjetaGrafico
      titulo="Egresos por Categoría"
      subtitulo="Distribución del gasto operativo del período"
      cargando={cargando}
      vacio={categorias.length === 0}
      alto={200}
      mensajeVacio="No hay egresos registrados en este período."
    >
      {(ancho) => {
        const size = Math.min(ancho * 0.48, 200);
        const centro = size / 2;
        const radio = (size - GROSOR) / 2;

        return (
          <View>
            <View style={styles.filaDonut}>
              <Svg width={size} height={size}>
                {segmentos.map((s) => (
                  <Path
                    key={s.id}
                    d={arco(centro, radio, s.anguloInicio, s.anguloFin)}
                    stroke={s.color}
                    strokeWidth={GROSOR}
                    fill="none"
                    opacity={seleccionId === s.id ? 1 : 0.45}
                  />
                ))}
                <Circle
                  cx={centro}
                  cy={centro}
                  r={Math.max(radio - GROSOR / 2 - 4, 1)}
                  fill={c.card}
                />
                <SvgText
                  x={centro}
                  y={centro - 4}
                  fontSize={11}
                  fill={c.textSecondary}
                  textAnchor="middle"
                >
                  Total
                </SvgText>
                <SvgText
                  x={centro}
                  y={centro + 16}
                  fontSize={14}
                  fontWeight="bold"
                  fill={c.textPrimary}
                  textAnchor="middle"
                >
                  {formatearMoneda(total, moneda)}
                </SvgText>
              </Svg>

              <View style={styles.leyendaCol}>
                {segmentos.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => setSeleccionId(s.id)}
                    style={[
                      styles.leyendaItem,
                      seleccionId === s.id && { backgroundColor: c.highlight },
                    ]}
                  >
                    <View
                      style={[styles.punto, { backgroundColor: s.color }]}
                    />
                    <View style={styles.flex}>
                      <Text
                        style={[styles.leyendaLabel, { color: c.textPrimary }]}
                        numberOfLines={1}
                      >
                        {s.label}
                      </Text>
                      <Text
                        style={[
                          styles.leyendaValor,
                          { color: c.textSecondary },
                        ]}
                      >
                        {formatearMoneda(s.monto, moneda)} · {s.pct.toFixed(1)}%
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {!!seleccion && seleccion.desglose.length > 0 && (
              <View style={[styles.desgloseBox, { borderTopColor: c.border }]}>
                <Text style={[styles.desgloseTitulo, { color: c.textPrimary }]}>
                  Desglose: {seleccion.label}
                </Text>
                {seleccion.desglose.map((item, i) => (
                  <View key={`${item.label}-${i}`} style={styles.desgloseFila}>
                    <View
                      style={[styles.barraBg, { backgroundColor: c.trackBar }]}
                    >
                      <View
                        style={[
                          styles.barraFill,
                          {
                            width: `${item.pct}%`,
                            backgroundColor: seleccion.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.desgloseLabel, { color: c.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[styles.desgloseValor, { color: c.textPrimary }]}
                    >
                      {formatearMoneda(item.monto, moneda)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }}
    </TarjetaGrafico>
  );
}

const styles = StyleSheet.create({
  filaDonut: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
  leyendaCol: { flex: 1, marginLeft: 14 },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  punto: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  leyendaLabel: { fontSize: 12, fontWeight: "600" },
  leyendaValor: { fontSize: 10.5, marginTop: 1 },
  desgloseBox: { marginTop: 16, borderTopWidth: 1, paddingTop: 12 },
  desgloseTitulo: { fontSize: 12.5, fontWeight: "700", marginBottom: 8 },
  desgloseFila: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barraBg: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  barraFill: { height: "100%", borderRadius: 3 },
  desgloseLabel: { fontSize: 11, flex: 1, marginRight: 6 },
  desgloseValor: { fontSize: 11, fontWeight: "600" },
});
