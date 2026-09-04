// app/(tabs)/inventario.tsx
// Panel de inventario — JEDD3DLAB
// Todo en un solo archivo, con datos estáticos (mock), listo para conectar a Supabase.
//
// MAPEO CON TU ESQUEMA ACTUAL:
// - "Filamentos" se basa en tu tabla `materiales` (marca, tipo, color,
// peso_carrete_gramos, precio_carrete, activo).
// - "Impresoras" se basa en tu tabla `impresoras` (nombre, costo_compra,
// vida_util_horas, potencia_watts, costo_mantenimiento_hora, activa).
// - "Piezas en Stock" NO existe en tu esquema todavía — es una funcionalidad
// nueva que sugiero abajo (piezas ya impresas, listas para vender sin
// esperar una cotización nueva).
//
// Todo lo que depende de columnas que aún no existen está marcado con
// "// TODO Supabase" y el SQL sugerido está al final del archivo.

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
// Tema mínimo de respaldo (usa tu useTheme real si ya lo tienes disponible)
// ---------------------------------------------------------------------------
// import { useTheme } from "@/hooks/useTheme";
const useThemeFallback = () => ({
theme: {
bgPrimary: "#0F1115",
bgSecondary: "#1A1D24",
textPrimary: "#F5F6F8",
textSecondary: "#9AA1AC",
primary: "#FF6B35",
},
});

// ---------------------------------------------------------------------------
// Colores semánticos
// ---------------------------------------------------------------------------
const COLOR_OK = "#22C55E";
const COLOR_ALERTA = "#F59E0B";
const COLOR_DANGER = "#EF4444";
const COLOR_INFO = "#3B82F6";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type SubPestana = "filamentos" | "piezas" | "impresoras";

type Filamento = {
id: string;
marca: string;
tipo: string; // PLA, PETG, ABS...
color: string;
colorHex: string;
capacidadRolloGramos: number; // materiales.peso_carrete_gramos
costoCompra: number; // materiales.precio_carrete
stockGramos: number; // TODO Supabase: columna `stock_actual_gramos`
umbralBajoStock: number; // TODO Supabase: columna `umbral_bajo_stock_gramos`
fechaCompra: string;
proveedor: string; // TODO Supabase: columna `proveedor`
};

type EstadoImpresora = "libre" | "imprimiendo" | "mantenimiento" | "apagada";

type Impresora = {
id: string;
modelo: string; // impresoras.nombre
marca: string; // TODO Supabase: separar marca/modelo, hoy solo hay `nombre`
estado: EstadoImpresora; // TODO Supabase: requiere tabla de trabajos
pedidoActual: string | null; // TODO Supabase: FK a pedidos.codigo
horasUsoTotal: number; // TODO Supabase: columna `horas_uso_total`
vidaUtilHoras: number; // impresoras.vida_util_horas
consumoWatts: number; // impresoras.potencia_watts
costoAdquisicion: number; // impresoras.costo_compra
fechaAdquisicion: string;
proximoMantenimiento: string; // TODO Supabase: tabla `impresora_mantenimientos`
};

type PiezaStock = {
id: string;
nombre: string;
cantidad: number;
fechaImpresion: string;
precioVenta: number;
asignada: boolean;
cliente: string | null;
};

// ---------------------------------------------------------------------------
// Config visual
// ---------------------------------------------------------------------------
const ESTADO_IMPRESORA_CFG: Record<
EstadoImpresora,
{ label: string; color: string; icono: keyof typeof Ionicons.glyphMap }

> = {
> libre: { label: "Libre", color: COLOR_OK, icono: "checkmark-circle-outline" },
> imprimiendo: { label: "Imprimiendo", color: "#FF6B35", icono: "flash-outline" },
> mantenimiento: { label: "Mantenimiento", color: COLOR_ALERTA, icono: "build-outline" },
> apagada: { label: "Apagada", color: "#94A3B8", icono: "power-outline" },
> };

// ---------------------------------------------------------------------------
// Datos estáticos (mock) — mismo shape que tus tablas reales
// ---------------------------------------------------------------------------
const FILAMENTOS_MOCK: Filamento[] = [
{
id: "f1",
marca: "eSun",
tipo: "PLA",
color: "Negro",
colorHex: "#111111",
capacidadRolloGramos: 1000,
costoCompra: 90,
stockGramos: 620,
umbralBajoStock: 200,
fechaCompra: "10/08/2026",
proveedor: "ImportPlast Bolivia",
},
{
id: "f2",
marca: "Polymaker",
tipo: "PETG",
color: "Blanco",
colorHex: "#F5F5F5",
capacidadRolloGramos: 1000,
costoCompra: 130,
stockGramos: 150,
umbralBajoStock: 200,
fechaCompra: "02/08/2026",
proveedor: "ImportPlast Bolivia",
},
{
id: "f3",
marca: "eSun",
tipo: "PLA+",
color: "Rojo",
colorHex: "#DC2626",
capacidadRolloGramos: 1000,
costoCompra: 100,
stockGramos: 810,
umbralBajoStock: 200,
fechaCompra: "15/08/2026",
proveedor: "3D Store Sucre",
},
{
id: "f4",
marca: "Sunlu",
tipo: "PLA",
color: "Gris",
colorHex: "#9CA3AF",
capacidadRolloGramos: 1000,
costoCompra: 85,
stockGramos: 60,
umbralBajoStock: 200,
fechaCompra: "20/07/2026",
proveedor: "3D Store Sucre",
},
];

const IMPRESORAS_MOCK: Impresora[] = [
{
id: "i1",
modelo: "Ender 3 V2",
marca: "Creality",
estado: "imprimiendo",
pedidoActual: "PED-1042",
horasUsoTotal: 1480,
vidaUtilHoras: 3000,
consumoWatts: 220,
costoAdquisicion: 1800,
fechaAdquisicion: "05/03/2025",
proximoMantenimiento: "15/09/2026",
},
{
id: "i2",
modelo: "Ender 3 V2 #2",
marca: "Creality",
estado: "libre",
pedidoActual: null,
horasUsoTotal: 640,
vidaUtilHoras: 3000,
consumoWatts: 220,
costoAdquisicion: 1800,
fechaAdquisicion: "18/11/2025",
proximoMantenimiento: "10/11/2026",
},
{
id: "i3",
modelo: "Prusa MK3S",
marca: "Prusa Research",
estado: "imprimiendo",
pedidoActual: "PED-1039",
horasUsoTotal: 2760,
vidaUtilHoras: 3000,
consumoWatts: 190,
costoAdquisicion: 6200,
fechaAdquisicion: "01/02/2024",
proximoMantenimiento: "05/09/2026",
},
{
id: "i4",
modelo: "Anycubic Kobra",
marca: "Anycubic",
estado: "mantenimiento",
pedidoActual: null,
horasUsoTotal: 1120,
vidaUtilHoras: 2500,
consumoWatts: 200,
costoAdquisicion: 1500,
fechaAdquisicion: "22/06/2025",
proximoMantenimiento: "Hoy",
},
];

const PIEZAS_MOCK: PiezaStock[] = [
{
id: "p1",
nombre: "Soporte para celular (negro)",
cantidad: 6,
fechaImpresion: "22/08/2026",
precioVenta: 25,
asignada: false,
cliente: null,
},
{
id: "p2",
nombre: "Maceta geométrica (blanco)",
cantidad: 2,
fechaImpresion: "20/08/2026",
precioVenta: 60,
asignada: true,
cliente: "Lucía Rojas",
},
{
id: "p3",
nombre: "Organizador de escritorio (gris)",
cantidad: 3,
fechaImpresion: "18/08/2026",
precioVenta: 45,
asignada: false,
cliente: null,
},
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBs(valor: number) {
return `Bs ${valor.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Pantalla principal
// ---------------------------------------------------------------------------
export default function InventarioScreen() {
const { theme } = useThemeFallback();
const [tab, setTab] = useState<SubPestana>("filamentos");

const [filamentos, setFilamentos] = useState<Filamento[]>(FILAMENTOS_MOCK);
const [impresoras, setImpresoras] = useState<Impresora[]>(IMPRESORAS_MOCK);
const [piezas] = useState<PiezaStock[]>(PIEZAS_MOCK);

const [filamentoActivo, setFilamentoActivo] = useState<Filamento | null>(null);
const [impresoraActiva, setImpresoraActiva] = useState<Impresora | null>(null);
const [formFilamentoVisible, setFormFilamentoVisible] = useState(false);
const [formImpresoraVisible, setFormImpresoraVisible] = useState(false);

// ---------------------------------------------------------------------
// KPIs / cálculos
// ---------------------------------------------------------------------
const filamentosBajoStock = filamentos.filter(
(f) => f.stockGramos <= f.umbralBajoStock,
);
const valorInventarioFilamento = filamentos.reduce(
(acc, f) => acc + (f.stockGramos / f.capacidadRolloGramos) _ f.costoCompra,
0,
);
const impresorasActivas = impresoras.filter((i) => i.estado !== "apagada").length;
const impresorasEnMantenimiento = impresoras.filter(
(i) => i.estado === "mantenimiento",
).length;
const piezasDisponibles = piezas.filter((p) => !p.asignada);
const valorPiezasDisponibles = piezasDisponibles.reduce(
(acc, p) => acc + p.precioVenta _ p.cantidad,
0,
);

// ---------------------------------------------------------------------
// Acciones (demo local — reemplazar por mutaciones de Supabase)
// ---------------------------------------------------------------------
const agregarFilamento = (nuevo: Omit<Filamento, "id">) => {
setFilamentos((prev) => [{ ...nuevo, id: `f${Date.now()}` }, ...prev]);
setFormFilamentoVisible(false);
// TODO Supabase: insert en `materiales` (+ columnas nuevas sugeridas)
};

const agregarImpresora = (nueva: Omit<Impresora, "id">) => {
setImpresoras((prev) => [{ ...nueva, id: `i${Date.now()}` }, ...prev]);
setFormImpresoraVisible(false);
// TODO Supabase: insert en `impresoras` (+ columnas nuevas sugeridas)
};

return (
<SafeAreaView style={[styles.safe, { backgroundColor: theme.bgPrimary }]} edges={["top"]}>
<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
{/_ Encabezado _/}
<View style={styles.header}>
<Text style={[styles.title, { color: theme.textPrimary }]}>Inventario</Text>
<Text style={[styles.subtitle, { color: theme.textSecondary }]}>
{filamentos.length} filamentos · {impresoras.length} impresoras · {piezas.length} piezas en stock
</Text>
</View>

        {/* KPIs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScroll}
        >
          <KpiCard
            theme={theme}
            icono="cash-outline"
            iconColor={COLOR_OK}
            valor={formatBs(valorInventarioFilamento)}
            label="Valor en filamento"
          />
          <KpiCard
            theme={theme}
            icono="warning-outline"
            iconColor={COLOR_DANGER}
            valor={String(filamentosBajoStock.length)}
            label="Rollos con bajo stock"
          />
          <KpiCard
            theme={theme}
            icono="print-outline"
            iconColor={COLOR_INFO}
            valor={`${impresorasActivas}/${impresoras.length}`}
            label="Impresoras activas"
          />
          <KpiCard
            theme={theme}
            icono="cube-outline"
            iconColor={theme.primary}
            valor={formatBs(valorPiezasDisponibles)}
            label="Piezas listas para vender"
          />
        </ScrollView>

        {/* Alerta de bajo stock */}
        {filamentosBajoStock.length > 0 && (
          <View style={[styles.alertaBanner, { backgroundColor: COLOR_DANGER + "14" }]}>
            <Ionicons name="alert-circle" size={16} color={COLOR_DANGER} />
            <Text style={[styles.alertaBannerTexto, { color: COLOR_DANGER }]}>
              {filamentosBajoStock.length === 1
                ? "1 rollo está por debajo del umbral de stock: "
                : `${filamentosBajoStock.length} rollos están por debajo del umbral de stock: `}
              {filamentosBajoStock.map((f) => `${f.tipo} ${f.color}`).join(", ")}
            </Text>
          </View>
        )}

        {/* Mantenimientos próximos */}
        {impresorasEnMantenimiento > 0 && (
          <View style={[styles.alertaBanner, { backgroundColor: COLOR_ALERTA + "14" }]}>
            <Ionicons name="build" size={16} color={COLOR_ALERTA} />
            <Text style={[styles.alertaBannerTexto, { color: COLOR_ALERTA }]}>
              {impresorasEnMantenimiento} impresora(s) en mantenimiento ahora mismo.
            </Text>
          </View>
        )}

        {/* Acciones rápidas */}
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
            <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
            <Text style={[styles.accionBtnText, { color: theme.primary }]}>Impresora</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: theme.bgSecondary }]}>
          <TabBtn label="Filamentos" activo={tab === "filamentos"} theme={theme} onPress={() => setTab("filamentos")} />
          <TabBtn label="Piezas en Stock" activo={tab === "piezas"} theme={theme} onPress={() => setTab("piezas")} />
          <TabBtn label="Impresoras" activo={tab === "impresoras"} theme={theme} onPress={() => setTab("impresoras")} />
        </View>

        {/* Contenido de cada tab */}
        <View style={styles.listContent}>
          {tab === "filamentos" &&
            filamentos.map((f) => (
              <FilamentoCard key={f.id} theme={theme} filamento={f} onPress={() => setFilamentoActivo(f)} />
            ))}

          {tab === "piezas" &&
            (piezas.length === 0 ? (
              <EmptyState theme={theme} icono="cube-outline" texto="Aún no tienes piezas en stock" />
            ) : (
              piezas.map((p) => <PiezaCard key={p.id} theme={theme} pieza={p} />)
            ))}

          {tab === "impresoras" &&
            impresoras.map((i) => (
              <ImpresoraCard key={i.id} theme={theme} impresora={i} onPress={() => setImpresoraActiva(i)} />
            ))}
        </View>
      </ScrollView>

      <DetalleFilamentoModal filamento={filamentoActivo} theme={theme} onClose={() => setFilamentoActivo(null)} />
      <DetalleImpresoraModal impresora={impresoraActiva} theme={theme} onClose={() => setImpresoraActiva(null)} />

      <FormularioFilamento
        visible={formFilamentoVisible}
        theme={theme}
        onClose={() => setFormFilamentoVisible(false)}
        onGuardar={agregarFilamento}
      />
      <FormularioImpresora
        visible={formImpresoraVisible}
        theme={theme}
        onClose={() => setFormImpresoraVisible(false)}
        onGuardar={agregarImpresora}
      />
    </SafeAreaView>

);
}

// ---------------------------------------------------------------------------
// Subcomponentes — genéricos
// ---------------------------------------------------------------------------
function KpiCard({
theme,
icono,
iconColor,
valor,
label,
}: {
theme: any;
icono: keyof typeof Ionicons.glyphMap;
iconColor: string;
valor: string;
label: string;
}) {
return (
<View style={[styles.kpiCard, { backgroundColor: theme.bgSecondary }]}>
<View style={[styles.kpiIconWrap, { backgroundColor: iconColor + "1A" }]}>
<Ionicons name={icono} size={16} color={iconColor} />
</View>
<Text style={[styles.kpiValor, { color: theme.textPrimary }]}>{valor}</Text>
<Text style={[styles.kpiLabel, { color: theme.textSecondary }]} numberOfLines={2}>
{label}
</Text>
</View>
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
onPress={onPress} >
<Text
style={[
styles.tabBtnText,
{ color: activo ? theme.primary : theme.textSecondary, fontWeight: activo ? "700" : "500" },
]}
numberOfLines={1} >
{label}
</Text>
</TouchableOpacity>
);
}

function EmptyState({
theme,
icono,
texto,
}: {
theme: any;
icono: keyof typeof Ionicons.glyphMap;
texto: string;
}) {
return (
<View style={styles.emptyState}>
<Ionicons name={icono} size={30} color={theme.textSecondary} />
<Text style={[styles.emptyTexto, { color: theme.textSecondary }]}>{texto}</Text>
</View>
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
<View style={[styles.detalleItem, { backgroundColor: theme.bgPrimary }]}>
<Text style={[styles.detalleLabel, { color: theme.textSecondary }]}>{label}</Text>
<Text style={[styles.detalleValor, { color: destacado ? theme.primary : theme.textPrimary }]}>
{valor}
</Text>
</View>
);
}

// ---------------------------------------------------------------------------
// Filamentos
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
const porcentaje = Math.min(100, Math.round((filamento.stockGramos / filamento.capacidadRolloGramos) \* 100));
const bajoStock = filamento.stockGramos <= filamento.umbralBajoStock;
const colorBarra = bajoStock ? COLOR_DANGER : porcentaje < 50 ? COLOR_ALERTA : COLOR_OK;

return (
<TouchableOpacity
style={[styles.card, { backgroundColor: theme.bgSecondary }]}
activeOpacity={0.85}
onPress={onPress} >
<View style={styles.filaTop}>
<View style={[styles.colorSwatch, { backgroundColor: filamento.colorHex }]} />
<View style={{ flex: 1 }}>
<Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>
{filamento.tipo} {filamento.color}
</Text>
<Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>{filamento.marca}</Text>
</View>
{bajoStock && (
<View style={styles.alertaBadge}>
<Ionicons name="warning" size={11} color="#fff" />
<Text style={styles.alertaBadgeText}>Bajo stock</Text>
</View>
)}
</View>

      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${porcentaje}%`, backgroundColor: colorBarra }]} />
      </View>
      <View style={styles.filaInfo}>
        <Text style={[styles.filaInfoTexto, { color: theme.textPrimary }]}>
          {filamento.stockGramos} g restantes
        </Text>
        <Text style={[styles.filaInfoTexto, { color: theme.textSecondary }]}>{porcentaje}% del rollo</Text>
      </View>
    </TouchableOpacity>

);
}

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
<Modal visible={!!filamento} animationType="slide" transparent onRequestClose={onClose}>
<Pressable style={styles.modalOverlay} onPress={onClose}>
<Pressable
style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
onPress={(e) => e.stopPropagation()} >
{filamento && (
<ScrollView showsVerticalScrollIndicator={false}>
<View style={styles.modalHandle} />
<View style={styles.modalHeaderRow}>
<View style={[styles.colorSwatchLg, { backgroundColor: filamento.colorHex }]} />
<View>
<Text style={[styles.modalTitulo, { color: theme.textPrimary }]}>
{filamento.tipo} {filamento.color}
</Text>
<Text style={[styles.modalSub, { color: theme.textSecondary }]}>
{filamento.marca} · {filamento.proveedor}
</Text>
</View>
</View>

              <View style={styles.modalGrid}>
                <DetalleItem theme={theme} label="Stock restante" valor={`${filamento.stockGramos} g`} destacado />
                <DetalleItem theme={theme} label="Capacidad del rollo" valor={`${filamento.capacidadRolloGramos} g`} />
                <DetalleItem theme={theme} label="Costo por rollo" valor={formatBs(filamento.costoCompra)} />
                <DetalleItem theme={theme} label="Fecha de compra" valor={filamento.fechaCompra} />
              </View>

              {filamento.stockGramos <= filamento.umbralBajoStock && (
                <View style={styles.avisoBajoStock}>
                  <Ionicons name="warning" size={16} color={COLOR_DANGER} />
                  <Text style={styles.avisoBajoStockTexto}>
                    Stock por debajo del umbral ({filamento.umbralBajoStock} g). Considera reponer este rollo.
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
                <Text style={[styles.cerrarBtnTexto, { color: theme.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>

);
}

function FormularioFilamento({
visible,
theme,
onClose,
onGuardar,
}: {
visible: boolean;
theme: any;
onClose: () => void;
onGuardar: (f: Omit<Filamento, "id">) => void;
}) {
const [tipo, setTipo] = useState("PLA");
const [color, setColor] = useState("");
const [marca, setMarca] = useState("");
const [capacidad, setCapacidad] = useState("1000");
const [costo, setCosto] = useState("");

const guardar = () => {
if (!color.trim() || !marca.trim() || !costo.trim()) return;
onGuardar({
tipo,
color,
colorHex: "#999999",
marca,
capacidadRolloGramos: Number(capacidad) || 1000,
costoCompra: Number(costo) || 0,
stockGramos: Number(capacidad) || 1000,
umbralBajoStock: 200,
fechaCompra: new Date().toLocaleDateString("es-BO"),
proveedor: "—",
});
setColor("");
setMarca("");
setCosto("");
};

return (
<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
<Pressable style={styles.modalOverlay} onPress={onClose}>
<Pressable
style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
onPress={(e) => e.stopPropagation()} >
<View style={styles.modalHandle} />
<Text style={[styles.modalTitulo, { color: theme.textPrimary }]}>Nuevo filamento</Text>
<Text style={[styles.modalSub, { color: theme.textSecondary, marginBottom: 14 }]}>
Se guarda localmente en esta demo — conéctalo a `materiales` en Supabase.
</Text>

          <CampoTexto theme={theme} label="Tipo (PLA, PETG, ABS...)" valor={tipo} onChange={setTipo} />
          <CampoTexto theme={theme} label="Color" valor={color} onChange={setColor} />
          <CampoTexto theme={theme} label="Marca" valor={marca} onChange={setMarca} />
          <CampoTexto theme={theme} label="Capacidad del rollo (g)" valor={capacidad} onChange={setCapacidad} teclado="numeric" />
          <CampoTexto theme={theme} label="Costo del rollo (Bs)" valor={costo} onChange={setCosto} teclado="numeric" />

          <TouchableOpacity style={[styles.guardarBtn, { backgroundColor: theme.primary }]} onPress={guardar}>
            <Text style={styles.guardarBtnText}>Guardar filamento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
            <Text style={[styles.cerrarBtnTexto, { color: theme.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>

);
}

// ---------------------------------------------------------------------------
// Impresoras
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
const vidaUtilPct = Math.min(100, Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) \* 100));
const colorVida = vidaUtilPct > 85 ? COLOR_DANGER : vidaUtilPct > 60 ? COLOR_ALERTA : COLOR_OK;

return (
<TouchableOpacity
style={[styles.card, { backgroundColor: theme.bgSecondary }]}
activeOpacity={0.85}
onPress={onPress} >
<View style={styles.filaTop}>
<View style={[styles.impresoraIcono, { backgroundColor: cfg.color + "1A" }]}>
<Ionicons name={cfg.icono} size={18} color={cfg.color} />
</View>
<View style={{ flex: 1 }}>
<Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>{impresora.modelo}</Text>
<Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>{impresora.marca}</Text>
</View>
<View style={[styles.estadoBadge, { backgroundColor: cfg.color + "1A" }]}>
<Text style={[styles.estadoBadgeTexto, { color: cfg.color }]}>{cfg.label}</Text>
</View>
</View>

      {impresora.pedidoActual && (
        <Text style={[styles.impresoraPedido, { color: theme.textSecondary }]} numberOfLines={1}>
          Imprimiendo: {impresora.pedidoActual}
        </Text>
      )}

      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${vidaUtilPct}%`, backgroundColor: colorVida }]} />
      </View>
      <View style={styles.filaInfo}>
        <Text style={[styles.filaInfoTexto, { color: theme.textPrimary }]}>
          {impresora.horasUsoTotal.toLocaleString()} h de uso
        </Text>
        <Text style={[styles.filaInfoTexto, { color: theme.textSecondary }]}>{vidaUtilPct}% de vida útil</Text>
      </View>

      {impresora.proximoMantenimiento === "Hoy" && (
        <View style={[styles.mantenimientoTag, { backgroundColor: COLOR_ALERTA + "1A" }]}>
          <Ionicons name="build-outline" size={11} color={COLOR_ALERTA} />
          <Text style={[styles.mantenimientoTagTexto, { color: COLOR_ALERTA }]}>
            Mantenimiento programado hoy
          </Text>
        </View>
      )}
    </TouchableOpacity>

);
}

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
? Math.min(100, Math.round((impresora.horasUsoTotal / impresora.vidaUtilHoras) \* 100))
: 0;
const horasRestantes = impresora ? Math.max(0, impresora.vidaUtilHoras - impresora.horasUsoTotal) : 0;
const cfg = impresora ? ESTADO_IMPRESORA_CFG[impresora.estado] : null;

return (
<Modal visible={!!impresora} animationType="slide" transparent onRequestClose={onClose}>
<Pressable style={styles.modalOverlay} onPress={onClose}>
<Pressable
style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
onPress={(e) => e.stopPropagation()} >
{impresora && cfg && (
<ScrollView showsVerticalScrollIndicator={false}>
<View style={styles.modalHandle} />
<View style={styles.modalHeaderRow}>
<View style={[styles.impresoraIconoLg, { backgroundColor: cfg.color + "1A" }]}>
<Ionicons name={cfg.icono} size={22} color={cfg.color} />
</View>
<View>
<Text style={[styles.modalTitulo, { color: theme.textPrimary }]}>{impresora.modelo}</Text>
<Text style={[styles.modalSub, { color: theme.textSecondary }]}>{impresora.marca}</Text>
</View>
</View>

              <View style={[styles.estadoBadge, { backgroundColor: cfg.color + "1A", alignSelf: "flex-start", marginBottom: 12 }]}>
                <Text style={[styles.estadoBadgeTexto, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              <View style={styles.modalGrid}>
                <DetalleItem theme={theme} label="Vida útil restante" valor={`${horasRestantes.toLocaleString()} h`} destacado />
                <DetalleItem theme={theme} label="Uso acumulado" valor={`${impresora.horasUsoTotal.toLocaleString()} h`} />
                <DetalleItem theme={theme} label="Consumo" valor={`${impresora.consumoWatts} W`} />
                <DetalleItem theme={theme} label="Costo adquisición" valor={formatBs(impresora.costoAdquisicion)} />
                <DetalleItem theme={theme} label="Fecha adquisición" valor={impresora.fechaAdquisicion} />
                <DetalleItem theme={theme} label="Próximo mantenimiento" valor={impresora.proximoMantenimiento} />
              </View>

              <Text style={[styles.checklistTitulo, { color: theme.textSecondary }]}>Desgaste</Text>
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    {
                      width: `${vidaUtilPct}%`,
                      backgroundColor: vidaUtilPct > 85 ? COLOR_DANGER : vidaUtilPct > 60 ? COLOR_ALERTA : COLOR_OK,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.filaInfoTexto, { color: theme.textSecondary, marginTop: 4 }]}>
                {vidaUtilPct}% de su vida útil consumida
              </Text>

              <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
                <Text style={[styles.cerrarBtnTexto, { color: theme.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>

);
}

function FormularioImpresora({
visible,
theme,
onClose,
onGuardar,
}: {
visible: boolean;
theme: any;
onClose: () => void;
onGuardar: (i: Omit<Impresora, "id">) => void;
}) {
const [modelo, setModelo] = useState("");
const [marca, setMarca] = useState("");
const [costo, setCosto] = useState("");
const [vidaUtil, setVidaUtil] = useState("3000");
const [potencia, setPotencia] = useState("200");

const guardar = () => {
if (!modelo.trim() || !costo.trim()) return;
onGuardar({
modelo,
marca: marca || "—",
estado: "libre",
pedidoActual: null,
horasUsoTotal: 0,
vidaUtilHoras: Number(vidaUtil) || 3000,
consumoWatts: Number(potencia) || 200,
costoAdquisicion: Number(costo) || 0,
fechaAdquisicion: new Date().toLocaleDateString("es-BO"),
proximoMantenimiento: "—",
});
setModelo("");
setMarca("");
setCosto("");
};

return (
<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
<Pressable style={styles.modalOverlay} onPress={onClose}>
<Pressable
style={[styles.modalSheet, { backgroundColor: theme.bgPrimary }]}
onPress={(e) => e.stopPropagation()} >
<View style={styles.modalHandle} />
<Text style={[styles.modalTitulo, { color: theme.textPrimary }]}>Nueva impresora</Text>
<Text style={[styles.modalSub, { color: theme.textSecondary, marginBottom: 14 }]}>
Se guarda localmente en esta demo — conéctalo a `impresoras` en Supabase.
</Text>

          <CampoTexto theme={theme} label="Modelo" valor={modelo} onChange={setModelo} />
          <CampoTexto theme={theme} label="Marca" valor={marca} onChange={setMarca} />
          <CampoTexto theme={theme} label="Costo de compra (Bs)" valor={costo} onChange={setCosto} teclado="numeric" />
          <CampoTexto theme={theme} label="Vida útil (horas)" valor={vidaUtil} onChange={setVidaUtil} teclado="numeric" />
          <CampoTexto theme={theme} label="Potencia (W)" valor={potencia} onChange={setPotencia} teclado="numeric" />

          <TouchableOpacity style={[styles.guardarBtn, { backgroundColor: theme.primary }]} onPress={guardar}>
            <Text style={styles.guardarBtnText}>Guardar impresora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
            <Text style={[styles.cerrarBtnTexto, { color: theme.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>

);
}

// ---------------------------------------------------------------------------
// Piezas en stock (funcionalidad nueva)
// ---------------------------------------------------------------------------
function PiezaCard({ theme, pieza }: { theme: any; pieza: PiezaStock }) {
return (
<View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
<View style={styles.filaTop}>
<View style={{ flex: 1 }}>
<Text style={[styles.cardTitulo, { color: theme.textPrimary }]}>{pieza.nombre}</Text>
<Text style={[styles.cardSubtitulo, { color: theme.textSecondary }]}>
Impresa el {pieza.fechaImpresion}
</Text>
</View>
<View
style={[
styles.piezaBadge,
{ backgroundColor: pieza.asignada ? COLOR_ALERTA + "1A" : COLOR_OK + "1A" },
]} >
<Text style={[styles.piezaBadgeText, { color: pieza.asignada ? COLOR_ALERTA : COLOR_OK }]}>
{pieza.asignada ? "Espera recolección" : "Disponible"}
</Text>
</View>
</View>

      <View style={styles.filaInfo}>
        <Text style={[styles.filaInfoTexto, { color: theme.textPrimary }]}>Cantidad: {pieza.cantidad}</Text>
        <Text style={[styles.filaInfoTexto, { color: theme.primary }]}>{formatBs(pieza.precioVenta)}</Text>
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
// Campo de texto reutilizable para formularios
// ---------------------------------------------------------------------------
function CampoTexto({
theme,
label,
valor,
onChange,
teclado,
}: {
theme: any;
label: string;
valor: string;
onChange: (v: string) => void;
teclado?: "default" | "numeric";
}) {
return (
<View style={{ marginBottom: 10 }}>
<Text style={[styles.campoLabel, { color: theme.textSecondary }]}>{label}</Text>
<TextInput
style={[styles.campoInput, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
value={valor}
onChangeText={onChange}
keyboardType={teclado === "numeric" ? "numeric" : "default"}
placeholderTextColor={theme.textSecondary}
/>
</View>
);
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
safe: { flex: 1 },
scrollContent: { paddingBottom: 32 },
header: { paddingHorizontal: 16, paddingTop: 8, gap: 2 },
title: { fontSize: 22, fontWeight: "800" },
subtitle: { fontSize: 12 },

kpiScroll: { gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
kpiCard: { width: 138, borderRadius: 16, padding: 12, gap: 6 },
kpiIconWrap: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
kpiValor: { fontSize: 16, fontWeight: "800" },
kpiLabel: { fontSize: 10.5, lineHeight: 13 },

alertaBanner: {
flexDirection: "row",
alignItems: "center",
gap: 8,
marginHorizontal: 16,
marginBottom: 10,
borderRadius: 10,
padding: 10,
},
alertaBannerTexto: { fontSize: 11.5, flex: 1, fontWeight: "600" },

accionesRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 12 },
accionBtn: {
flexDirection: "row",
alignItems: "center",
gap: 6,
borderRadius: 10,
paddingHorizontal: 14,
paddingVertical: 9,
},
accionBtnText: { color: "#fff", fontSize: 12.5, fontWeight: "700" },

tabsRow: { flexDirection: "row", borderRadius: 12, padding: 4, marginHorizontal: 16, marginBottom: 12 },
tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
tabBtnText: { fontSize: 12.5 },

listContent: { paddingHorizontal: 16, gap: 12 },

// Card genérica
card: { borderRadius: 16, padding: 14, gap: 10 },
filaTop: { flexDirection: "row", alignItems: "center", gap: 10 },
cardTitulo: { fontSize: 14.5, fontWeight: "700" },
cardSubtitulo: { fontSize: 12, marginTop: 1 },

colorSwatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: "#00000022" },
colorSwatchLg: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: "#00000022" },

alertaBadge: {
flexDirection: "row",
alignItems: "center",
gap: 4,
backgroundColor: COLOR_DANGER,
borderRadius: 20,
paddingHorizontal: 8,
paddingVertical: 4,
},
alertaBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

barraFondo: { height: 6, borderRadius: 3, backgroundColor: "#00000022", overflow: "hidden" },
barraRelleno: { height: "100%", borderRadius: 3 },

filaInfo: { flexDirection: "row", justifyContent: "space-between" },
filaInfoTexto: { fontSize: 12 },

impresoraIcono: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
impresoraIconoLg: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
impresoraPedido: { fontSize: 12, marginTop: -4 },

estadoBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
estadoBadgeTexto: { fontSize: 11, fontWeight: "700" },

mantenimientoTag: {
flexDirection: "row",
alignItems: "center",
gap: 5,
alignSelf: "flex-start",
borderRadius: 8,
paddingHorizontal: 8,
paddingVertical: 4,
},
mantenimientoTagTexto: { fontSize: 10.5, fontWeight: "700" },

piezaBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
piezaBadgeText: { fontSize: 11, fontWeight: "700" },
piezaCliente: { fontSize: 12, marginTop: -2 },

emptyState: { alignItems: "center", gap: 8, paddingTop: 48 },
emptyTexto: { fontSize: 13 },

// Modal
modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "88%" },
modalHandle: {
width: 40,
height: 4,
borderRadius: 2,
backgroundColor: "#00000022",
alignSelf: "center",
marginBottom: 14,
},
modalHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
modalTitulo: { fontSize: 18, fontWeight: "800" },
modalSub: { fontSize: 12.5, marginTop: 2 },
modalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

detalleItem: { width: "47%", borderRadius: 12, padding: 10, gap: 4 },
detalleLabel: { fontSize: 11 },
detalleValor: { fontSize: 15, fontWeight: "700" },

avisoBajoStock: {
flexDirection: "row",
alignItems: "center",
gap: 8,
backgroundColor: COLOR_DANGER + "14",
borderRadius: 10,
padding: 10,
marginTop: 10,
},
avisoBajoStockTexto: { color: COLOR_DANGER, fontSize: 12, flex: 1, fontWeight: "600" },

checklistTitulo: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 6 },

campoLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 },
campoInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },

guardarBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 6 },
guardarBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

cerrarBtn: { alignItems: "center", paddingVertical: 12 },
cerrarBtnTexto: { fontSize: 13, fontWeight: "600" },
});

// ---------------------------------------------------------------------------
// ESQUEMA SUGERIDO — columnas y tablas nuevas para un inventario real
// ---------------------------------------------------------------------------
/\*
-- 1) Columnas nuevas en `materiales` (para stock real, no solo el rollo "de fábrica")
ALTER TABLE public.materiales
ADD COLUMN IF NOT EXISTS stock_actual_gramos NUMERIC(8,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS umbral_bajo_stock_gramos NUMERIC(8,2) NOT NULL DEFAULT 200,
ADD COLUMN IF NOT EXISTS proveedor TEXT;

-- 2) Columnas nuevas en `impresoras` (para desgaste y mantenimiento real)
ALTER TABLE public.impresoras
ADD COLUMN IF NOT EXISTS marca TEXT,
ADD COLUMN IF NOT EXISTS horas_uso_total NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 3) Tabla de mantenimientos (registro + próxima fecha programada)
CREATE TABLE IF NOT EXISTS public.impresora_mantenimientos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
impresora_id UUID REFERENCES public.impresoras(id) ON DELETE CASCADE NOT NULL,
tipo TEXT NOT NULL, -- 'preventivo' | 'correctivo'
descripcion TEXT,
costo NUMERIC(8,2) DEFAULT 0,
fecha_realizado DATE,
fecha_proximo DATE,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.impresora_mantenimientos ENABLE ROW LEVEL SECURITY;

-- 4) Tabla de piezas en stock (piezas ya impresas, listas para vender sin
-- esperar una cotización nueva — funcionalidad NUEVA sugerida)
CREATE TABLE IF NOT EXISTS public.piezas_stock (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
nombre TEXT NOT NULL,
cantidad INT NOT NULL DEFAULT 1,
precio_venta NUMERIC(10,2) NOT NULL,
fecha_impresion DATE,
asignada_a_pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.piezas_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total a sus piezas en stock" ON public.piezas_stock
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5) Trigger sugerido: descontar stock de filamento automáticamente cuando
-- una cotización pasa a 'aceptada' (usa cotizacion_items.peso_gramos).
-- Y sumar horas_uso_total a la impresora usada, para que el desgaste
-- y las alertas de bajo stock se mantengan solas, sin trabajo manual.
\*/
