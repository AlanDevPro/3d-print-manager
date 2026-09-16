// src/features/inventario/components/PiezaCard.tsx
import { StyleSheet, Text, View } from "react-native";
import { sharedStyles } from "../styles/sharedStyles";
import type { PiezaStock } from "../types";

type Props = {
  theme: any;
  pieza: PiezaStock;
};

export function PiezaCard({ theme, pieza }: Props) {
  return (
    <View style={[sharedStyles.card, { backgroundColor: theme.bgSecondary }]}>
      <View style={sharedStyles.filaTop}>
        <View style={{ flex: 1 }}>
          <Text style={[sharedStyles.cardTitulo, { color: theme.textPrimary }]}>
            {pieza.nombre}
          </Text>
          <Text
            style={[sharedStyles.cardSubtitulo, { color: theme.textSecondary }]}
          >
            Impresa el {pieza.nombre}
          </Text>
        </View>
        <View
          style={[
            styles.piezaBadge,
            { backgroundColor: pieza.nombre ? "#F59E0B1A" : "#22C55E1A" },
          ]}
        >
          <Text
            style={[
              styles.piezaBadgeText,
              { color: pieza.nombre ? "#F59E0B" : "#22C55E" },
            ]}
          >
            {pieza.nombre ? "Espera recolección" : "Disponible"}
          </Text>
        </View>
      </View>

      <View style={sharedStyles.filaInfo}>
        <Text
          style={[sharedStyles.filaInfoTexto, { color: theme.textPrimary }]}
        >
          Cantidad: {pieza.cantidad}
        </Text>
        <Text style={[sharedStyles.filaInfoTexto, { color: theme.primary }]}>
          Bs {pieza.precioVenta.toFixed(2)}
        </Text>
      </View>
      {pieza.nombre && pieza.cantidad && (
        <Text style={[styles.piezaCliente, { color: theme.textSecondary }]}>
          Reservada para: {pieza.cantidad}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  piezaBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  piezaBadgeText: { fontSize: 11, fontWeight: "700" },
  piezaCliente: { fontSize: 12, marginTop: -2 },
});
