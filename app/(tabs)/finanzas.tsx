// app/(tabs)/finanzas.tsx
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
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
type MetodoPago = "efectivo" | "qr";
type CategoriaEgreso =
  | "material"
  | "energia"
  | "repuestos_reimpresion"
  | "mantenimiento"
  | "otro";
type Periodo = "semana" | "mes";

type Ingreso = {
  id: string;
  concepto: string;
  cliente: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
};

type Egreso = {
  id: string;
  concepto: string;
  categoria: CategoriaEgreso;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
};

// ---------------------------------------------------------------------------
// Config visual
// ---------------------------------------------------------------------------
const CATEGORIA_CFG: Record<
  CategoriaEgreso,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  material: {
    label: "Material / Filamento",
    color: "#3B82F6",
    icono: "layers-outline",
  },
  energia: {
    label: "Energía eléctrica",
    color: "#F59E0B",
    icono: "flash-outline",
  },
  repuestos_reimpresion: {
    label: "Repuestos / Reimpresión",
    color: "#EF4444",
    icono: "build-outline",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "#8B5CF6",
    icono: "construct-outline",
  },
  otro: {
    label: "Otro",
    color: "#6B7280",
    icono: "ellipsis-horizontal-circle-outline",
  },
};

const METODO_CFG: Record<
  MetodoPago,
  { label: string; color: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  efectivo: { label: "Efectivo", color: "#22C55E", icono: "cash-outline" },
  qr: { label: "QR", color: "#3B82F6", icono: "qr-code-outline" },
};

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — luego vendrán de Supabase (tablas ingresos/egresos)
// ---------------------------------------------------------------------------
const INGRESOS_MOCK: Ingreso[] = [
  {
    id: "in1",
    concepto: "Figura decorativa dragón",
    cliente: "Carlos Mamani",
    monto: 140,
    metodo: "efectivo",
    fecha: "18/08/2026",
  },
  {
    id: "in2",
    concepto: "Organizador de escritorio",
    cliente: "Jorge Vargas",
    monto: 45,
    metodo: "qr",
    fecha: "18/08/2026",
  },
  {
    id: "in3",
    concepto: "Soporte celular x4 (anticipo)",
    cliente: "María Fernández",
    monto: 50,
    metodo: "qr",
    fecha: "19/08/2026",
  },
  {
    id: "in4",
    concepto: "Maceta geométrica x2",
    cliente: "Lucía Rojas",
    monto: 60,
    metodo: "efectivo",
    fecha: "19/08/2026",
  },
  {
    id: "in5",
    concepto: "Piezas varias (venta directa)",
    cliente: "Cliente mostrador",
    monto: 80,
    metodo: "qr",
    fecha: "20/08/2026",
  },
];

const EGRESOS_MOCK: Egreso[] = [
  {
    id: "eg1",
    concepto: "Rollo PLA Negro eSun",
    categoria: "material",
    monto: 85,
    metodo: "efectivo",
    fecha: "02/08/2026",
  },
  {
    id: "eg2",
    concepto: "Rollo PETG Blanco Polymaker",
    categoria: "material",
    monto: 110,
    metodo: "qr",
    fecha: "15/07/2026",
  },
  {
    id: "eg3",
    concepto: "Consumo eléctrico agosto",
    categoria: "energia",
    monto: 95,
    metodo: "efectivo",
    fecha: "31/08/2026",
  },
  {
    id: "eg4",
    concepto: "Boquilla + fusible Ender 3",
    categoria: "repuestos_reimpresion",
    monto: 40,
    metodo: "efectivo",
    fecha: "10/08/2026",
  },
  {
    id: "eg5",
    concepto: "Reimpresión pieza fallida (warping)",
    categoria: "repuestos_reimpresion",
    monto: 18,
    metodo: "efectivo",
    fecha: "14/08/2026",
  },
  {
    id: "eg6",
    concepto: "Mantenimiento Prusa MK3S",
    categoria: "mantenimiento",
    monto: 120,
    metodo: "qr",
    fecha: "05/08/2026",
  },
];

// Gramos impresos y horas usadas en el periodo (para métricas clave) — mock
const GRAMOS_IMPRESOS_MES = 4200;
const INGRESOS_ULTIMOS_6_MESES = [420, 580, 510, 690, 750, 610]; // Bs, mock
const MESES_LABEL = ["Mar", "Abr", "May", "Jun", "Jul", "Ago"];

type Tab = "resumen" | "ingresos" | "egresos";

export default function FinanzasScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>("resumen");
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const [ingresos, setIngresos] = useState(INGRESOS_MOCK);
  const [egresos, setEgresos] = useState(EGRESOS_MOCK);
  const [formVisible, setFormVisible] = useState(false);

  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
  const totalEgresos = egresos.reduce((s, e) => s + e.monto, 0);
  const utilidadNeta = totalIngresos - totalEgresos;
  const cobrosPendientes = 150; // mock: suma de saldos pendientes de pedidos activos (Pedidos módulo)

  const porMetodoIngresos = useMemo(() => {
    const efectivo = ingresos
      .filter((i) => i.metodo === "efectivo")
      .reduce((s, i) => s + i.monto, 0);
    const qr = ingresos
      .filter((i) => i.metodo === "qr")
      .reduce((s, i) => s + i.monto, 0);
    return { efectivo, qr };
  }, [ingresos]);

  const porCategoriaEgresos = useMemo(() => {
    const acc: Record<CategoriaEgreso, number> = {
      material: 0,
      energia: 0,
      repuestos_reimpresion: 0,
      mantenimiento: 0,
      otro: 0,
    };
    egresos.forEach((e) => (acc[e.categoria] += e.monto));
    return acc;
  }, [egresos]);

  const costoPromedioGramo =
    GRAMOS_IMPRESOS_MES > 0 ? totalEgresos / GRAMOS_IMPRESOS_MES : 0;
  const margenMedio =
    totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

  const agregarMovimiento = (
    mov:
      | { tipo: "ingreso"; data: Omit<Ingreso, "id"> }
      | { tipo: "egreso"; data: Omit<Egreso, "id"> },
  ) => {
    if (mov.tipo === "ingreso") {
      setIngresos((prev) => [
        { ...mov.data, id: `in${prev.length + 1}` },
        ...prev,
      ]);
    } else {
      setEgresos((prev) => [
        { ...mov.data, id: `eg${prev.length + 1}` },
        ...prev,
      ]);
    }
    setFormVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bgPrimary }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Finanzas
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Salud económica de tu taller
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.registrarBtn, { backgroundColor: theme.primary }]}
            onPress={() => setFormVisible(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.registrarBtnText}>Registrar</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de periodo */}
        <View
          style={[styles.periodoRow, { backgroundColor: theme.bgSecondary }]}
        >
          <PeriodoBtn
            label="Esta semana"
            activo={periodo === "semana"}
            theme={theme}
            onPress={() => setPeriodo("semana")}
          />
          <PeriodoBtn
            label="Este mes"
            activo={periodo === "mes"}
            theme={theme}
            onPress={() => setPeriodo("mes")}
          />
        </View>

        {/* Cards resumen principal */}
        <View style={styles.statsGrid}>
          <StatCard
            theme={theme}
            label="Cobrado"
            valor={`Bs ${totalIngresos.toFixed(2)}`}
            icono="trending-up"
            color="#22C55E"
          />
          <StatCard
            theme={theme}
            label="Cobros pendientes"
            valor={`Bs ${cobrosPendientes.toFixed(2)}`}
            icono="time-outline"
            color="#F59E0B"
          />
          <StatCard
            theme={theme}
            label="Egresos"
            valor={`Bs ${totalEgresos.toFixed(2)}`}
            icono="trending-down"
            color="#EF4444"
          />
          <StatCard
            theme={theme}
            label="Utilidad neta"
            valor={`Bs ${utilidadNeta.toFixed(2)}`}
            icono="wallet-outline"
            color={utilidadNeta >= 0 ? theme.primary : "#EF4444"}
            destacado
          />
        </View>

        {/* Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: theme.bgSecondary }]}>
          <TabBtn
            label="Resumen"
            activo={tab === "resumen"}
            theme={theme}
            onPress={() => setTab("resumen")}
          />
          <TabBtn
            label="Ingresos"
            activo={tab === "ingresos"}
            theme={theme}
            onPress={() => setTab("ingresos")}
          />
          <TabBtn
            label="Egresos"
            activo={tab === "egresos"}
            theme={theme}
            onPress={() => setTab("egresos")}
          />
        </View>

        {/* --- RESUMEN --- */}
        {tab === "resumen" && (
          <>
            {/* Gráfico de barras simple: ingresos últimos 6 meses */}
            <SeccionBloque
              titulo="Ingresos — últimos 6 meses"
              icono="bar-chart-outline"
              theme={theme}
            >
              <View style={styles.chartRow}>
                {INGRESOS_ULTIMOS_6_MESES.map((valor, idx) => {
                  const max = Math.max(...INGRESOS_ULTIMOS_6_MESES);
                  const alturaPct = Math.max(
                    6,
                    Math.round((valor / max) * 100),
                  );
                  const esUltimo = idx === INGRESOS_ULTIMOS_6_MESES.length - 1;
                  return (
                    <View key={idx} style={styles.chartBarWrapper}>
                      <View style={styles.chartBarTrack}>
                        <View
                          style={[
                            styles.chartBar,
                            {
                              height: `${alturaPct}%`,
                              backgroundColor: esUltimo
                                ? theme.primary
                                : theme.primary + "55",
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.chartLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {MESES_LABEL[idx]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </SeccionBloque>

            {/* Métodos de pago */}
            <SeccionBloque
              titulo="Ingresos por método de pago"
              icono="card-outline"
              theme={theme}
            >
              <MetodoPagoBar
                theme={theme}
                efectivo={porMetodoIngresos.efectivo}
                qr={porMetodoIngresos.qr}
                total={totalIngresos}
              />
            </SeccionBloque>

            {/* Desglose egresos por categoría */}
            <SeccionBloque
              titulo="Egresos por categoría"
              icono="pie-chart-outline"
              theme={theme}
            >
              {(Object.keys(porCategoriaEgresos) as CategoriaEgreso[])
                .filter((cat) => porCategoriaEgresos[cat] > 0)
                .sort((a, b) => porCategoriaEgresos[b] - porCategoriaEgresos[a])
                .map((cat) => {
                  const cfg = CATEGORIA_CFG[cat];
                  const pct =
                    totalEgresos > 0
                      ? Math.round(
                          (porCategoriaEgresos[cat] / totalEgresos) * 100,
                        )
                      : 0;
                  return (
                    <View key={cat} style={styles.categoriaFila}>
                      <View style={styles.categoriaFilaHeader}>
                        <Ionicons
                          name={cfg.icono}
                          size={15}
                          color={cfg.color}
                        />
                        <Text
                          style={[
                            styles.categoriaLabel,
                            { color: theme.textPrimary },
                          ]}
                        >
                          {cfg.label}
                        </Text>
                        <Text
                          style={[
                            styles.categoriaMonto,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Bs {porCategoriaEgresos[cat].toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.barraFondo}>
                        <View
                          style={[
                            styles.barraRelleno,
                            { width: `${pct}%`, backgroundColor: cfg.color },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
            </SeccionBloque>

            {/* Métricas clave */}
            <SeccionBloque
              titulo="Métricas clave"
              icono="analytics-outline"
              theme={theme}
            >
              <View style={styles.metricasGrid}>
                <MetricaItem
                  theme={theme}
                  label="Costo promedio por gramo"
                  valor={`Bs ${costoPromedioGramo.toFixed(3)}`}
                />
                <MetricaItem
                  theme={theme}
                  label="Margen medio"
                  valor={`${margenMedio.toFixed(1)}%`}
                  destacado={margenMedio >= 0}
                />
                <MetricaItem
                  theme={theme}
                  label="Gramos impresos (mes)"
                  valor={`${GRAMOS_IMPRESOS_MES.toLocaleString()} g`}
                />
                <MetricaItem
                  theme={theme}
                  label="Ticket promedio"
                  valor={`Bs ${(totalIngresos / Math.max(1, ingresos.length)).toFixed(2)}`}
                />
              </View>
            </SeccionBloque>
          </>
        )}

        {/* --- INGRESOS --- */}
        {tab === "ingresos" && (
          <View style={styles.listaSeccion}>
            {ingresos.map((mov) => (
              <MovimientoFila
                key={mov.id}
                theme={theme}
                tipo="ingreso"
                descripcion={mov.concepto}
                subdescripcion={mov.cliente}
                monto={mov.monto}
                metodo={mov.metodo}
                fecha={mov.fecha}
              />
            ))}
          </View>
        )}

        {/* --- EGRESOS --- */}
        {tab === "egresos" && (
          <View style={styles.listaSeccion}>
            {egresos.map((mov) => (
              <MovimientoFila
                key={mov.id}
                theme={theme}
                tipo="egreso"
                descripcion={mov.concepto}
                subdescripcion={CATEGORIA_CFG[mov.categoria].label}
                monto={mov.monto}
                metodo={mov.metodo}
                fecha={mov.fecha}
                colorCategoria={CATEGORIA_CFG[mov.categoria].color}
                iconoCategoria={CATEGORIA_CFG[mov.categoria].icono}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <RegistrarMovimientoModal
        visible={formVisible}
        theme={theme}
        onClose={() => setFormVisible(false)}
        onGuardar={agregarMovimiento}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function PeriodoBtn({
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
      style={[
        styles.periodoBtn,
        activo && { backgroundColor: theme.bgPrimary },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: activo ? theme.primary : theme.textSecondary,
          fontSize: 12.5,
          fontWeight: activo ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
        style={{
          color: activo ? theme.primary : theme.textSecondary,
          fontSize: 12.5,
          fontWeight: activo ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({
  theme,
  label,
  valor,
  icono,
  color,
  destacado,
}: {
  theme: any;
  label: string;
  valor: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  destacado?: boolean;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.bgSecondary },
        destacado && { borderWidth: 1.5, borderColor: color },
      ]}
    >
      <View style={[styles.statIcono, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icono} size={16} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.statValor,
          { color: destacado ? color : theme.textPrimary },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function SeccionBloque({
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
    <View style={styles.seccionBloque}>
      <View style={styles.seccionHeader}>
        <Ionicons name={icono} size={16} color={theme.primary} />
        <Text style={[styles.seccionTitulo, { color: theme.textPrimary }]}>
          {titulo}
        </Text>
      </View>
      <View
        style={[styles.seccionCard, { backgroundColor: theme.bgSecondary }]}
      >
        {children}
      </View>
    </View>
  );
}

function MetodoPagoBar({
  theme,
  efectivo,
  qr,
  total,
}: {
  theme: any;
  efectivo: number;
  qr: number;
  total: number;
}) {
  const pctEfectivo = total > 0 ? Math.round((efectivo / total) * 100) : 0;
  const pctQr = total > 0 ? 100 - pctEfectivo : 0;
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.metodoBarraDoble}>
        <View
          style={{
            width: `${pctEfectivo}%`,
            backgroundColor: METODO_CFG.efectivo.color,
          }}
        />
        <View
          style={{ width: `${pctQr}%`, backgroundColor: METODO_CFG.qr.color }}
        />
      </View>
      <View style={styles.metodoLeyendaRow}>
        <View style={styles.metodoLeyendaItem}>
          <View
            style={[
              styles.metodoDot,
              { backgroundColor: METODO_CFG.efectivo.color },
            ]}
          />
          <Text
            style={[styles.metodoLeyendaTexto, { color: theme.textPrimary }]}
          >
            Efectivo · Bs {efectivo.toFixed(2)} ({pctEfectivo}%)
          </Text>
        </View>
        <View style={styles.metodoLeyendaItem}>
          <View
            style={[styles.metodoDot, { backgroundColor: METODO_CFG.qr.color }]}
          />
          <Text
            style={[styles.metodoLeyendaTexto, { color: theme.textPrimary }]}
          >
            QR · Bs {qr.toFixed(2)} ({pctQr}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

function MetricaItem({
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
    <View style={[styles.metricaItem, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.metricaLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metricaValor,
          { color: destacado ? theme.primary : theme.textPrimary },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function MovimientoFila({
  theme,
  tipo,
  descripcion,
  subdescripcion,
  monto,
  metodo,
  fecha,
  colorCategoria,
  iconoCategoria,
}: {
  theme: any;
  tipo: "ingreso" | "egreso";
  descripcion: string;
  subdescripcion: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  colorCategoria?: string;
  iconoCategoria?: keyof typeof Ionicons.glyphMap;
}) {
  const color = tipo === "ingreso" ? "#22C55E" : (colorCategoria ?? "#EF4444");
  const icono =
    tipo === "ingreso"
      ? "arrow-down-circle"
      : (iconoCategoria ?? "arrow-up-circle");
  const metodoCfg = METODO_CFG[metodo];

  return (
    <View style={[styles.movFila, { backgroundColor: theme.bgSecondary }]}>
      <View style={[styles.movIcono, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icono as any} size={17} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.movDescripcion, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {descripcion}
        </Text>
        <View style={styles.movSubRow}>
          <Text
            style={[styles.movSub, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {subdescripcion} · {fecha}
          </Text>
        </View>
        <View
          style={[
            styles.metodoTag,
            { backgroundColor: metodoCfg.color + "1A" },
          ]}
        >
          <Ionicons name={metodoCfg.icono} size={10} color={metodoCfg.color} />
          <Text style={[styles.metodoTagText, { color: metodoCfg.color }]}>
            {metodoCfg.label}
          </Text>
        </View>
      </View>
      <Text style={[styles.movMonto, { color }]}>
        {tipo === "ingreso" ? "+" : "-"} Bs {monto.toFixed(2)}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Formulario — registrar Ingreso o Egreso
// ---------------------------------------------------------------------------
function RegistrarMovimientoModal({
  visible,
  theme,
  onClose,
  onGuardar,
}: {
  visible: boolean;
  theme: any;
  onClose: () => void;
  onGuardar: (
    mov:
      | { tipo: "ingreso"; data: Omit<Ingreso, "id"> }
      | { tipo: "egreso"; data: Omit<Egreso, "id"> },
  ) => void;
}) {
  const [tipo, setTipo] = useState<"ingreso" | "egreso">("ingreso");
  const [concepto, setConcepto] = useState("");
  const [referencia, setReferencia] = useState(""); // cliente (ingreso) — no aplica a egreso
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [categoria, setCategoria] = useState<CategoriaEgreso>("material");

  const valido = concepto.trim() && Number(monto) > 0;

  const limpiarYCerrar = () => {
    setConcepto("");
    setReferencia("");
    setMonto("");
    onClose();
  };

  const guardar = () => {
    if (!valido) return;
    const fecha = new Date().toLocaleDateString("es-BO");
    if (tipo === "ingreso") {
      onGuardar({
        tipo: "ingreso",
        data: {
          concepto: concepto.trim(),
          cliente: referencia.trim() || "Cliente mostrador",
          monto: Number(monto),
          metodo,
          fecha,
        },
      });
    } else {
      onGuardar({
        tipo: "egreso",
        data: {
          concepto: concepto.trim(),
          categoria,
          monto: Number(monto),
          metodo,
          fecha,
        },
      });
    }
    limpiarYCerrar();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={limpiarYCerrar}
    >
      <Pressable style={styles.overlay} onPress={limpiarYCerrar}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bgPrimary }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />

            {/* Selector tipo de movimiento */}
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoBtn,
                  {
                    backgroundColor:
                      tipo === "ingreso" ? "#22C55E" : theme.bgSecondary,
                  },
                ]}
                onPress={() => setTipo("ingreso")}
              >
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={16}
                  color={tipo === "ingreso" ? "#fff" : theme.textSecondary}
                />
                <Text
                  style={{
                    color: tipo === "ingreso" ? "#fff" : theme.textSecondary,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Ingreso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoBtn,
                  {
                    backgroundColor:
                      tipo === "egreso" ? "#EF4444" : theme.bgSecondary,
                  },
                ]}
                onPress={() => setTipo("egreso")}
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={16}
                  color={tipo === "egreso" ? "#fff" : theme.textSecondary}
                />
                <Text
                  style={{
                    color: tipo === "egreso" ? "#fff" : theme.textSecondary,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Egreso
                </Text>
              </TouchableOpacity>
            </View>

            <Campo theme={theme} label="Concepto">
              <TextInput
                style={[
                  styles.input,
                  { color: theme.textPrimary, borderColor: theme.bgSecondary },
                ]}
                value={concepto}
                onChangeText={setConcepto}
                placeholder={
                  tipo === "ingreso"
                    ? "Ej. Soporte celular x4"
                    : "Ej. Rollo PLA Negro"
                }
                placeholderTextColor={theme.textSecondary}
              />
            </Campo>

            {tipo === "ingreso" ? (
              <Campo theme={theme} label="Cliente (opcional)">
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.bgSecondary,
                    },
                  ]}
                  value={referencia}
                  onChangeText={setReferencia}
                  placeholder="Ej. María Fernández"
                  placeholderTextColor={theme.textSecondary}
                />
              </Campo>
            ) : (
              <Campo theme={theme} label="Categoría">
                <View style={styles.chipsRow}>
                  {(Object.keys(CATEGORIA_CFG) as CategoriaEgreso[]).map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategoria(cat)}
                        style={[
                          styles.categoriaChip,
                          {
                            backgroundColor:
                              categoria === cat
                                ? CATEGORIA_CFG[cat].color
                                : theme.bgSecondary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={CATEGORIA_CFG[cat].icono}
                          size={13}
                          color={
                            categoria === cat ? "#fff" : theme.textSecondary
                          }
                        />
                        <Text
                          style={{
                            color:
                              categoria === cat ? "#fff" : theme.textSecondary,
                            fontSize: 11.5,
                            fontWeight: "700",
                          }}
                        >
                          {CATEGORIA_CFG[cat].label}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </Campo>
            )}

            <Campo theme={theme} label="Monto (Bs)">
              <TextInput
                style={[
                  styles.input,
                  { color: theme.textPrimary, borderColor: theme.bgSecondary },
                ]}
                value={monto}
                onChangeText={setMonto}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
              />
            </Campo>

            <Campo theme={theme} label="Método de pago">
              <View style={styles.chipsRow}>
                {(Object.keys(METODO_CFG) as MetodoPago[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMetodo(m)}
                    style={[
                      styles.metodoChip,
                      {
                        backgroundColor:
                          metodo === m
                            ? METODO_CFG[m].color
                            : theme.bgSecondary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={METODO_CFG[m].icono}
                      size={14}
                      color={metodo === m ? "#fff" : theme.textSecondary}
                    />
                    <Text
                      style={{
                        color: metodo === m ? "#fff" : theme.textSecondary,
                        fontSize: 12.5,
                        fontWeight: "700",
                      }}
                    >
                      {METODO_CFG[m].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Campo>

            <TouchableOpacity
              style={[
                styles.guardarBtn,
                {
                  backgroundColor: valido
                    ? tipo === "ingreso"
                      ? "#22C55E"
                      : "#EF4444"
                    : theme.bgSecondary,
                },
              ]}
              disabled={!valido}
              onPress={guardar}
            >
              <Text
                style={{
                  color: valido ? "#fff" : theme.textSecondary,
                  fontSize: 14.5,
                  fontWeight: "700",
                }}
              >
                {tipo === "ingreso" ? "Registrar ingreso" : "Registrar egreso"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelarBtn}
              onPress={limpiarYCerrar}
            >
              <Text
                style={[styles.cancelarBtnText, { color: theme.textSecondary }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Campo({
  theme,
  label,
  children,
}: {
  theme: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.campo}>
      <Text style={[styles.campoLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  registrarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  registrarBtnText: { color: "#fff", fontSize: 12.5, fontWeight: "700" },

  periodoRow: { flexDirection: "row", borderRadius: 12, padding: 4 },
  periodoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47.5%", borderRadius: 14, padding: 12, gap: 6 },
  statIcono: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: { fontSize: 11.5 },
  statValor: { fontSize: 16.5, fontWeight: "800" },

  tabsRow: { flexDirection: "row", borderRadius: 12, padding: 4 },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },

  seccionBloque: { gap: 8 },
  seccionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  seccionTitulo: { fontSize: 14.5, fontWeight: "700" },
  seccionCard: { borderRadius: 14, padding: 14, gap: 10 },

  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    paddingTop: 6,
  },
  chartBarWrapper: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBarTrack: { width: 18, height: "88%", justifyContent: "flex-end" },
  chartBar: { width: "100%", borderRadius: 6 },
  chartLabel: { fontSize: 10.5, marginTop: 6 },

  metodoBarraDoble: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  metodoLeyendaRow: { gap: 6 },
  metodoLeyendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metodoDot: { width: 8, height: 8, borderRadius: 4 },
  metodoLeyendaTexto: { fontSize: 12.5, fontWeight: "600" },

  categoriaFila: { gap: 6 },
  categoriaFilaHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoriaLabel: { fontSize: 12.5, fontWeight: "600", flex: 1 },
  categoriaMonto: { fontSize: 12 },
  barraFondo: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00000014",
    overflow: "hidden",
  },
  barraRelleno: { height: 7, borderRadius: 4 },

  metricasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricaItem: { width: "47%", borderRadius: 10, padding: 10, gap: 4 },
  metricaLabel: { fontSize: 10.5 },
  metricaValor: { fontSize: 15, fontWeight: "800" },

  listaSeccion: { gap: 10 },
  movFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  movIcono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  movDescripcion: { fontSize: 13.5, fontWeight: "700" },
  movSubRow: { marginTop: 1 },
  movSub: { fontSize: 11.5 },
  metodoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  metodoTagText: { fontSize: 10, fontWeight: "700" },
  movMonto: { fontSize: 14, fontWeight: "800" },

  // Modal formulario
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 16,
  },

  tipoRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  tipoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
  },

  campo: { marginBottom: 14, gap: 6 },
  campoLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14.5,
  },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoriaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  metodoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  guardarBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  cancelarBtn: { alignItems: "center", paddingVertical: 12 },
  cancelarBtnText: { fontSize: 13, fontWeight: "600" },
});
