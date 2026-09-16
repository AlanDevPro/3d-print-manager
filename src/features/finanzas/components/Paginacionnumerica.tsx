import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  theme: any;
  paginaActual: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

export function PaginacionNumerica({
  theme,
  paginaActual,
  totalPaginas,
  onCambiar,
}: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}
    >
      {paginas.map((p) => {
        const activa = p === paginaActual;
        return (
          <TouchableOpacity
            key={p}
            style={[
              styles.chip,
              { backgroundColor: activa ? theme.primary : theme.bgSecondary },
            ]}
            onPress={() => onCambiar(p)}
          >
            <Text
              style={{
                color: activa ? "#FFFFFF" : theme.textSecondary,
                fontSize: 12.5,
                fontWeight: "700",
              }}
            >
              {p}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 8, paddingVertical: 4 },
  chip: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
