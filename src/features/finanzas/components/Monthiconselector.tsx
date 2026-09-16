import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { MesInfo } from "../utils/fechasMes";

interface Props {
  theme: any;
  meses: MesInfo[];
  mesSeleccionado: string; // key "yyyy-mm"
  onSeleccionar: (mes: MesInfo) => void;
  onVerMasAntiguos?: () => void;
}

export function MonthIconSelector({
  theme,
  meses,
  mesSeleccionado,
  onSeleccionar,
  onVerMasAntiguos,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}
    >
      {meses.map((mes) => {
        const activo = mes.key === mesSeleccionado;
        return (
          <TouchableOpacity
            key={mes.key}
            style={[
              styles.chip,
              {
                backgroundColor: activo ? theme.primary : theme.bgSecondary,
                borderColor:
                  mes.esMesActual && !activo ? theme.primary : "transparent",
              },
            ]}
            onPress={() => onSeleccionar(mes)}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={activo ? "#FFFFFF" : theme.textSecondary}
            />
            <Text
              style={{
                color: activo ? "#FFFFFF" : theme.textPrimary,
                fontSize: 11,
                fontWeight: "700",
                marginTop: 3,
              }}
            >
              {mes.inicialMes}
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
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
});
