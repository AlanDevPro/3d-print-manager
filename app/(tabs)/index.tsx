// app/(tabs)/index.tsx (o donde tengas InicioScreen)
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — luego vendrán de Supabase (tabla modelos / cotizaciones)
// ---------------------------------------------------------------------------
type EstadoImpresora = "ocupada" | "libre";

const IMPRESORAS_MOCK: {
  id: string;
  nombre: string;
  estado: EstadoImpresora;
}[] = [
  { id: "1", nombre: "Ender 3 V2", estado: "ocupada" },
  { id: "2", nombre: "Ender 3 V2 #2", estado: "libre" },
  { id: "3", nombre: "Prusa MK3S", estado: "ocupada" },
  { id: "4", nombre: "Anycubic Kobra", estado: "libre" },
];

const PEDIDOS_URGENTES_MOCK = [
  {
    id: "p1",
    cliente: "María Fernández",
    pieza: "Soporte celular x4",
    entrega: "Hoy, 18:00",
  },
  {
    id: "p2",
    cliente: "Carlos Mamani",
    pieza: "Figura decorativa",
    entrega: "Mañana, 10:00",
  },
];

type Modelo = {
  id: string;
  nombre: string;
  imagenUrl: string | null;
  tiempoHoras: number;
  pesoGramos: number;
  precioSugerido: number;
  material: string;
  color: string;
  notas: string;
};

const CATALOGO_MOCK: Modelo[] = [
  {
    id: "m1",
    nombre: "Soporte para celular",
    imagenUrl: null,
    tiempoHoras: 2.5,
    pesoGramos: 38,
    precioSugerido: 25,
    material: "PLA",
    color: "Negro",
    notas: "Diseño plegable, base antideslizante.",
  },
  {
    id: "m2",
    nombre: "Maceta geométrica",
    imagenUrl: null,
    tiempoHoras: 5,
    pesoGramos: 120,
    precioSugerido: 60,
    material: "PETG",
    color: "Blanco",
    notas: "Incluye plato base y orificio de drenaje.",
  },
  {
    id: "m3",
    nombre: "Figura articulada dragón",
    imagenUrl: null,
    tiempoHoras: 8.5,
    pesoGramos: 210,
    precioSugerido: 140,
    material: "PLA+",
    color: "Rojo",
    notas: "Impresión sin soportes, articulaciones móviles.",
  },
  {
    id: "m4",
    nombre: "Organizador de escritorio",
    imagenUrl: null,
    tiempoHoras: 4,
    pesoGramos: 95,
    precioSugerido: 45,
    material: "PLA",
    color: "Gris",
    notas: "3 compartimentos, encastre sin tornillos.",
  },
];

export default function InicioScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const nombre =
    user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email ?? "usuario";

  const [busqueda, setBusqueda] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo | null>(
    null,
  );

  const impresorasOcupadas = IMPRESORAS_MOCK.filter(
    (i) => i.estado === "ocupada",
  ).length;
  const impresorasLibres = IMPRESORAS_MOCK.length - impresorasOcupadas;

  const catalogoFiltrado = useMemo(() => {
    if (!busqueda.trim()) return CATALOGO_MOCK;
    const q = busqueda.trim().toLowerCase();
    return CATALOGO_MOCK.filter((m) => m.nombre.toLowerCase().includes(q));
  }, [busqueda]);

  const handleCotizarNuevamente = (modelo: Modelo) => {
    // TODO: navegar al módulo Cotizar precargando los datos de `modelo`
    setModeloSeleccionado(null);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <FlatList
        data={catalogoFiltrado}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Saludo */}
            <View style={styles.saludoRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saludo, { color: theme.textSecondary }]}>
                  ¡Bienvenido de nuevo!
                </Text>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  {nombre} 👋
                </Text>
              </View>
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: theme.primary + "22" },
                ]}
              >
                <Ionicons name="person" size={20} color={theme.primary} />
              </View>
            </View>

            {/* Buscador */}
            <View
              style={[styles.searchBox, { backgroundColor: theme.bgSecondary }]}
            >
              <Ionicons name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Buscar modelo en tu catálogo..."
                placeholderTextColor={theme.textSecondary}
                value={busqueda}
                onChangeText={setBusqueda}
              />
              {busqueda.length > 0 && (
                <TouchableOpacity onPress={() => setBusqueda("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Accesos rápidos */}
            <View style={styles.accesosRow}>
              <View
                style={[
                  styles.accesoCard,
                  { backgroundColor: theme.bgSecondary },
                ]}
              >
                <View style={styles.accesoHeader}>
                  <Ionicons
                    name="print-outline"
                    size={18}
                    color={theme.primary}
                  />
                  <Text
                    style={[styles.accesoTitulo, { color: theme.textPrimary }]}
                  >
                    Impresoras
                  </Text>
                </View>
                <View style={styles.accesoStatsRow}>
                  <EstadoPill
                    color="#EF4444"
                    label={`${impresorasOcupadas} ocupadas`}
                  />
                  <EstadoPill
                    color="#22C55E"
                    label={`${impresorasLibres} libres`}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.accesoCard,
                  { backgroundColor: theme.bgSecondary },
                ]}
              >
                <View style={styles.accesoHeader}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#F59E0B"
                  />
                  <Text
                    style={[styles.accesoTitulo, { color: theme.textPrimary }]}
                  >
                    Pedidos urgentes
                  </Text>
                </View>
                {PEDIDOS_URGENTES_MOCK.slice(0, 2).map((p) => (
                  <Text
                    key={p.id}
                    numberOfLines={1}
                    style={[styles.pedidoLinea, { color: theme.textSecondary }]}
                  >
                    • {p.pieza} — {p.entrega}
                  </Text>
                ))}
                {PEDIDOS_URGENTES_MOCK.length === 0 && (
                  <Text
                    style={[styles.pedidoLinea, { color: theme.textSecondary }]}
                  >
                    Sin pedidos urgentes 🎉
                  </Text>
                )}
              </View>
            </View>

            {/* Título catálogo */}
            <View style={styles.catalogoHeaderRow}>
              <Text
                style={[styles.catalogoTitulo, { color: theme.textPrimary }]}
              >
                Catálogo de impresiones
              </Text>
              <Text
                style={[
                  styles.catalogoContador,
                  { color: theme.textSecondary },
                ]}
              >
                {catalogoFiltrado.length} modelos
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ModeloCard
            modelo={item}
            theme={theme}
            onPress={() => setModeloSeleccionado(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="cube-outline"
              size={32}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No se encontraron modelos para "{busqueda}"
            </Text>
          </View>
        }
      />

      <DetalleModeloModal
        modelo={modeloSeleccionado}
        theme={theme}
        onClose={() => setModeloSeleccionado(null)}
        onCotizar={handleCotizarNuevamente}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function EstadoPill({ color, label }: { color: string; label: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + "1A" }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ModeloCard({
  modelo,
  theme,
  onPress,
}: {
  modelo: Modelo;
  theme: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.cardImagen, { backgroundColor: theme.bgPrimary }]}>
        {modelo.imagenUrl ? (
          <Image
            source={{ uri: modelo.imagenUrl }}
            style={styles.cardImagenReal}
          />
        ) : (
          <Ionicons name="cube-outline" size={30} color={theme.textSecondary} />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text
          style={[styles.cardNombre, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {modelo.nombre}
        </Text>

        <View style={styles.cardInfoRow}>
          <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {modelo.tiempoHoras} h
          </Text>
          <Text
            style={[styles.cardInfoDivider, { color: theme.textSecondary }]}
          >
            ·
          </Text>
          <Ionicons
            name="layers-outline"
            size={12}
            color={theme.textSecondary}
          />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {modelo.pesoGramos} g
          </Text>
        </View>

        <Text style={[styles.cardPrecio, { color: theme.primary }]}>
          Bs {modelo.precioSugerido.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DetalleModeloModal({
  modelo,
  theme,
  onClose,
  onCotizar,
}: {
  modelo: Modelo | null;
  theme: any;
  onClose: () => void;
  onCotizar: (m: Modelo) => void;
}) {
  return (
    <Modal
      visible={!!modelo}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {modelo && (
            <>
              <View style={styles.modalHandle} />

              <View
                style={[
                  styles.modalImagen,
                  { backgroundColor: theme.bgSecondary },
                ]}
              >
                {modelo.imagenUrl ? (
                  <Image
                    source={{ uri: modelo.imagenUrl }}
                    style={styles.modalImagenReal}
                  />
                ) : (
                  <Ionicons
                    name="cube-outline"
                    size={48}
                    color={theme.textSecondary}
                  />
                )}
              </View>

              <Text style={[styles.modalNombre, { color: theme.textPrimary }]}>
                {modelo.nombre}
              </Text>

              <View style={styles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  icono="time-outline"
                  label="Tiempo de impresión"
                  valor={`${modelo.tiempoHoras} h`}
                />
                <DetalleItem
                  theme={theme}
                  icono="layers-outline"
                  label="Peso de filamento"
                  valor={`${modelo.pesoGramos} g`}
                />
                <DetalleItem
                  theme={theme}
                  icono="color-palette-outline"
                  label="Material / Color"
                  valor={`${modelo.material} · ${modelo.color}`}
                />
                <DetalleItem
                  theme={theme}
                  icono="pricetag-outline"
                  label="Precio sugerido"
                  valor={`Bs ${modelo.precioSugerido.toFixed(2)}`}
                  destacado
                />
              </View>

              {!!modelo.notas && (
                <View style={styles.modalNotas}>
                  <Text
                    style={[
                      styles.modalNotasLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Notas
                  </Text>
                  <Text
                    style={[
                      styles.modalNotasTexto,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {modelo.notas}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.cotizarBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.9}
                onPress={() => onCotizar(modelo)}
              >
                <Ionicons name="calculator-outline" size={18} color="#fff" />
                <Text style={styles.cotizarBtnText}>
                  Cotizar este modelo nuevamente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
                <Text
                  style={[styles.cerrarBtnText, { color: theme.textSecondary }]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetalleItem({
  theme,
  icono,
  label,
  valor,
  destacado,
}: {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <View style={[styles.detalleItem, { backgroundColor: theme.bgSecondary }]}>
      <Ionicons
        name={icono}
        size={16}
        color={destacado ? theme.primary : theme.textSecondary}
      />
      <Text style={[styles.detalleLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.detalleValor,
          { color: destacado ? theme.primary : theme.textPrimary },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },

  // Saludo
  saludoRow: { flexDirection: "row", alignItems: "center" },
  saludo: { fontSize: 13, fontWeight: "500" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 2 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Buscador
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Accesos rápidos
  accesosRow: { flexDirection: "row", gap: 10 },
  accesoCard: { flex: 1, borderRadius: 14, padding: 12, gap: 8 },
  accesoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  accesoTitulo: { fontSize: 13, fontWeight: "700" },
  accesoStatsRow: { gap: 6 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillLabel: { fontSize: 11, fontWeight: "700" },
  pedidoLinea: { fontSize: 11, lineHeight: 15 },

  // Catálogo header
  catalogoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  catalogoTitulo: { fontSize: 16, fontWeight: "700" },
  catalogoContador: { fontSize: 12 },

  // Grid cards
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  card: { flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  cardImagen: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImagenReal: { width: "100%", height: "100%" },
  cardBody: { padding: 10, gap: 4 },
  cardNombre: { fontSize: 13, fontWeight: "700" },
  cardInfoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  cardInfoText: { fontSize: 11 },
  cardInfoDivider: { fontSize: 11, marginHorizontal: 2 },
  cardPrecio: { fontSize: 14, fontWeight: "800", marginTop: 2 },

  // Empty state
  emptyState: { alignItems: "center", gap: 8, paddingTop: 48 },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: 24 },

  // Modal detalle
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalImagen: {
    height: 150,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalImagenReal: { width: "100%", height: "100%" },
  modalNombre: { fontSize: 19, fontWeight: "800" },
  modalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detalleItem: {
    width: "47%",
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  detalleLabel: { fontSize: 11 },
  detalleValor: { fontSize: 15, fontWeight: "700" },
  modalNotas: { gap: 4 },
  modalNotasLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalNotasTexto: { fontSize: 13, lineHeight: 19 },
  cotizarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  cotizarBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cerrarBtn: { alignItems: "center", paddingVertical: 6 },
  cerrarBtnText: { fontSize: 13, fontWeight: "600" },
});
