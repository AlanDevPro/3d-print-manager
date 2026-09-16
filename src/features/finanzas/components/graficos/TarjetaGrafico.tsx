// src/features/finanzas/components/graficos/TarjetaGrafico.tsx
//
// Contenedor común de los gráficos:
// - mide su ancho real con onLayout (nada de Dimensions, funciona en tablet y
//   al rotar la pantalla)
// - centraliza título, subtítulo, leyenda, pie, estado de carga y estado vacío

import { useTheme } from "@/hooks/useTheme";
import { ReactNode, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { coloresFinanzas } from "../../utils/finanzasTema";

interface Props {
  titulo: string;
  subtitulo?: string;
  leyenda?: ReactNode;
  pie?: ReactNode;
  cargando?: boolean;
  vacio?: boolean;
  mensajeVacio?: string;
  alto?: number;
  children: (ancho: number) => ReactNode;
}

export function TarjetaGrafico({
  titulo,
  subtitulo,
  leyenda,
  pie,
  cargando = false,
  vacio = false,
  mensajeVacio = "Aún no hay datos registrados para este período.",
  alto = 220,
  children,
}: Props) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);
  const [ancho, setAncho] = useState(0);

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <Text style={[styles.titulo, { color: c.textPrimary }]}>{titulo}</Text>
      {!!subtitulo && (
        <Text style={[styles.subtitulo, { color: c.textSecondary }]}>
          {subtitulo}
        </Text>
      )}

      {!cargando && !vacio && leyenda}

      <View
        style={styles.lienzo}
        onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
      >
        {cargando ? (
          <View style={[styles.estado, { height: alto }]}>
            <ActivityIndicator color={c.textSecondary} />
          </View>
        ) : vacio ? (
          <View style={[styles.estado, { height: alto }]}>
            <Text style={[styles.vacio, { color: c.textSecondary }]}>
              {mensajeVacio}
            </Text>
          </View>
        ) : (
          ancho > 0 && children(ancho)
        )}
      </View>

      {!cargando && !vacio && !!pie && (
        <View style={[styles.pie, { borderTopColor: c.border }]}>{pie}</View>
      )}
    </View>
  );
}

export function LeyendaItem({
  color,
  label,
  esLinea,
}: {
  color: string;
  label: string;
  esLinea?: boolean;
}) {
  const { theme } = useTheme();
  const c = coloresFinanzas(theme);
  return (
    <View style={styles.leyendaItem}>
      <View
        style={[
          esLinea ? styles.leyendaLinea : styles.leyendaPunto,
          { backgroundColor: color },
        ]}
      />
      <Text style={[styles.leyendaLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

export const estilosLeyenda = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  titulo: { fontSize: 15, fontWeight: "700" },
  subtitulo: { fontSize: 11, marginTop: 2, marginBottom: 10 },
  lienzo: { width: "100%" },
  estado: { alignItems: "center", justifyContent: "center" },
  vacio: { fontSize: 12, textAlign: "center", paddingHorizontal: 12 },
  pie: { marginTop: 10, borderTopWidth: 1, paddingTop: 8 },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 4,
  },
  leyendaPunto: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  leyendaLinea: { width: 12, height: 3, borderRadius: 2, marginRight: 6 },
  leyendaLabel: { fontSize: 11 },
});
