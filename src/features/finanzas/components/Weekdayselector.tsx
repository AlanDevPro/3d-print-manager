import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { DiaSemanaInfo } from "../utils/fechasSemana";

interface Props {
  theme: any;
  dias: DiaSemanaInfo[];
  diaSeleccionado: string; // iso "yyyy-mm-dd"
  onSeleccionar: (iso: string) => void;
}

export function WeekDaySelector({
  theme,
  dias,
  diaSeleccionado,
  onSeleccionar,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}
    >
      {dias.map((dia) => {
        const activo = dia.iso === diaSeleccionado;
        return (
          <TouchableOpacity
            key={dia.iso}
            style={[
              styles.chip,
              {
                backgroundColor: activo ? theme.primary : theme.bgSecondary,
                borderColor:
                  dia.esHoy && !activo ? theme.primary : "transparent",
              },
            ]}
            onPress={() => onSeleccionar(dia.iso)}
          >
            <Text
              style={{
                color: activo ? "#FFFFFF" : theme.textSecondary,
                fontSize: 10.5,
                fontWeight: "700",
              }}
            >
              {dia.inicialDia}
            </Text>
            <Text
              style={{
                color: activo ? "#FFFFFF" : theme.textPrimary,
                fontSize: 14,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {dia.numeroDia}
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
    width: 52,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
});
