//src/features/finanzas/components/GraficoIngresosEgresos.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TendenciaMensual } from "../types";

interface Props {
  theme: any;
  tendencia: TendenciaMensual;
}

export function GraficoIngresosEgresos({ theme, tendencia }: Props) {
  const max = Math.max(1, ...tendencia.ingresos, ...tendencia.egresos);

  return (
    <View>
      <View style={styles.chartRow}>
        {tendencia.labels.map((label, idx) => {
          const alturaIngreso = Math.max(
            6,
            Math.round((tendencia.ingresos[idx] / max) * 100),
          );
          const alturaEgreso = Math.max(
            6,
            Math.round((tendencia.egresos[idx] / max) * 100),
          );
          return (
            <View key={idx} style={styles.wrapper}>
              <View style={styles.trackDoble}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${alturaIngreso}%`,
                        backgroundColor: "#22C55E",
                      },
                    ]}
                  />
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${alturaEgreso}%`,
                        backgroundColor: "#EF4444",
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.leyenda}>
        <LeyendaItem color="#22C55E" texto="Ingresos" theme={theme} />
        <LeyendaItem color="#EF4444" texto="Egresos" theme={theme} />
      </View>
    </View>
  );
}

function LeyendaItem({
  color,
  texto,
  theme,
}: {
  color: string;
  texto: string;
  theme: any;
}) {
  return (
    <View style={styles.leyendaItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={{ color: theme.textPrimary, fontSize: 12.5, fontWeight: "600" }}
      >
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    paddingTop: 6,
  },
  wrapper: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  trackDoble: {
    flexDirection: "row",
    gap: 3,
    height: "88%",
    alignItems: "flex-end",
  },
  track: { width: 10, height: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4 },
  label: { fontSize: 10.5, marginTop: 6 },
  leyenda: { flexDirection: "row", gap: 16, justifyContent: "center" },
  leyendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
