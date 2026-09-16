//app/(tabs)/inventario.tsx
import {
  DetalleFilamentoModal,
  DetalleImpresoraModal,
  FilamentoCard,
  ImpresoraCard,
  InventarioHeader,
  PiezaCard,
} from "@/features/inventario/components";
import { FormularioFilamento } from "@/features/inventario/components/forms/FormularioFilamento";
import { FormularioImpresora } from "@/features/inventario/components/forms/FormularioImpresora";
import { useInventario } from "@/features/inventario/hooks/useInventario";
import type {
  Filamento,
  Impresora,
  SubPestanaInventario,
} from "@/features/inventario/types";
import { useTheme } from "@/hooks/useTheme";
import { useMemo, useState } from "react";
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

  // Estado de búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Estados de filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMarcaFilamento, setFiltroMarcaFilamento] = useState("");
  const [filtroMarcaImpresora, setFiltroMarcaImpresora] = useState("");
  const [filtroModeloImpresora, setFiltroModeloImpresora] = useState("");

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

  // Modales de detalle
  const [filamentoActivo, setFilamentoActivo] = useState<Filamento | null>(
    null,
  );
  const [impresoraActiva, setImpresoraActiva] = useState<Impresora | null>(
    null,
  );

  // Modales de formularios de creación
  const [formFilamentoVisible, setFormFilamentoVisible] = useState(false);
  const [formImpresoraVisible, setFormImpresoraVisible] = useState(false);

  // Opciones dinámicas para dropdowns extraídas directamente del estado
  const tiposDisponibles = useMemo(() => {
    return Array.from(new Set(filamentos.map((f) => f.tipo))).filter(Boolean);
  }, [filamentos]);

  const marcasFilamentoDisponibles = useMemo(() => {
    return Array.from(new Set(filamentos.map((f) => f.marca))).filter(Boolean);
  }, [filamentos]);

  const marcasImpresoraDisponibles = useMemo(() => {
    return Array.from(new Set(impresoras.map((i) => i.marca))).filter(Boolean);
  }, [impresoras]);

  const modelosImpresoraDisponibles = useMemo(() => {
    return Array.from(new Set(impresoras.map((i) => i.modelo))).filter(Boolean);
  }, [impresoras]);

  // Filtrado de Filamentos
  const filamentosFiltrados = useMemo(() => {
    return filamentos.filter((f) => {
      const coincideBusqueda =
        !busqueda.trim() ||
        f.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.color.toLowerCase().includes(busqueda.toLowerCase());

      const coincideTipo =
        !filtroTipo || f.tipo.toLowerCase() === filtroTipo.toLowerCase();
      const coincideMarca =
        !filtroMarcaFilamento ||
        f.marca.toLowerCase() === filtroMarcaFilamento.toLowerCase();

      return coincideBusqueda && coincideTipo && coincideMarca;
    });
  }, [filamentos, busqueda, filtroTipo, filtroMarcaFilamento]);

  // Filtrado de Impresoras
  const impresorasFiltradas = useMemo(() => {
    return impresoras.filter((i) => {
      const coincideBusqueda =
        !busqueda.trim() ||
        i.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.modelo.toLowerCase().includes(busqueda.toLowerCase());

      const coincideMarca =
        !filtroMarcaImpresora ||
        i.marca.toLowerCase() === filtroMarcaImpresora.toLowerCase();
      const coincideModelo =
        !filtroModeloImpresora ||
        i.modelo.toLowerCase() === filtroModeloImpresora.toLowerCase();

      return coincideBusqueda && coincideMarca && coincideModelo;
    });
  }, [impresoras, busqueda, filtroMarcaImpresora, filtroModeloImpresora]);

  // Filtrado de Piezas
  const piezasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return piezas;
    const q = busqueda.toLowerCase();
    return piezas.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [piezas, busqueda]);

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
        onCambiarTab={(nuevaTab) => {
          setTab(nuevaTab);
          setBusqueda("");
        }}
        totalFilamentos={filamentos.length}
        totalImpresoras={impresoras.length}
        filamentosBajoStock={filamentosBajoStock}
        impresorasLista={impresoras}
        onSelectFilamento={(filamento) => setFilamentoActivo(filamento)}
        onSelectImpresora={(impresora) => setImpresoraActiva(impresora)}
        onAgregarFilamento={() => setFormFilamentoVisible(true)}
        onAgregarImpresora={() => setFormImpresoraVisible(true)}
        busqueda={busqueda}
        onCambiarBusqueda={setBusqueda}
        filtroTipo={filtroTipo}
        onCambiarFiltroTipo={setFiltroTipo}
        tiposDisponibles={tiposDisponibles}
        filtroMarcaFilamento={filtroMarcaFilamento}
        onCambiarFiltroMarcaFilamento={setFiltroMarcaFilamento}
        marcasFilamentoDisponibles={marcasFilamentoDisponibles}
        filtroMarcaImpresora={filtroMarcaImpresora}
        onCambiarFiltroMarcaImpresora={setFiltroMarcaImpresora}
        marcasImpresoraDisponibles={marcasImpresoraDisponibles}
        filtroModeloImpresora={filtroModeloImpresora}
        onCambiarFiltroModeloImpresora={setFiltroModeloImpresora}
        modelosImpresoraDisponibles={modelosImpresoraDisponibles}
      />

      {tab === "filamentos" && (
        <FlatList
          key="grid-filamentos-2col"
          data={filamentosFiltrados}
          numColumns={2}
          keyExtractor={(f) => f.id}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {busqueda.length > 0 || filtroTipo || filtroMarcaFilamento
                ? "No se encontraron filamentos con los criterios seleccionados."
                : "Aún no registraste filamentos en el inventario."}
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
          key="list-piezas-2col"
          data={piezasFiltradas}
          numColumns={2}
          keyExtractor={(p) => p.id}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {busqueda.length > 0
                ? "No se encontraron piezas con esa búsqueda."
                : "Aún no tienes piezas registradas en stock."}
            </Text>
          }
          renderItem={({ item }) => <PiezaCard theme={theme} pieza={item} />}
        />
      )}

      {tab === "impresoras" && (
        <FlatList
          key="grid-impresoras-2col"
          data={impresorasFiltradas}
          numColumns={2}
          keyExtractor={(i) => i.id}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {busqueda.length > 0 ||
              filtroMarcaImpresora ||
              filtroModeloImpresora
                ? "No se encontraron impresoras con los criterios seleccionados."
                : "Aún no registraste impresoras en el inventario."}
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
  emptyText: { textAlign: "center", marginTop: 24, fontSize: 13 },
});
