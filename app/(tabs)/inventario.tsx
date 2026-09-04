import { FormularioFilamento } from "@/components/forms/FormularioFilamento";
import { FormularioImpresora } from "@/components/forms/FormularioImpresora";
import {
  DetalleFilamentoModal,
  DetalleImpresoraModal,
  FilamentoCard,
  ImpresoraCard,
  InventarioHeader,
  PiezaCard,
} from "@/features/inventario/components";
import { useInventario } from "@/features/inventario/hooks/useInventario";
import type {
  Filamento,
  Impresora,
  SubPestanaInventario,
} from "@/features/inventario/types";
import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InventarioScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<SubPestanaInventario>("filamentos");

  const {
    filamentos,
    piezas,
    impresoras,
    cargando,
    error,
    filamentosBajoStock,
    agregarFilamento,
    agregarImpresora,
  } = useInventario();

  const [filamentoActivo, setFilamentoActivo] = useState<Filamento | null>(
    null,
  );
  const [impresoraActiva, setImpresoraActiva] = useState<Impresora | null>(
    null,
  );
  const [formFilamentoVisible, setFormFilamentoVisible] = useState(false);
  const [formImpresoraVisible, setFormImpresoraVisible] = useState(false);

  const manejarAbrirFormFilamento = () => {
    setFormFilamentoVisible(true);
  };

  const manejarAbrirFormImpresora = () => {
    setFormImpresoraVisible(true);
  };

  if (cargando) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          styles.centrado,
          { backgroundColor: theme.bgPrimary },
        ]}
      >
        <ActivityIndicator color={theme.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          styles.centrado,
          { backgroundColor: theme.bgPrimary },
        ]}
      >
        <Text style={{ color: theme.textSecondary }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <InventarioHeader
        theme={theme}
        tab={tab}
        onCambiarTab={setTab}
        totalFilamentos={filamentos.length}
        totalImpresoras={impresoras.length}
        filamentosBajoStock={filamentosBajoStock}
        onAgregarFilamento={manejarAbrirFormFilamento}
        onAgregarImpresora={manejarAbrirFormImpresora}
        //esAdmin={true}
      />

      {tab === "filamentos" && (
        <FlatList
          key="grid-filamentos-2col"
          data={filamentos}
          numColumns={2}
          keyExtractor={(f) => f.id}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aún no registraste filamentos en esta empresa.
            </Text>
          }
          renderItem={({ item }) => (
            <FilamentoCard
              theme={theme}
              filamento={item}
              onPress={() => setFilamentoActivo(item)}
            />
          )}
        />
      )}

      {tab === "piezas" && (
        <FlatList
          key="list-piezas-1col"
          data={piezas}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aún no tienes piezas en stock.
            </Text>
          }
          renderItem={({ item }) => <PiezaCard theme={theme} pieza={item} />}
        />
      )}

      {tab === "impresoras" && (
        <FlatList
          key="list-impresoras-1col"
          data={impresoras}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aún no registraste impresoras en esta empresa.
            </Text>
          }
          renderItem={({ item }) => (
            <ImpresoraCard
              theme={theme}
              impresora={item}
              onPress={() => setImpresoraActiva(item)}
            />
          )}
        />
      )}

      <DetalleFilamentoModal
        filamento={filamentoActivo}
        theme={theme}
        onClose={() => setFilamentoActivo(null)}
      />
      <DetalleImpresoraModal
        impresora={impresoraActiva}
        theme={theme}
        onClose={() => setImpresoraActiva(null)}
      />

      <FormularioFilamento
        visible={formFilamentoVisible}
        theme={theme}
        onClose={() => setFormFilamentoVisible(false)}
        onGuardar={async (nuevo) => {
          try {
            await agregarFilamento(nuevo);
            setFormFilamentoVisible(false);
          } catch (err) {
            Alert.alert(
              "Error",
              err instanceof Error ? err.message : "No se pudo guardar",
            );
          }
        }}
      />
      <FormularioImpresora
        visible={formImpresoraVisible}
        theme={theme}
        onClose={() => setFormImpresoraVisible(false)}
        onGuardar={async (nueva) => {
          try {
            await agregarImpresora(nueva);
            setFormImpresoraVisible(false);
          } catch (err) {
            Alert.alert(
              "Error",
              err instanceof Error ? err.message : "No se pudo guardar",
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centrado: { alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12 },
  columnWrapper: {
    justifyContent: "space-between",
    gap: 12,
  },
  emptyText: { textAlign: "center", marginTop: 24 },
});