// src/features/finanzas/components/MetodoPagoBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { MetodoPago } from "../types";

interface MetodoConfig {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const METODO_CFG: Record<MetodoPago, MetodoConfig> = {
  efectivo: {
    label: "Efectivo",
    color: "#22C55E",
    icon: "cash-outline",
  },
  qr: {
    label: "QR",
    color: "#3B82F6",
    icon: "qr-code-outline",
  },
  transferencia: {
    label: "Transferencia",
    color: "#8B5CF6",
    icon: "swap-horizontal-outline",
  },
};

interface Props {
  theme: any;
  porMetodo: Record<MetodoPago, number>;
  total: number;
}

export function MetodoPagoBar({ theme, porMetodo, total }: Props) {
  const metodos = (Object.keys(METODO_CFG) as MetodoPago[]).filter(
    (m) => porMetodo[m] > 0,
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card || theme.bgSecondary || "#1E293B",
          borderColor: theme.border || "rgba(150, 150, 150, 0.15)",
        },
      ]}
    >
      {/* Cabecera Autocontenida de la Tarjeta */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Ingresos por Método de Pago
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Desglose y participación actual
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text
            style={[styles.headerTotalLabel, { color: theme.textSecondary }]}
          >
            Total
          </Text>
          <Text style={[styles.headerTotal, { color: theme.textPrimary }]}>
            Bs {total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Lista de Barras Horizontales Múltiples */}
      <View style={styles.listContainer}>
        {metodos.map((m) => {
          const monto = porMetodo[m];
          const porcentaje = total > 0 ? (monto / total) * 100 : 0;
          const config = METODO_CFG[m];

          return (
            <View key={m} style={styles.row}>
              {/* Fila superior: Icono, Etiqueta y Monto/Porcentaje */}
              <View style={styles.rowInfo}>
                <View style={styles.labelGroup}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: config.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={config.icon}
                      size={14}
                      color={config.color}
                    />
                  </View>
                  <Text
                    style={[styles.labelText, { color: theme.textPrimary }]}
                  >
                    {config.label}
                  </Text>
                </View>

                <View style={styles.valuesGroup}>
                  <Text
                    style={[styles.amountText, { color: theme.textPrimary }]}
                  >
                    Bs {monto.toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.percentText, { color: theme.textSecondary }]}
                  >
                    ({Math.round(porcentaje)}%)
                  </Text>
                </View>
              </View>

              {/* Barra horizontal individual */}
              <View
                style={[
                  styles.track,
                  {
                    backgroundColor: theme.border || "rgba(150, 150, 150, 0.2)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${porcentaje}%`,
                      backgroundColor: config.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTotalLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  headerTotal: {
    fontSize: 15,
    fontWeight: "800",
  },
  listContainer: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  valuesGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 11,
    fontWeight: "500",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
