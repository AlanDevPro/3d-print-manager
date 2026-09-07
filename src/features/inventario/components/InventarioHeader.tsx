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
import type { Filamento, SubPestanaInventario } from "../types";
import { TabBtn } from "./TabBtn";

type Props = {
  theme: any;
  tab: SubPestanaInventario;
  onCambiarTab: (tab: SubPestanaInventario) => void;
  totalFilamentos: number;
  totalImpresoras: number;
  filamentosBajoStock: Filamento[];
  onAgregarFilamento?: () => void;
  onAgregarImpresora?: () => void;

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

export function InventarioHeader({
  theme,
  tab,
  onCambiarTab,
  totalFilamentos,
  totalImpresoras,
  filamentosBajoStock,
  onAgregarFilamento,
  onAgregarImpresora,
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
  impresorasRequierenMantenimiento = 0,
}: Props) {
  // Estados para controlar los desplegables (Modales tipo Dropdown)
  const [modalVisible, setModalVisible] = useState<
    "tipoFilamento" | "marcaFilamento" | "marcaImpresora" | "modeloImpresora" | null
  >(null);

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

      {/* 3. CONTROLES Y FILTROS SEGÚN PESTAÑA */}
      <View style={styles.seccionControles}>
        {/* BUSCADOR EN TIEMPO REAL */}
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
                ? "Buscar por color, marca, tipo..."
                : tab === "impresoras"
                ? "Buscar impresora por marca, modelo..."
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

        {/* FILTROS DESPLEGABLES */}
        {tab === "filamentos" && (
          <View style={styles.rowFiltros}>
            <TouchableOpacity
              style={[
                styles.btnDropdown,
                { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                filtroTipo !== "" && { borderColor: theme.primary },
              ]}
              onPress={() => setModalVisible("tipoFilamento")}
            >
              <Text
                style={[
                  styles.btnDropdownTexto,
                  { color: filtroTipo ? theme.primary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {filtroTipo ? `Material: ${filtroTipo}` : "Material"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={filtroTipo ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnDropdown,
                { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                filtroMarcaFilamento !== "" && { borderColor: theme.primary },
              ]}
              onPress={() => setModalVisible("marcaFilamento")}
            >
              <Text
                style={[
                  styles.btnDropdownTexto,
                  { color: filtroMarcaFilamento ? theme.primary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {filtroMarcaFilamento ? `Marca: ${filtroMarcaFilamento}` : "Marca"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={filtroMarcaFilamento ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {tab === "impresoras" && (
          <View style={styles.rowFiltros}>
            <TouchableOpacity
              style={[
                styles.btnDropdown,
                { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                filtroMarcaImpresora !== "" && { borderColor: theme.primary },
              ]}
              onPress={() => setModalVisible("marcaImpresora")}
            >
              <Text
                style={[
                  styles.btnDropdownTexto,
                  { color: filtroMarcaImpresora ? theme.primary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {filtroMarcaImpresora ? `Marca: ${filtroMarcaImpresora}` : "Marca"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={filtroMarcaImpresora ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnDropdown,
                { backgroundColor: theme.bgSecondary, borderColor: theme.border + "40" },
                filtroModeloImpresora !== "" && { borderColor: theme.primary },
              ]}
              onPress={() => setModalVisible("modeloImpresora")}
            >
              <Text
                style={[
                  styles.btnDropdownTexto,
                  { color: filtroModeloImpresora ? theme.primary : theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {filtroModeloImpresora ? `Modelo: ${filtroModeloImpresora}` : "Modelo"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={filtroModeloImpresora ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* BOTÓN DE ACCIÓN (NUEVO) ALINEADO A LA DERECHA */}
        {tab === "filamentos" && onAgregarFilamento && (
          <View style={styles.rowAccionDerecha}>
            <TouchableOpacity
              style={[styles.btnAgregarCompacto, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
              onPress={onAgregarFilamento}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.btnAgregarTexto}>Nuevo Filamento</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === "impresoras" && onAgregarImpresora && (
          <View style={styles.rowAccionDerecha}>
            <TouchableOpacity
              style={[styles.btnAgregarCompacto, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
              onPress={onAgregarImpresora}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.btnAgregarTexto}>Nueva Impresora</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* BANNERS DE ALERTA */}
      {tab === "filamentos" && filamentosBajoStock.length > 0 && (
        <View
          style={[
            styles.alertaBanner,
            { backgroundColor: COLOR_DANGER + "14", borderColor: COLOR_DANGER + "30" },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={COLOR_DANGER} />
          <Text style={[styles.alertaTexto, { color: COLOR_DANGER }]}>
            {filamentosBajoStock.length === 1
              ? "1 rollo está por debajo del umbral de stock: "
              : `${filamentosBajoStock.length} rollos están por debajo del umbral de stock: `}
            <Text style={{ fontWeight: "700" }}>
              {filamentosBajoStock.map((f) => `${f.tipo} ${f.color}`).join(", ")}
            </Text>
          </Text>
        </View>
      )}

      {tab === "impresoras" && impresorasRequierenMantenimiento > 0 && (
        <View
          style={[
            styles.alertaBanner,
            { backgroundColor: COLOR_ALERTA + "18", borderColor: COLOR_ALERTA + "40" },
          ]}
        >
          <Ionicons name="build-outline" size={18} color={COLOR_ALERTA} />
          <Text style={[styles.alertaTexto, { color: theme.textPrimary }]}>
            {impresorasRequierenMantenimiento === 1
              ? "1 impresora ha alcanzado un nivel elevado de horas de uso y requiere mantenimiento preventivo."
              : `${impresorasRequierenMantenimiento} impresoras están próximas al límite de horas para mantenimiento.`}
          </Text>
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
    gap: 8,
  },
  inputBusquedaContainer: {
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
  rowFiltros: {
    flexDirection: "row",
    gap: 8,
  },
  btnDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnDropdownTexto: {
    fontSize: 12,
    fontWeight: "600",
  },
  rowAccionDerecha: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  btnAgregarCompacto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  btnAgregarTexto: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  alertaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  alertaTexto: { fontSize: 11.5, flex: 1, fontWeight: "500" },

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