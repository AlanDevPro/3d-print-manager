// src/features/pedidos/components/PedidosHeader.tsx
// Compone todo lo que va arriba de la lista. Se pasa como ListHeaderComponent
// del FlatList en la pantalla — así el scroll es uno solo (mejor rendimiento
// que anidar ScrollViews).

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EstadoPedido, Pedido } from "../types";
import { FiltrosRow } from "./FiltrosRow";
import { KpisRow } from "./KpisRow";
import { SearchBox } from "./SearchBox";
import { UrgentesSection } from "./UrgentesSection";

interface PedidosHeaderProps {
  theme: any;
  totalPedidos: number;
  kpis: {
    activos: number;
    cobroPendiente: number;
    entregasHoy: number;
    vencidos: number;
  };
  pedidosUrgentes: Pedido[];
  onSeleccionarPedido: (pedido: Pedido) => void;
  busqueda: string;
  onCambiarBusqueda: (texto: string) => void;
  filtro: EstadoPedido | "todos";
  conteos: Record<string, number>;
  onCambiarFiltro: (filtro: EstadoPedido | "todos") => void;
}

export function PedidosHeader({
  theme,
  totalPedidos,
  kpis,
  pedidosUrgentes,
  onSeleccionarPedido,
  busqueda,
  onCambiarBusqueda,
  filtro,
  conteos,
  onCambiarFiltro,
}: PedidosHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Pedidos</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {totalPedidos} pedidos en total
      </Text>

      <KpisRow theme={theme} kpis={kpis} />

      <UrgentesSection
        theme={theme}
        pedidos={pedidosUrgentes}
        onSeleccionar={onSeleccionarPedido}
      />

      <SearchBox
        theme={theme}
        value={busqueda}
        onChangeText={onCambiarBusqueda}
        placeholder="Buscar por cliente, pieza o código..."
      />

      <FiltrosRow
        theme={theme}
        filtro={filtro}
        conteos={conteos}
        onSeleccionar={onCambiarFiltro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: -8 },
});
