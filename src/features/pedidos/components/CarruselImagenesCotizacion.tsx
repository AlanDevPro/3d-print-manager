// src/features/pedidos/components/CarruselImagenesCotizacion.tsx
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";

interface CarruselImagenesCotizacionProps {
  imagenes: string[];
  height: number;
  intervaloMs?: number;
}

const IMAGEN_FALLBACK =
  "https://images.unsplash.com/photo-1615840243388-00133c921503?q=80&w=600&auto=format&fit=crop";

export function CarruselImagenesCotizacion({
  imagenes,
  height,
  intervaloMs = 3500,
}: CarruselImagenesCotizacionProps) {
  const listaFinal = imagenes.length > 0 ? imagenes : [IMAGEN_FALLBACK];
  const [indiceActual, setIndiceActual] = useState(0);
  const [anchoContenedor, setAnchoContenedor] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (listaFinal.length <= 1 || anchoContenedor === 0) return;

    const intervalo = setInterval(() => {
      setIndiceActual((prev) => {
        const siguiente = (prev + 1) % listaFinal.length;
        flatListRef.current?.scrollToOffset({
          offset: siguiente * anchoContenedor,
          animated: true,
        });
        return siguiente;
      });
    }, intervaloMs);

    return () => clearInterval(intervalo);
  }, [listaFinal.length, intervaloMs, anchoContenedor]);

  // Si cambia la lista de imágenes (ej. al reciclar la card en un FlatList), resetea
  useEffect(() => {
    setIndiceActual(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [listaFinal.join("|")]);

  return (
    <View
      style={{ height, width: "100%" }}
      onLayout={(e) => setAnchoContenedor(e.nativeEvent.layout.width)}
    >
      {anchoContenedor > 0 && (
        <FlatList
          ref={flatListRef}
          data={listaFinal}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: anchoContenedor,
            offset: anchoContenedor * index,
            index,
          })}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: anchoContenedor, height }}
              resizeMode="cover"
            />
          )}
        />
      )}

      {listaFinal.length > 1 && (
        <View style={styles.indicadoresRow}>
          {listaFinal.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicador,
                i === indiceActual && styles.indicadorActivo,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  indicadoresRow: {
    position: "absolute",
    bottom: 34,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  indicador: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicadorActivo: {
    width: 12,
    backgroundColor: "#FFFFFF",
  },
});
