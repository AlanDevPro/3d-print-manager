//src/components/ui/RankingItem.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  posicion?: number; // si viene, muestra badge numerado (productos)
  iniciales?: string; // si viene, muestra avatar (clientes)
  nombre: string;
  subtitulo?: string;
  monto: number;
  destacadoPrimero?: boolean;
}

export function RankingItem({
  theme,
  posicion,
  iniciales,
  nombre,
  subtitulo,
  monto,
  destacadoPrimero,
}: Props) {
  return (
    <View style={styles.fila}>
      {posicion !== undefined && (
        <View
          style={[
            styles.posicion,
            {
              backgroundColor:
                posicion === 0 && destacadoPrimero
                  ? "#F59E0B"
                  : theme.bgPrimary,
            },
          ]}
        >
          <Text
            style={{
              color:
                posicion === 0 && destacadoPrimero
                  ? "#fff"
                  : theme.textSecondary,
              fontSize: 11.5,
              fontWeight: "800",
            }}
          >
            {posicion + 1}
          </Text>
        </View>
      )}
      {iniciales !== undefined && (
        <View
          style={[styles.avatar, { backgroundColor: theme.primary + "22" }]}
        >
          <Text
            style={{ color: theme.primary, fontWeight: "800", fontSize: 12 }}
          >
            {iniciales}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.nombre, { color: theme.textPrimary }]}>
          {nombre}
        </Text>
        {subtitulo && (
          <Text style={[styles.subtitulo, { color: theme.textSecondary }]}>
            {subtitulo}
          </Text>
        )}
      </View>
      <Text style={[styles.monto, { color: theme.textPrimary }]}>
        Bs {monto.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  posicion: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: { fontSize: 13, fontWeight: "700" },
  subtitulo: { fontSize: 11 },
  monto: { fontSize: 13, fontWeight: "800" },
});
