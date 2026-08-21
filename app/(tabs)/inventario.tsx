import { FormularioFilamento } from "@/components/forms/FormularioFilamento";
import { FormularioImpresora } from "@/components/forms/FormularioImpresora";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type Material = "PLA" | "PETG" | "ABS" | "TPU" | "Resina";

export type Filamento = {
  id: string;
  marca: string;
  material: Material;
  color: string;
  colorHex: string;
  stockGramos: number;
  capacidadRolloGramos: number;
  costoCompra: number;
  proveedor: string;
  fechaCompra: string;
  umbralBajoStock: number; // gramos
};

export type PiezaStock = {
  id: string;
  nombre: string;
  cantidad: number;
  asignada: boolean;
  cliente?: string;
  fechaImpresion: string;
  precioVenta: number;
};

export type EstadoImpresora = "imprimiendo" | "inactiva" | "mantenimiento";

export type Impresora = {
  id: string;
  modelo: string;
  marca: string;
  consumoWatts: number;
  costoAdquisicion: number;
  fechaAdquisicion: string;
  horasUsoTotal: number;
  vidaUtilHoras: number;
  estado: EstadoImpresora;
  pedidoActual?: string;
};

// ---------------------------------------------------------------------------
// Config visual
// ---------------------------------------------------------------------------
const ESTADO_IMPRESORA_CFG: Record<
  EstadoImpresora,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  imprimiendo: {
    label: "Imprimiendo",
    color: "#3B82F6",
    icono: "print-outline",
  },
  inactiva: {
    label: "Inactiva",
    color: "#9CA3AF",
    icono: "pause-circle-outline",
  },
  mantenimiento: {
    label: "En Mantenimiento",
    color: "#F59E0B",
    icono: "build-outline",
  },
};

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — luego vendrán de Supabase
// ---------------------------------------------------------------------------
const FILAMENTOS_MOCK: Filamento[] = [
  {
    id: "f1",
    marca: "eSun",
    material: "PLA",
    color: "Negro",
    colorHex: "#111111",
    stockGramos: 450,
    capacidadRolloGramos: 1000,
    costoCompra: 85,
    proveedor: "Import3D Bolivia",
    fechaCompra: "02/08/2026",
    umbralBajoStock: 200,
  },
  {
    id: "f2",
    marca: "Polymaker",
    material: "PETG",
    color: "Blanco",
    colorHex: "#F5F5F5",
    stockGramos: 120,
    capacidadRolloGramos: 1000,
    costoCompra: 110,
    proveedor: "Filamentos SRL",
    fechaCompra: "15/07/2026",
    umbralBajoStock: 200,
  },
  {
    id: "f3",
    marca: "eSun",
    material: "PLA",
    color: "Rojo",
    colorHex: "#DC2626",
    stockGramos: 780,
    capacidadRolloGramos: 1000,
    costoCompra: 85,
    proveedor: "Import3D Bolivia",
    fechaCompra: "10/08/2026",
    umbralBajoStock: 200,
  },
  {
    id: "f4",
    marca: "Sunlu",
    material: "TPU",
    color: "Gris",
    colorHex: "#6B7280",
    stockGramos: 60,
    capacidadRolloGramos: 500,
    costoCompra: 130,
    proveedor: "Filamentos SRL",
    fechaCompra: "20/06/2026",
    umbralBajoStock: 100,
  },
];

const PIEZAS_STOCK_MOCK: PiezaStock[] = [
  {
    id: "p1",
    nombre: "Soporte celular (negro)",
    cantidad: 6,
    asignada: false,
    fechaImpresion: "18/08/2026",
    precioVenta: 25,
  },
  {
    id: "p2",
    nombre: "Maceta geométrica (blanco)",
    cantidad: 1,
    asignada: true,
    cliente: "Carlos Mamani",
    fechaImpresion: "19/08/2026",
    precioVenta: 60,
  },
  {
    id: "p3",
    nombre: "Figura dragón (rojo)",
    cantidad: 2,
    asignada: false,
    fechaImpresion: "15/08/2026",
    precioVenta: 140,
  },
];

const IMPRESORAS_MOCK: Impresora[] = [
  {
    id: "i1",
    modelo: "Ender 3 V2",
    marca: "Creality",
    consumoWatts: 220,
    costoAdquisicion: 1400,
    fechaAdquisicion: "10/01/2025",
    horasUsoTotal: 2100,
    vidaUtilHoras: 8000,
    estado: "imprimiendo",
    pedidoActual: "Soporte celular x4",
  },
  {
    id: "i2",
    modelo: "Ender 3 V2 #2",
    marca: "Creality",
    consumoWatts: 220,
    costoAdquisicion: 1400,
    fechaAdquisicion: "22/05/2025",
    horasUsoTotal: 950,
    vidaUtilHoras: 8000,
    estado: "inactiva",
  },
  {
    id: "i3",
    modelo: "Prusa MK3S",
    marca: "Prusa Research",
    consumoWatts: 250,
    costoAdquisicion: 5200,
    fechaAdquisicion: "03/03/2024",
    horasUsoTotal: 6800,
    vidaUtilHoras: 10000,
    estado: "mantenimiento",
  },
  {
    id: "i4",
    modelo: "Anycubic Kobra",
    marca: "Anycubic",
    consumoWatts: 190,
    costoAdquisicion: 900,
    fechaAdquisicion: "14/11/2025",
    horasUsoTotal: 300,
    vidaUtilHoras: 7000,
    estado: "inactiva",
  },
];

type SubPestana = "filamentos" | "piezas" | "impresoras";

export default function InventarioScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<SubPestana>("filamentos");

  const [filamentos, setFilamentos] = useState(FILAMENTOS_MOCK);
  const [piezas] = useState(PIEZAS_STOCK_MOCK);
  const [impresoras, setImpresoras] = useState(IMPRESORAS_MOCK);

  const [filamentoActivo, setFilamentoActivo] = useState<Filamento | null>(
    null,
  );
  const [impresoraActiva, setImpresoraActiva] = useState<Impresora | null>(
    null,
  );

  const [formFilamentoVisible, setFormFilamentoVisible] = useState(false);
  const [formImpresoraVisible, setFormImpresoraVisible] = useState(false);

  const filamentosBajoStock = filamentos.filter(
    (f) => f.stockGramos <= f.umbralBajoStock,
  ).length;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Inventario
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {filamentos.length} filamentos · {impresoras.length} impresoras
          {filamentosBajoStock > 0
            ? ` · ${filamentosBajoStock} con bajo stock`
            : ""}
        </Text>

        {/* Botones de acción rápida */}
        <View style={styles.accionesRow}>
          <TouchableOpacity
            style={[styles.accionBtn, { backgroundColor: theme.primary }]}
            onPress={() => setFormFilamentoVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.accionBtnText}>Filamento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.accionBtn, { backgroundColor: theme.bgSecondary }]}
            onPress={() => setFormImpresoraVisible(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.accionBtnText, { color: theme.primary }]}>
              Impresora
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-pestañas */}
        <View style={[styles.tabsRow, { backgroundColor: theme.bgSecondary }]}>
          <TabBtn
            label="Filamentos"
            activo={tab === "filamentos"}
            theme={theme}
            onPress={() => setTab("filamentos")}
          />
          <TabBtn
            label="Piezas en Stock"
            activo={tab === "piezas"}
            theme={theme}
            onPress={() => setTab("piezas")}
          />
          <TabBtn
            label="Impresoras"
            activo={tab === "impresoras"}
            theme={theme}
            onPress={() => setTab("impresoras")}
          />
        </View>
      </View>

      {/* Contenido por pestaña */}
      {tab === "filamentos" && (
        <FlatList
          data={filamentos}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.listContent}
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
          data={piezas}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PiezaCard theme={theme} pieza={item} />}
        />
      )}

      {tab === "impresoras" && (
        <FlatList
          data={impresoras}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ImpresoraCard
              theme={theme}
              impresora={item}
              onPress={() => setImpresoraActiva(item)}
            />
          )}
        />
      )}

      {/* Modales de detalle */}
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

      {/* Formularios */}
      <FormularioFilamento
        visible={formFilamentoVisible}
        theme={theme}
        onClose={() => setFormFilamentoVisible(false)}
        onGuardar={(nuevo) => {
          setFilamentos((prev) => [
            { ...nuevo, id: `f${prev.length + 1}` },
            ...prev,
          ]);
          setFormFilamentoVisible(false);
        }}
      />
      <FormularioImpresora
        visible={formImpresoraVisible}
        theme={theme}
        onClose={() => setFormImpresoraVisible(false)}
        onGuardar={(nueva) => {
          setImpresoras((prev) => [
            { ...nueva, id: `i${prev.length + 1}` },
            ...prev,
          ]);
          setFormImpresoraVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-pestañas
// ---------------------------------------------------------------------------
function TabBtn({
  label,
  activo,
  theme,
  onPress,
}: {
  label: string;
  activo: boolean;
  theme: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, activo && { backgroundColor: theme.bgPrimary }]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabBtnText,
          {
            color: activo ? theme.primary : theme.textSecondary,
            fontWeight: activo ? "700" : "500",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Cards — Filamentos
// ---------------------------------------------------------------------------
function FilamentoCard({
  theme,
  filamento,
  onPress,
}: {
  theme: any;
  filamento: Filamento;
  onPress: () => void;
}) {
  const porcentaje = Math.min(
    100,
    Math.round((filamento.stockGramos / filamento.capacidadRolloGramos) * 100),
  );
  const bajoStock = filamento.stockGramos <= filamento.umbralBajoStock;
  const colorBarra = bajoStock
    ? "#EF4444"
    : porcentaje < 50
      ? "#F59E0B"
      : "#22C55E";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.filamentoTopRow}>
        <View
          style={[styles.colorSwatch, { backgroundColor: filamento.colorHex }]}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>
            {filamento.material} {filamento.color}
          </Text>
          <Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>
            {filamento.marca}
          </Text>
        </View>
        {bajoStock && (
          <View style={styles.alertaBadge}>
            <Ionicons name="warning" size={11} color="#fff" />
            <Text style={styles.alertaBadgeText}>Bajo stock</Text>
          </View>
        )}
      </View>

      <View style={styles.barraFondo}>
        <View
          style={[
            styles.barraRelleno,
            { width: `${porcentaje}%`, backgroundColor: colorBarra },
          ]}
        />
      </View>
      <View style={styles.filamentoInfoRow}>
        <Text style={[styles.filamentoStockText, { color: theme.textPrimary }]}>
          {filamento.stockGramos} g restantes
        </Text>
        <Text
          style={[styles.filamentoStockText, { color: theme.textSecondary }]}
        >
          {porcentaje}% del rollo
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Cards — Piezas en stock
// ---------------------------------------------------------------------------
function PiezaCard({ theme, pieza }: { theme: any; pieza: PiezaStock }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <View style={styles.filamentoTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>
            {pieza.nombre}
          </Text>
          <Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>
            Impresa el {pieza.fechaImpresion}
          </Text>
        </View>
        <View
          style={[
            styles.piezaBadge,
            { backgroundColor: pieza.asignada ? "#F59E0B1A" : "#22C55E1A" },
          ]}
        >
          <Text
            style={[
              styles.piezaBadgeText,
              { color: pieza.asignada ? "#F59E0B" : "#22C55E" },
            ]}
          >
            {pieza.asignada ? "Espera recolección" : "Disponible"}
          </Text>
        </View>
      </View>

      <View style={styles.filamentoInfoRow}>
        <Text style={[styles.filamentoStockText, { color: theme.textPrimary }]}>
          Cantidad: {pieza.cantidad}
        </Text>
        <Text style={[styles.filamentoStockText, { color: theme.primary }]}>
          Bs {pieza.precioVenta.toFixed(2)}
        </Text>
      </View>
      {pieza.asignada && pieza.cliente && (
        <Text style={[styles.piezaCliente, { color: theme.textSecondary }]}>
          Reservada para: {pieza.cliente}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Cards — Impresoras
// ---------------------------------------------------------------------------
function ImpresoraCard({
  theme,
  impresora,
  onPress,
}: {
  theme: any;
  impresora: Impresora;
  onPress: () => void;
}) {
  const cfg = ESTADO_IMPRESORA_CFG[impresora.estado];
  const vidaUtilPct = Math.min(
    100,
    Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100),
  );
  const colorVida =
    vidaUtilPct > 85 ? "#EF4444" : vidaUtilPct > 60 ? "#F59E0B" : "#22C55E";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.bgSecondary }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.filamentoTopRow}>
        <View
          style={[styles.impresoraIcono, { backgroundColor: cfg.color + "1A" }]}
        >
          <Ionicons name={cfg.icono} size={18} color={cfg.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>
            {impresora.modelo}
          </Text>
          <Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>
            {impresora.marca}
          </Text>
        </View>
        <View
          style={[styles.estadoBadge, { backgroundColor: cfg.color + "1A" }]}
        >
          <Text style={[styles.estadoBadgeText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {impresora.pedidoActual && (
        <Text
          style={[styles.impresoraPedido, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          Imprimiendo: {impresora.pedidoActual}
        </Text>
      )}

      <View style={styles.barraFondo}>
        <View
          style={[
            styles.barraRelleno,
            { width: `${vidaUtilPct}%`, backgroundColor: colorVida },
          ]}
        />
      </View>
      <View style={styles.filamentoInfoRow}>
        <Text style={[styles.filamentoStockText, { color: theme.textPrimary }]}>
          {impresora.horasUsoTotal.toLocaleString()} h de uso
        </Text>
        <Text
          style={[styles.filamentoStockText, { color: theme.textSecondary }]}
        >
          {vidaUtilPct}% de vida útil
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Modal — Detalle Filamento
// ---------------------------------------------------------------------------
function DetalleFilamentoModal({
  filamento,
  theme,
  onClose,
}: {
  filamento: Filamento | null;
  theme: any;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!filamento}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {filamento && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeaderRow}>
                <View
                  style={[
                    styles.colorSwatchLg,
                    { backgroundColor: filamento.colorHex },
                  ]}
                />
                <View>
                  <Text
                    style={[styles.modalTitulo, { color: theme.textPrimary }]}
                  >
                    {filamento.material} {filamento.color}
                  </Text>
                  <Text
                    style={[styles.modalSub, { color: theme.textSecondary }]}
                  >
                    {filamento.marca} · {filamento.proveedor}
                  </Text>
                </View>
              </View>

              <View style={styles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  label="Stock restante"
                  valor={`${filamento.stockGramos} g`}
                  destacado
                />
                <DetalleItem
                  theme={theme}
                  label="Capacidad del rollo"
                  valor={`${filamento.capacidadRolloGramos} g`}
                />
                <DetalleItem
                  theme={theme}
                  label="Costo por rollo"
                  valor={`Bs ${filamento.costoCompra.toFixed(2)}`}
                />
                <DetalleItem
                  theme={theme}
                  label="Fecha de compra"
                  valor={filamento.fechaCompra}
                />
              </View>

              {filamento.stockGramos <= filamento.umbralBajoStock && (
                <View style={styles.avisoBajoStock}>
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text style={styles.avisoBajoStockTexto}>
                    Stock por debajo del umbral ({filamento.umbralBajoStock} g).
                    Considera reponer este rollo.
                  </Text>
                </View>
              )}

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

// ---------------------------------------------------------------------------
// Modal — Detalle Impresora
// ---------------------------------------------------------------------------
function DetalleImpresoraModal({
  impresora,
  theme,
  onClose,
}: {
  impresora: Impresora | null;
  theme: any;
  onClose: () => void;
}) {
  const vidaUtilPct = impresora
    ? Math.min(
        100,
        Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) * 100),
      )
    : 0;
  const horasRestantes = impresora
    ? Math.max(0, impresora.vidaUtilHoras - impresora.horasUsoTotal)
    : 0;
  const cfg = impresora ? ESTADO_IMPRESORA_CFG[impresora.estado] : null;

  return (
    <Modal
      visible={!!impresora}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {impresora && cfg && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeaderRow}>
                <View
                  style={[
                    styles.impresoraIcono,
                    { backgroundColor: cfg.color + "1A" },
                  ]}
                >
                  <Ionicons name={cfg.icono} size={22} color={cfg.color} />
                </View>
                <View>
                  <Text
                    style={[styles.modalTitulo, { color: theme.textPrimary }]}
                  >
                    {impresora.modelo}
                  </Text>
                  <Text
                    style={[styles.modalSub, { color: theme.textSecondary }]}
                  >
                    {impresora.marca}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.estadoBadge,
                  {
                    backgroundColor: cfg.color + "1A",
                    alignSelf: "flex-start",
                    marginBottom: 12,
                  },
                ]}
              >
                <Text style={[styles.estadoBadgeText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>

              <View style={styles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  label="Vida útil restante"
                  valor={`${horasRestantes.toLocaleString()} h`}
                  destacado
                />
                <DetalleItem
                  theme={theme}
                  label="Uso acumulado"
                  valor={`${impresora.horasUsoTotal.toLocaleString()} h`}
                />
                <DetalleItem
                  theme={theme}
                  label="Consumo"
                  valor={`${impresora.consumoWatts} W`}
                />
                <DetalleItem
                  theme={theme}
                  label="Costo adquisición"
                  valor={`Bs ${impresora.costoAdquisicion.toFixed(2)}`}
                />
                <DetalleItem
                  theme={theme}
                  label="Fecha adquisición"
                  valor={impresora.fechaAdquisicion}
                />
                <DetalleItem
                  theme={theme}
                  label="Vida útil total"
                  valor={`${impresora.vidaUtilHoras.toLocaleString()} h`}
                />
              </View>

              <Text
                style={[styles.checklistTitulo, { color: theme.textSecondary }]}
              >
                Desgaste
              </Text>
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    {
                      width: `${vidaUtilPct}%`,
                      backgroundColor:
                        vidaUtilPct > 85
                          ? "#EF4444"
                          : vidaUtilPct > 60
                            ? "#F59E0B"
                            : "#22C55E",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.filamentoStockText,
                  { color: theme.textSecondary, marginTop: 4 },
                ]}
              >
                {vidaUtilPct}% de su vida útil consumida
              </Text>

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

function DetalleItem({
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
    <View style={[styles.detalleItem, { backgroundColor: theme.bgSecondary }]}>
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
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: -6 },

  accionesRow: { flexDirection: "row", gap: 10 },
  accionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  accionBtnText: { color: "#fff", fontSize: 12.5, fontWeight: "700" },

  tabsRow: { flexDirection: "row", borderRadius: 12, padding: 4 },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  tabBtnText: { fontSize: 12.5 },

  listContent: { padding: 16, gap: 12 },

  card: { borderRadius: 16, padding: 14, gap: 10 },
  filamentoTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00000022",
  },
  colorSwatchLg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00000022",
  },
  cardTitulo: { fontSize: 14.5, fontWeight: "700" },
  cardSubtitulo: { fontSize: 12, marginTop: 1 },

  alertaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertaBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  barraFondo: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00000014",
    overflow: "hidden",
  },
  barraRelleno: { height: 7, borderRadius: 4 },

  filamentoInfoRow: { flexDirection: "row", justifyContent: "space-between" },
  filamentoStockText: { fontSize: 12, fontWeight: "600" },

  piezaBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  piezaBadgeText: { fontSize: 11, fontWeight: "700" },
  piezaCliente: { fontSize: 12, marginTop: -2 },

  impresoraIcono: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  impresoraPedido: { fontSize: 12, marginTop: -4 },
  estadoBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  estadoBadgeText: { fontSize: 11, fontWeight: "700" },

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
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalTitulo: { fontSize: 18, fontWeight: "800" },
  modalSub: { fontSize: 12.5, marginTop: 2 },

  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  detalleItem: { width: "47%", borderRadius: 12, padding: 10, gap: 4 },
  detalleLabel: { fontSize: 11 },
  detalleValor: { fontSize: 15, fontWeight: "700" },

  avisoBajoStock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EF444414",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  avisoBajoStockTexto: {
    color: "#EF4444",
    fontSize: 12,
    flex: 1,
    fontWeight: "600",
  },

  checklistTitulo: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 14,
  },

  cerrarBtn: { alignItems: "center", paddingVertical: 14 },
  cerrarBtnText: { fontSize: 13, fontWeight: "600" },
});
