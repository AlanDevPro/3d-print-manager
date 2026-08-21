// app/(tabs)/pedidos.tsx
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type EstadoPedido = "pendiente" | "en_impresion" | "listo" | "entregado";
type EstadoPago = "sin_pagar" | "anticipo" | "pagado";
type MetodoPago = "transferencia" | "efectivo" | "qr";
type TipoEnvio = "recogida" | "domicilio" | "transporte";

type Pedido = {
  id: string;
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
    notas: string;
  };
  pieza: string;
  estado: EstadoPedido;
  fechaEntrega: string;
  pago: {
    estado: EstadoPago;
    metodo: MetodoPago;
    anticipoPorcentaje?: number;
    total: number;
  };
  envio: {
    tipo: TipoEnvio;
    costo: number;
    tracking: string;
    checklist: { id: string; label: string; hecho: boolean }[];
  };
};

// ---------------------------------------------------------------------------
// Config visual por estado
// ---------------------------------------------------------------------------
const ESTADOS: { key: EstadoPedido; label: string; color: string }[] = [
  { key: "pendiente", label: "Pendiente", color: "#F59E0B" },
  { key: "en_impresion", label: "En Impresión", color: "#3B82F6" },
  { key: "listo", label: "Listo para Entrega", color: "#8B5CF6" },
  { key: "entregado", label: "Entregado", color: "#22C55E" },
];

const PAGO_CONFIG: Record<EstadoPago, { label: string; color: string }> = {
  sin_pagar: { label: "Sin pagar", color: "#EF4444" },
  anticipo: { label: "Anticipo", color: "#F59E0B" },
  pagado: { label: "Pagado", color: "#22C55E" },
};

const METODO_LABEL: Record<MetodoPago, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  qr: "QR",
};

const ENVIO_CONFIG: Record<
  TipoEnvio,
  { label: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  recogida: { label: "Recogida local", icono: "storefront-outline" },
  domicilio: { label: "Envío a domicilio", icono: "bicycle-outline" },
  transporte: { label: "Empresa de transporte", icono: "bus-outline" },
};

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — luego vendrán de Supabase (tabla pedidos)
// ---------------------------------------------------------------------------
const PEDIDOS_MOCK: Pedido[] = [
  {
    id: "ped1",
    cliente: {
      nombre: "María Fernández",
      telefono: "+591 700 12345",
      direccion: "Calle Bolívar #123, Sucre",
      notas: "Prefiere entrega por la tarde.",
    },
    pieza: "Soporte celular x4",
    estado: "en_impresion",
    fechaEntrega: "Hoy, 18:00",
    pago: {
      estado: "anticipo",
      metodo: "qr",
      anticipoPorcentaje: 50,
      total: 100,
    },
    envio: {
      tipo: "domicilio",
      costo: 10,
      tracking: "",
      checklist: [
        { id: "c1", label: "Pieza verificada sin defectos", hecho: true },
        { id: "c2", label: "Empaque protegido", hecho: false },
        { id: "c3", label: "Comprobante de pago adjunto", hecho: false },
      ],
    },
  },
  {
    id: "ped2",
    cliente: {
      nombre: "Carlos Mamani",
      telefono: "+591 701 98765",
      direccion: "Retiro en taller",
      notas: "",
    },
    pieza: "Figura decorativa dragón",
    estado: "listo",
    fechaEntrega: "Mañana, 10:00",
    pago: { estado: "pagado", metodo: "efectivo", total: 140 },
    envio: {
      tipo: "recogida",
      costo: 0,
      tracking: "",
      checklist: [
        { id: "c1", label: "Pieza verificada sin defectos", hecho: true },
        { id: "c2", label: "Empaque protegido", hecho: true },
        { id: "c3", label: "Comprobante de pago adjunto", hecho: true },
      ],
    },
  },
  {
    id: "ped3",
    cliente: {
      nombre: "Lucía Rojas",
      telefono: "+591 702 55443",
      direccion: "Av. Venezuela #45",
      notas: "Cliente frecuente, aplicar 10% descuento.",
    },
    pieza: "Maceta geométrica x2",
    estado: "pendiente",
    fechaEntrega: "23/08, 15:00",
    pago: { estado: "sin_pagar", metodo: "transferencia", total: 120 },
    envio: {
      tipo: "transporte",
      costo: 25,
      tracking: "TR-88234",
      checklist: [
        { id: "c1", label: "Pieza verificada sin defectos", hecho: false },
        { id: "c2", label: "Empaque protegido", hecho: false },
        { id: "c3", label: "Comprobante de pago adjunto", hecho: false },
      ],
    },
  },
  {
    id: "ped4",
    cliente: {
      nombre: "Jorge Vargas",
      telefono: "+591 703 11223",
      direccion: "Zona Central, Sucre",
      notas: "",
    },
    pieza: "Organizador de escritorio",
    estado: "entregado",
    fechaEntrega: "18/08, 12:00",
    pago: { estado: "pagado", metodo: "qr", total: 45 },
    envio: {
      tipo: "domicilio",
      costo: 8,
      tracking: "",
      checklist: [
        { id: "c1", label: "Pieza verificada sin defectos", hecho: true },
        { id: "c2", label: "Empaque protegido", hecho: true },
        { id: "c3", label: "Comprobante de pago adjunto", hecho: true },
      ],
    },
  },
];

export default function PedidosScreen() {
  const { theme } = useTheme();
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_MOCK);
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);

  const conteos = useMemo(() => {
    const base: Record<string, number> = { todos: pedidos.length };
    ESTADOS.forEach(
      (e) => (base[e.key] = pedidos.filter((p) => p.estado === e.key).length),
    );
    return base;
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    let lista =
      filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (p) =>
          p.cliente.nombre.toLowerCase().includes(q) ||
          p.pieza.toLowerCase().includes(q),
      );
    }
    return lista;
  }, [pedidos, filtro, busqueda]);

  const actualizarPedido = (id: string, cambios: Partial<Pedido>) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    );
    setPedidoActivo((prev) =>
      prev && prev.id === id ? { ...prev, ...cambios } : prev,
    );
  };

  const toggleChecklistItem = (pedido: Pedido, itemId: string) => {
    const nuevoChecklist = pedido.envio.checklist.map((c) =>
      c.id === itemId ? { ...c, hecho: !c.hecho } : c,
    );
    actualizarPedido(pedido.id, {
      envio: { ...pedido.envio, checklist: nuevoChecklist },
    });
  };

  const cambiarEstado = (pedido: Pedido, nuevoEstado: EstadoPedido) => {
    actualizarPedido(pedido.id, { estado: nuevoEstado });
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Pedidos
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {conteos.todos} pedidos en total
        </Text>

        {/* Buscador */}
        <View
          style={[styles.searchBox, { backgroundColor: theme.bgSecondary }]}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Buscar por cliente o pieza..."
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

        {/* Filtros de estado */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosRow}
        >
          <FiltroChip
            label={`Todos (${conteos.todos})`}
            activo={filtro === "todos"}
            color={theme.primary}
            theme={theme}
            onPress={() => setFiltro("todos")}
          />
          {ESTADOS.map((e) => (
            <FiltroChip
              key={e.key}
              label={`${e.label} (${conteos[e.key] ?? 0})`}
              activo={filtro === e.key}
              color={e.color}
              theme={theme}
              onPress={() => setFiltro(e.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PedidoCard
            theme={theme}
            pedido={item}
            onPress={() => setPedidoActivo(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="file-tray-outline"
              size={32}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No hay pedidos en esta categoría
            </Text>
          </View>
        }
      />

      <DetallePedidoModal
        pedido={pedidoActivo}
        theme={theme}
        onClose={() => setPedidoActivo(null)}
        onCambiarEstado={cambiarEstado}
        onToggleChecklist={toggleChecklistItem}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function FiltroChip({
  label,
  activo,
  color,
  theme,
  onPress,
}: {
  label: string;
  activo: boolean;
  color: string;
  theme: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: activo ? color : theme.bgSecondary,
          borderColor: activo ? color : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: activo ? "#fff" : theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PedidoCard({
  theme,
  pedido,
  onPress,
}: {
  theme: any;
  pedido: Pedido;
  onPress: () => void;
}) {
  const estadoCfg = ESTADOS.find((e) => e.key === pedido.estado)!;
  const pagoCfg = PAGO_CONFIG[pedido.pago.estado];
  const checklistHecho = pedido.envio.checklist.filter((c) => c.hecho).length;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.cardCliente, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {pedido.cliente.nombre}
          </Text>
          <Text
            style={[styles.cardPieza, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {pedido.pieza}
          </Text>
        </View>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: estadoCfg.color + "1A" },
          ]}
        >
          <View
            style={[styles.estadoDot, { backgroundColor: estadoCfg.color }]}
          />
          <Text style={[styles.estadoBadgeText, { color: estadoCfg.color }]}>
            {estadoCfg.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.cardInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={theme.textSecondary}
          />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {pedido.fechaEntrega}
          </Text>
        </View>
        <View style={styles.cardInfoItem}>
          <Ionicons
            name={ENVIO_CONFIG[pedido.envio.tipo].icono}
            size={13}
            color={theme.textSecondary}
          />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {ENVIO_CONFIG[pedido.envio.tipo].label}
          </Text>
        </View>
        <View style={styles.cardInfoItem}>
          <Ionicons
            name="checkbox-outline"
            size={13}
            color={theme.textSecondary}
          />
          <Text style={[styles.cardInfoText, { color: theme.textSecondary }]}>
            {checklistHecho}/{pedido.envio.checklist.length}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooterRow}>
        <View
          style={[styles.pagoBadge, { backgroundColor: pagoCfg.color + "1A" }]}
        >
          <Text style={[styles.pagoBadgeText, { color: pagoCfg.color }]}>
            {pagoCfg.label}
            {pedido.pago.estado === "anticipo"
              ? ` (${pedido.pago.anticipoPorcentaje}%)`
              : ""}
          </Text>
        </View>
        <Text style={[styles.cardTotal, { color: theme.primary }]}>
          Bs {pedido.pago.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DetallePedidoModal({
  pedido,
  theme,
  onClose,
  onCambiarEstado,
  onToggleChecklist,
}: {
  pedido: Pedido | null;
  theme: any;
  onClose: () => void;
  onCambiarEstado: (p: Pedido, estado: EstadoPedido) => void;
  onToggleChecklist: (p: Pedido, itemId: string) => void;
}) {
  return (
    <Modal
      visible={!!pedido}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {pedido && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />

              <Text style={[styles.modalPieza, { color: theme.textPrimary }]}>
                {pedido.pieza}
              </Text>
              <Text style={[styles.modalFecha, { color: theme.textSecondary }]}>
                Entrega: {pedido.fechaEntrega}
              </Text>

              {/* Selector de estado */}
              <View style={styles.modalEstadosRow}>
                {ESTADOS.map((e) => (
                  <TouchableOpacity
                    key={e.key}
                    onPress={() => onCambiarEstado(pedido, e.key)}
                    style={[
                      styles.estadoOpcion,
                      {
                        backgroundColor:
                          pedido.estado === e.key ? e.color : theme.bgSecondary,
                        borderColor: e.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoOpcionText,
                        { color: pedido.estado === e.key ? "#fff" : e.color },
                      ]}
                    >
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cliente */}
              <SeccionModal
                titulo="Cliente"
                icono="person-outline"
                theme={theme}
              >
                <FilaDetalle
                  theme={theme}
                  label="Nombre"
                  valor={pedido.cliente.nombre}
                />
                <FilaDetalle
                  theme={theme}
                  label="Teléfono"
                  valor={pedido.cliente.telefono}
                />
                <FilaDetalle
                  theme={theme}
                  label="Dirección"
                  valor={pedido.cliente.direccion}
                />
                {!!pedido.cliente.notas && (
                  <FilaDetalle
                    theme={theme}
                    label="Notas"
                    valor={pedido.cliente.notas}
                  />
                )}
                <View style={styles.accionesClienteRow}>
                  <AccionBoton
                    theme={theme}
                    icono="call-outline"
                    label="Llamar"
                    color="#3B82F6"
                  />
                  <AccionBoton
                    theme={theme}
                    icono="logo-whatsapp"
                    label="WhatsApp"
                    color="#25D366"
                  />
                </View>
              </SeccionModal>

              {/* Pago */}
              <SeccionModal
                titulo="Control de Pago"
                icono="card-outline"
                theme={theme}
              >
                <View style={styles.pagoEstadoRow}>
                  {(Object.keys(PAGO_CONFIG) as EstadoPago[]).map((key) => (
                    <View
                      key={key}
                      style={[
                        styles.pagoEstadoChip,
                        {
                          backgroundColor:
                            pedido.pago.estado === key
                              ? PAGO_CONFIG[key].color
                              : theme.bgSecondary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pagoEstadoChipText,
                          {
                            color:
                              pedido.pago.estado === key
                                ? "#fff"
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {PAGO_CONFIG[key].label}
                      </Text>
                    </View>
                  ))}
                </View>
                <FilaDetalle
                  theme={theme}
                  label="Método"
                  valor={METODO_LABEL[pedido.pago.metodo]}
                />
                <FilaDetalle
                  theme={theme}
                  label="Total"
                  valor={`Bs ${pedido.pago.total.toFixed(2)}`}
                  destacado
                />
              </SeccionModal>

              {/* Envío */}
              <SeccionModal
                titulo="Detalles de Envío"
                icono="cube-outline"
                theme={theme}
              >
                <FilaDetalle
                  theme={theme}
                  label="Tipo"
                  valor={ENVIO_CONFIG[pedido.envio.tipo].label}
                />
                <FilaDetalle
                  theme={theme}
                  label="Costo de envío"
                  valor={
                    pedido.envio.costo > 0
                      ? `Bs ${pedido.envio.costo.toFixed(2)}`
                      : "Gratis"
                  }
                />
                {!!pedido.envio.tracking && (
                  <FilaDetalle
                    theme={theme}
                    label="Tracking"
                    valor={pedido.envio.tracking}
                  />
                )}

                <Text
                  style={[
                    styles.checklistTitulo,
                    { color: theme.textSecondary },
                  ]}
                >
                  Checklist de verificación
                </Text>
                {pedido.envio.checklist.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checklistItem}
                    onPress={() => onToggleChecklist(pedido, item.id)}
                  >
                    <Ionicons
                      name={item.hecho ? "checkbox" : "square-outline"}
                      size={20}
                      color={item.hecho ? "#22C55E" : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.checklistLabel,
                        {
                          color: item.hecho
                            ? theme.textPrimary
                            : theme.textSecondary,
                          textDecorationLine: item.hecho
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </SeccionModal>

              <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
                <Text
                  style={[styles.cerrarBtnText, { color: theme.textSecondary }]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SeccionModal({
  titulo,
  icono,
  theme,
  children,
}: {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.modalSeccion}>
      <View style={styles.modalSeccionHeader}>
        <Ionicons name={icono} size={16} color={theme.primary} />
        <Text style={[styles.modalSeccionTitulo, { color: theme.textPrimary }]}>
          {titulo}
        </Text>
      </View>
      <View
        style={[
          styles.modalSeccionCard,
          { backgroundColor: theme.bgSecondary },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function FilaDetalle({
  theme,
  label,
  valor,
  destacado,
}: {
  theme: any;
  label: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <View style={styles.filaDetalle}>
      <Text style={[styles.filaLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.filaValor,
          {
            color: destacado ? theme.primary : theme.textPrimary,
            fontWeight: destacado ? "800" : "600",
          },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function AccionBoton({
  theme,
  icono,
  label,
  color,
}: {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.accionBoton, { backgroundColor: color + "1A" }]}
    >
      <Ionicons name={icono} size={15} color={color} />
      <Text style={[styles.accionBotonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: -6 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  filtrosRow: { gap: 8, paddingRight: 16, paddingBottom: 4 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 12, fontWeight: "700" },

  listContent: { padding: 16, gap: 12 },

  // Card
  card: { borderRadius: 16, padding: 14, gap: 10 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardCliente: { fontSize: 15, fontWeight: "700" },
  cardPieza: { fontSize: 12.5, marginTop: 2 },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  estadoDot: { width: 6, height: 6, borderRadius: 3 },
  estadoBadgeText: { fontSize: 10.5, fontWeight: "800" },

  cardBottomRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  cardInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardInfoText: { fontSize: 11.5 },

  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  pagoBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pagoBadgeText: { fontSize: 11, fontWeight: "700" },
  cardTotal: { fontSize: 15, fontWeight: "800" },

  // Empty
  emptyState: { alignItems: "center", gap: 8, paddingTop: 48 },
  emptyText: { fontSize: 13, textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalPieza: { fontSize: 19, fontWeight: "800" },
  modalFecha: { fontSize: 12.5, marginTop: 2, marginBottom: 14 },

  modalEstadosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  estadoOpcion: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  estadoOpcionText: { fontSize: 11.5, fontWeight: "700" },

  modalSeccion: { gap: 8, marginBottom: 16 },
  modalSeccionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  modalSeccionTitulo: { fontSize: 14.5, fontWeight: "700" },
  modalSeccionCard: { borderRadius: 14, padding: 14, gap: 10 },

  filaDetalle: { gap: 2 },
  filaLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  filaValor: { fontSize: 14.5 },

  accionesClienteRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  accionBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accionBotonText: { fontSize: 12.5, fontWeight: "700" },

  pagoEstadoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pagoEstadoChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pagoEstadoChipText: { fontSize: 11.5, fontWeight: "700" },

  checklistTitulo: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  checklistLabel: { fontSize: 13.5, flex: 1 },

  cerrarBtn: { alignItems: "center", paddingVertical: 14 },
  cerrarBtnText: { fontSize: 13, fontWeight: "600" },
});
