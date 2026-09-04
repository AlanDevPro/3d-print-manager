import { SearchInput } from "@/components/ui/SearchInput";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ModeloUI } from "../types";
import { DetalleModeloModal } from "./DetalleModeloModal";
import { ModeloCard } from "./ModeloCard";

type Props = {
  theme: any;
  catalogo?: ModeloUI[];
};

export function CatalogoSection({ theme, catalogo }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<ModeloUI | null>(null);

  // Asegurar que catalogo es un arreglo válido antes de procesar
  const listaBase = useMemo(
    () => (Array.isArray(catalogo) ? catalogo : []),
    [catalogo],
  );

  const filtrado = useMemo(() => {
    if (!busqueda.trim()) return listaBase;
    const q = busqueda.trim().toLowerCase();
    return listaBase.filter((m) =>
      m?.nombre ? m.nombre.toLowerCase().includes(q) : false,
    );
  }, [listaBase, busqueda]);

  const handleCotizar = (modelo: ModeloUI) => {
    setSeleccionado(null);
    router.push?.({
      pathname: "/cotizar",
      params: { nombrePieza: modelo?.nombre ?? "" },
    } as any);
  };

  return (
    <View style={{ gap: 10 }}>
      <SearchInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar modelo en tu catálogo..."
        theme={theme}
      />

      <View style={styles.headerRow}>
        <Text style={[styles.titulo, { color: theme.textPrimary }]}>
          Piezas más cotizadas
        </Text>
        <Text style={[styles.contador, { color: theme.textSecondary }]}>
          {filtrado.length} modelos
        </Text>
      </View>

      <View style={styles.grid}>
        {filtrado.map((modelo, index) => (
          <View key={modelo?.id ?? `modelo-${index}`} style={styles.gridItem}>
            <ModeloCard
              modelo={modelo}
              theme={theme}
              onPress={() => setSeleccionado(modelo)}
            />
          </View>
        ))}
      </View>

      {filtrado.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={32} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {busqueda.trim()
              ? `No se encontraron modelos para "${busqueda}"`
              : "No hay modelos disponibles en el catálogo"}
          </Text>
        </View>
      )}

      <DetalleModeloModal
        modelo={seleccionado}
        theme={theme}
        onClose={() => setSeleccionado(null)}
        onCotizar={handleCotizar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: { fontSize: 16, fontWeight: "700" },
  contador: { fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "47.5%" },
  empty: { alignItems: "center", gap: 8, paddingTop: 48 },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
});
