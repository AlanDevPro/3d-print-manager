import { KpiCard } from "@/components/ui/KpiCard";
import { COLOR_ALERTA, COLOR_DANGER, COLOR_INFO, COLOR_OK } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import type { Filamento, Impresora, SubPestanaInventario } from "../types";
import { TabBtn } from "./TabBtn";

type Props = {
  theme: any;
  tab: SubPestanaInventario;
  onCambiarTab: (tab: SubPestanaInventario) => void;
  totalFilamentos: number;
  totalImpresoras: number;
  filamentosBajoStock: Filamento[];
  impresorasLista?: Impresora[];
  onAgregarFilamento?: () => void;
  onAgregarImpresora?: () => void;

  // Modales / Handlers al presionar Cards de Alerta
  onSelectFilamento?: (filamento: Filamento) => void;
  onSelectImpresora?: (impresora: Impresora) => void;

  // Filtros y Búsqueda
  busqueda: string;
  onCambiarBusqueda: (texto: string) => void;

  // Filtros Filamento
  filtroTipo: string;
  onCambiarFiltroTipo: (tipo: string) => void;
  tiposDisponibles: string[];
  filtroMarcaFilamento: string;
  onCambiarFiltroMarcaFilamento: (marca: string) => void;
  marcasFilamentoDisponibles: string[];

  // Filtros Impresora
  filtroMarcaImpresora: string;
  onCambiarFiltroMarcaImpresora: (marca: string) => void;
  marcasImpresoraDisponibles: string[];
  filtroModeloImpresora: string;
  onCambiarFiltroModeloImpresora: (modelo: string) => void;
  modelosImpresoraDisponibles: string[];

  impresorasRequierenMantenimiento?: number;
};

// Función auxiliar para formatear tiempo de impresión
const formatearHorasYMinutos = (horasTotales: number) => {
  const hrs = Math.floor(horasTotales);
  const min = Math.round((horasTotales - hrs) * 60);
  return `${hrs}h ${min}m`;
};

export function InventarioHeader({
  theme,
  tab,
  onCambiarTab,
  totalFilamentos,
  totalImpresoras,
  filamentosBajoStock,
  impresorasLista = [],
  onAgregarFilamento,
  onAgregarImpresora,
  onSelectFilamento,
  onSelectImpresora,
  busqueda,
  onCambiarBusqueda,
  filtroTipo,
  onCambiarFiltroTipo,
  tiposDisponibles,
  filtroMarcaFilamento,
  onCambiarFiltroMarcaFilamento,
  marcasFilamentoDisponibles,
  filtroMarcaImpresora,
  onCambiarFiltroMarcaImpresora,
  marcasImpresoraDisponibles,
  filtroModeloImpresora,
  onCambiarFiltroModeloImpresora,
  modelosImpresoraDisponibles,
}: Props) {
  // Estados para controlar los desplegables
  const [modalVisible, setModalVisible] = useState<
    "tipoFilamento" | "marcaFilamento" | "marcaImpresora" | "modeloImpresora" | null
  >(null);

  // Filtrar impresoras que están a 24 horas o menos de vencer su vida útil (o que ya la superaron)
  const impresorasConAlerta = impresorasLista.filter((imp) => {
    const horasParaMantenimiento = imp.vidaUtilHoras - imp.horasUsoTotal;
    return horasParaMantenimiento <= 24;
  });

  const renderDropdownModal = (
    titulo: string,
    opciones: string[],
    valorSeleccionado: string,
    onSelect: (valor: string) => void
  ) => (
    <Modal
      transparent
      visible={modalVisible !== null}
      animationType="fade"
      onRequestClose={() => setModalVisible(null)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(null)}>
        <View style={[styles.dropdownMenu, { backgroundColor: theme.bgSecondary }]}>
          <Text style={[styles.dropdownTitle, { color: theme.textPrimary }]}>{titulo}</Text>

          <TouchableOpacity
            style={[
              styles.dropdownOption,
              valorSeleccionado === "" && { backgroundColor: theme.primary + "15" },
            ]}
            onPress={() => {
              onSelect("");
              setModalVisible(null);
            }}
          >
            <Text
              style={[
                styles.dropdownOptionText,
                { color: valorSeleccionado === "" ? theme.primary : theme.textPrimary },
              ]}
            >
              Todos
            </Text>
            {valorSeleccionado === "" && (
              <Ionicons name="checkmark" size={16} color={theme.primary} />
            )}
          </TouchableOpacity>

          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
            {opciones.map((opcion) => {
              const activo = valorSeleccionado === opcion;
              return (
                <TouchableOpacity
                  key={opcion}
                  style={[
                    styles.dropdownOption,
                    activo && { backgroundColor: theme.primary + "15" },
                  ]}
                  onPress={() => {
                    onSelect(activo ? "" : opcion);
                    setModalVisible(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: activo ? theme.primary : theme.textPrimary },
                    ]}
                  >
                    {opcion}
                  </Text>
                  {activo && <Ionicons name="checkmark" size={16} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* 1. TÍTULO Y KPI */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Inventario</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {totalFilamentos} filamentos · {totalImpresoras} impresoras
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScroll}
      >
        <KpiCard
          theme={theme}
          icono="layers-outline"
          iconColor={COLOR_INFO}
          valor={String(totalFilamentos)}
          label="Filamentos registrados"
        />
        <KpiCard
          theme={theme}
          icono="print-outline"
          iconColor={COLOR_OK}
          valor={String(totalImpresoras)}
          label="Impresoras registradas"
        />
        <KpiCard
          theme={theme}
          icono="warning-outline"
          iconColor={COLOR_DANGER}
          valor={String(filamentosBajoStock.length)}
          label="Rollos con bajo stock"
        />
      </ScrollView>

      {/* 2. PESTAÑAS PRINCIPALES */}
      <View style={[styles.tabsRow, { backgroundColor: theme.bgSecondary }]}>
        <TabBtn
          label="Filamentos"
          icono="disc-outline"
          activo={tab === "filamentos"}
          theme={theme}
          onPress={() => onCambiarTab("filamentos")}
        />
        <TabBtn
          label="Piezas en Stock"
          icono="cube-outline"
          activo={tab === "piezas"}
          theme={theme}
          onPress={() => onCambiarTab("piezas")}
        />
        <TabBtn
          label="Impresoras"
          icono="print-outline"
          activo={tab === "impresoras"}
          theme={theme}
          onPress={() => onCambiarTab("impresoras")}
        />
      </View>

      {/* 3. CONTROLES: BUSCADOR + FILTROS + BOTÓN AGREGAR */}
      <View style={styles.seccionControles}>
        <View style={styles.filaBusquedaYFiltros}>
          {/* BUSCADOR */}
          <View
            style={[
              styles.inputBusquedaContainer,
              { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.inputBusqueda, { color: theme.textPrimary }]}
              placeholder={
                tab === "filamentos"
                  ? "Buscar por color, marca..."
                  : tab === "impresoras"
                  ? "Buscar por marca, modelo..."
                  : "Buscar piezas..."
              }
              placeholderTextColor={theme.textSecondary + "80"}
              value={busqueda}
              onChangeText={onCambiarBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => onCambiarBusqueda("")}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTROS SEGÚN PESTAÑA */}
          {tab === "filamentos" && (
            <View style={styles.contenedorIconosFiltro}>
              {/* Filtro Material */}
              <TouchableOpacity
                style={[
                  styles.btnIconoFiltro,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                  filtroTipo !== "" && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + "15",
                  },
                ]}
                onPress={() => setModalVisible("tipoFilamento")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color={filtroTipo ? theme.primary : theme.textSecondary}
                />
                {filtroTipo !== "" && (
                  <View style={[styles.dotIndicador, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>

              {/* Filtro Marca */}
              <TouchableOpacity
                style={[
                  styles.btnIconoFiltro,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                  filtroMarcaFilamento !== "" && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + "15",
                  },
                ]}
                onPress={() => setModalVisible("marcaFilamento")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={filtroMarcaFilamento ? theme.primary : theme.textSecondary}
                />
                {filtroMarcaFilamento !== "" && (
                  <View style={[styles.dotIndicador, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>

              {/* Botón Agregar Filamento Compacto */}
              {onAgregarFilamento && (
                <TouchableOpacity
                  style={[styles.btnAgregarIcono, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={onAgregarFilamento}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" style={{ marginRight: -2 }} />
                  <Ionicons name="disc-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {tab === "impresoras" && (
            <View style={styles.contenedorIconosFiltro}>
              {/* Filtro Marca Impresora */}
              <TouchableOpacity
                style={[
                  styles.btnIconoFiltro,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                  filtroMarcaImpresora !== "" && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + "15",
                  },
                ]}
                onPress={() => setModalVisible("marcaImpresora")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={filtroMarcaImpresora ? theme.primary : theme.textSecondary}
                />
                {filtroMarcaImpresora !== "" && (
                  <View style={[styles.dotIndicador, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>

              {/* Filtro Modelo Impresora */}
              <TouchableOpacity
                style={[
                  styles.btnIconoFiltro,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                  filtroModeloImpresora !== "" && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + "15",
                  },
                ]}
                onPress={() => setModalVisible("modeloImpresora")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={18}
                  color={filtroModeloImpresora ? theme.primary : theme.textSecondary}
                />
                {filtroModeloImpresora !== "" && (
                  <View style={[styles.dotIndicador, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>

              {/* Botón Agregar Impresora Compacto */}
              {onAgregarImpresora && (
                <TouchableOpacity
                  style={[styles.btnAgregarIcono, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={onAgregarImpresora}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" style={{ marginRight: -2 }} />
                  <Ionicons name="print-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 4. CARDS DE ALERTAS CON ESTRUCTURA EN DOS COLUMNAS (2-COLUMNS GRID LAYOUT) */}

      {/* BANNERS / CARDS DE FILAMENTOS CON BAJO STOCK */}
      {tab === "filamentos" && filamentosBajoStock.length > 0 && (
        <View style={styles.alertaSeccionContainer}>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScrollHorizontal}
          >
            {filamentosBajoStock.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.cardAlerta2Col,
                  {
                    backgroundColor: COLOR_DANGER + "0D",
                    borderColor: COLOR_DANGER + "35",
                  },
                ]}
                activeOpacity={0.75}
                onPress={() => onSelectFilamento && onSelectFilamento(f)}
              >
                {/* COLUMNA 1: Ícono Centrado Verticalmente a la Izquierda */}
                <View style={styles.columnaIcono}>
                  <View style={[styles.circuloIcono2Col, { backgroundColor: COLOR_DANGER + "20" }]}>
                    <Ionicons name="alert-circle" size={22} color={COLOR_DANGER} />
                  </View>
                </View>

                {/* COLUMNA 2: Información Técnica Alineada a la Izquierda */}
                <View style={styles.columnaDatos}>
                  {/* Fila Material + Color */}
                  <Text
                    style={[styles.cardAlertaTitulo, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {f.tipo} <Text style={{ color: theme.textSecondary, fontWeight: "500" }}>· {f.color}</Text>
                  </Text>

                  {/* Fila Gramos Actuales / Gramos Umbral */}
                  <Text style={[styles.cardAlertaMedida, { color: COLOR_DANGER }]}>
                    {f.stockGramos}g{" "}
                    <Text style={[styles.cardAlertaTotal, { color: theme.textSecondary }]}>
                      / {f.umbralBajoStock}g
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* BANNERS / CARDS DE MANTENIMIENTO DE IMPRESORAS */}
      {tab === "impresoras" && impresorasConAlerta.length > 0 && (
        <View style={styles.alertaSeccionContainer}>
          <View style={styles.alertaHeader}>
            <Ionicons name="build-outline" size={16} color={COLOR_ALERTA} />
            <Text style={[styles.alertaTituloHeader, { color: COLOR_ALERTA }]}>
              Impresoras Próximas a Mantenimiento (≤ 24h Restantes)
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScrollHorizontal}
          >
            {impresorasConAlerta.map((imp) => (
              <TouchableOpacity
                key={imp.id}
                style={[
                  styles.cardAlerta2Col,
                  {
                    backgroundColor: COLOR_ALERTA + "12",
                    borderColor: COLOR_ALERTA + "40",
                  },
                ]}
                activeOpacity={0.75}
                onPress={() => onSelectImpresora && onSelectImpresora(imp)}
              >
                {/* COLUMNA 1: Ícono Centrado Verticalmente a la Izquierda */}
                <View style={styles.columnaIcono}>
                  <View style={[styles.circuloIcono2Col, { backgroundColor: COLOR_ALERTA + "25" }]}>
                    <Ionicons name="time-outline" size={22} color={COLOR_ALERTA} />
                  </View>
                </View>

                {/* COLUMNA 2: Información Técnica Alineada a la Izquierda */}
                <View style={styles.columnaDatos}>
                  {/* Fila Marca + Modelo */}
                  <Text
                    style={[styles.cardAlertaTitulo, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {imp.marca}{" "}
                    <Text style={{ color: theme.textSecondary, fontWeight: "500" }}>
                      · {imp.modelo}
                    </Text>
                  </Text>

                  {/* Fila Horas Uso / Horas Vida Útil */}
                  <Text style={[styles.cardAlertaMedida, { color: theme.textPrimary }]}>
                    {formatearHorasYMinutos(imp.horasUsoTotal)}{" "}
                    <Text style={[styles.cardAlertaTotal, { color: theme.textSecondary }]}>
                      / {imp.vidaUtilHoras} hrs
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* RENDERIZADO DE MODALES DROPDOWN */}
      {modalVisible === "tipoFilamento" &&
        renderDropdownModal(
          "Seleccionar Material",
          tiposDisponibles,
          filtroTipo,
          onCambiarFiltroTipo
        )}
      {modalVisible === "marcaFilamento" &&
        renderDropdownModal(
          "Seleccionar Marca de Filamento",
          marcasFilamentoDisponibles,
          filtroMarcaFilamento,
          onCambiarFiltroMarcaFilamento
        )}
      {modalVisible === "marcaImpresora" &&
        renderDropdownModal(
          "Seleccionar Marca de Impresora",
          marcasImpresoraDisponibles,
          filtroMarcaImpresora,
          onCambiarFiltroMarcaImpresora
        )}
      {modalVisible === "modeloImpresora" &&
        renderDropdownModal(
          "Seleccionar Modelo de Impresora",
          modelosImpresoraDisponibles,
          filtroModeloImpresora,
          onCambiarFiltroModeloImpresora
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 4 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 2 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  kpiScroll: { gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  tabsRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  seccionControles: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  filaBusquedaYFiltros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputBusquedaContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  contenedorIconosFiltro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnIconoFiltro: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dotIndicador: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  btnAgregarIcono: {
    width: 42,
    height: 42,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  // BANNERS Y CARDS DE ALERTA PROFESIONALES (Estructura de 2 Columnas)
  alertaSeccionContainer: {
    marginBottom: 12,
  },
  alertaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  alertaTituloHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cardsScrollHorizontal: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cardAlerta2Col: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 210,
    gap: 12,
  },
  columnaIcono: {
    justifyContent: "center",
    alignItems: "center",
  },
  circuloIcono2Col: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  columnaDatos: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  cardAlertaTitulo: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardAlertaMedida: {
    fontSize: 12,
    fontWeight: "800",
  },
  cardAlertaTotal: {
    fontWeight: "500",
  },

  // Estilos del Modal Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownMenu: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    padding: 16,
    maxHeight: "60%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontSize: 13.5,
    fontWeight: "500",
  },
});