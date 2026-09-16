import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { diasDelMes, MesInfo, primerDiaSemanaDelMes } from "../utils/fechasMes";

interface Props {
  theme: any;
  visible: boolean;
  mes: MesInfo;
  diaSeleccionado?: number; // día del mes (1-31), si ya hay uno filtrado
  onSeleccionarDia: (dia: number) => void;
  onVerTodoElMes: () => void;
  onCerrar: () => void;
}

const INICIALES_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

export function DiaMesModal({
  theme,
  visible,
  mes,
  diaSeleccionado,
  onSeleccionarDia,
  onVerTodoElMes,
  onCerrar,
}: Props) {
  const totalDias = diasDelMes(mes.anio, mes.mes);
  const primerDia = primerDiaSemanaDelMes(mes.anio, mes.mes); // 0=domingo

  const celdas: (number | null)[] = [
    ...Array.from({ length: primerDia }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View style={styles.fondo}>
        <View style={[styles.tarjeta, { backgroundColor: theme.bgPrimary }]}>
          <View style={styles.encabezado}>
            <Text style={[styles.titulo, { color: theme.textPrimary }]}>
              {mes.etiquetaCompleta}
            </Text>
            <TouchableOpacity onPress={onCerrar}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filaSemana}>
            {INICIALES_SEMANA.map((d, i) => (
              <Text
                key={`${d}-${i}`}
                style={[styles.iniSemana, { color: theme.textSecondary }]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {celdas.map((dia, idx) => {
              if (dia === null) {
                return <View key={`vacio-${idx}`} style={styles.celda} />;
              }
              const activo = dia === diaSeleccionado;
              return (
                <TouchableOpacity
                  key={dia}
                  style={[
                    styles.celda,
                    styles.celdaDia,
                    activo && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => onSeleccionarDia(dia)}
                >
                  <Text
                    style={{
                      color: activo ? "#FFFFFF" : theme.textPrimary,
                      fontSize: 13,
                      fontWeight: activo ? "800" : "500",
                    }}
                  >
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.btnTodoMes, { backgroundColor: theme.bgSecondary }]}
            onPress={onVerTodoElMes}
          >
            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Ver todo el mes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  tarjeta: { width: "100%", borderRadius: 18, padding: 18 },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titulo: { fontSize: 16, fontWeight: "800" },
  filaSemana: { flexDirection: "row", marginBottom: 6 },
  iniSemana: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  celda: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  celdaDia: { borderRadius: 10 },
  btnTodoMes: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
});
