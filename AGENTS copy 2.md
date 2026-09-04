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
    esAdmin,
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
    if (!esAdmin) {
      Alert.alert(
        "Acceso Restringido",
        "Solo el administrador puede agregar filamentos.",
      );
      return;
    }
    setFormFilamentoVisible(true);
  };

  const manejarAbrirFormImpresora = () => {
    if (!esAdmin) {
      Alert.alert(
        "Acceso Restringido",
        "Solo el administrador puede agregar impresoras.",
      );
      return;
    }
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
        //esAdmin={esAdmin}
      />

      {tab === "filamentos" && (
        <FlatList
          data={filamentos}
          keyExtractor={(f) => f.id}
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

      {esAdmin && (
        <>
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
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centrado: { alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12 },
  emptyText: { textAlign: "center", marginTop: 24 },
});

// src/features/filamentos/components/FilamentoCard.tsx
import { COLOR_ALERTA, COLOR_DANGER, COLOR_OK } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Filamento } from "../types";

type Props = {
  theme: any;
  filamento: Filamento;
  onPress: () => void;
};

export function FilamentoCard({ theme, filamento, onPress }: Props) {
  const porcentaje = Math.min(
    100,
    Math.round((filamento.stockGramos / filamento.capacidadRolloGramos) * 100)
  );
  const bajoStock = filamento.stockGramos <= filamento.umbralBajoStock;
  const colorBarra = bajoStock
    ? COLOR_DANGER
    : porcentaje < 50
      ? COLOR_ALERTA
      : COLOR_OK;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.bgSecondary },
        bajoStock && {
          borderWidth: 1.5,
          borderColor: COLOR_DANGER + "40",
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Cabecera: Muestra de color, título y badge de bajo stock */}
      <View style={styles.filaTop}>
        <View
          style={[styles.colorSwatch, { backgroundColor: filamento.colorHex }]}
        >
          <View style={styles.colorSwatchInnerRing} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, { color: theme.textPrimary }]}>
            {filamento.tipo} {filamento.color}
          </Text>
          <View style={styles.subtituloRow}>
            <Ionicons name="pricetag-outline" size={11} color={theme.textSecondary} />
            <Text style={[styles.subtitulo, { color: theme.textSecondary }]}>
              {filamento.marca}
            </Text>
          </View>
        </View>

        {bajoStock && (
          <View style={styles.alertaBadge}>
            <Ionicons name="warning" size={11} color="#fff" />
            <Text style={styles.alertaBadgeText}>Bajo stock</Text>
          </View>
        )}
      </View>

      {/* Indicadores numéricos de stock y porcentaje */}
      <View style={styles.filaInfo}>
        <View style={styles.infoMeta}>
          <Ionicons name="scale-outline" size={13} color={theme.textPrimary} />
          <Text style={[styles.filaInfoTextoBold, { color: theme.textPrimary }]}>
            {filamento.stockGramos} g
            <Text style={[styles.filaInfoSub, { color: theme.textSecondary }]}>
              {" "}
              / {filamento.capacidadRolloGramos} g
            </Text>
          </Text>
        </View>

        <View style={styles.infoMeta}>
          <Ionicons name="pie-chart-outline" size={12} color={colorBarra} />
          <Text style={[styles.porcentajeTexto, { color: colorBarra }]}>
            {porcentaje}%
          </Text>
        </View>
      </View>

      {/* Barra de progreso limpia con fondo neutro adaptado al tema */}
      <View
        style={[
          styles.barraFondo,
          { backgroundColor: theme.border ? theme.border + "60" : "#00000015" },
        ]}
      >
        <View
          style={[
            styles.barraRelleno,
            { width: `${porcentaje}%`, backgroundColor: colorBarra },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  filaTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00000018",
    justifyContent: "center",
    alignItems: "center",
    // Sombra sutil para dar elevación 3D al carrete/muestra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorSwatchInnerRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff40",
    borderWidth: 1,
    borderColor: "#00000010",
  },
  titulo: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  subtituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  subtitulo: {
    fontSize: 12,
    fontWeight: "500",
  },
  alertaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLOR_DANGER,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertaBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  filaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filaInfoTextoBold: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  filaInfoSub: {
    fontSize: 11.5,
    fontWeight: "400",
  },
  porcentajeTexto: {
    fontSize: 12,
    fontWeight: "800",
  },
  barraFondo: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  barraRelleno: {
    height: "100%",
    borderRadius: 4,
  },
});si tengo este codigo quiero que me mejores mi cards de filamento para que me muestre de esta forma: quiero que me muestren dos cards de filamento por fila: fila_1:[cards_1][cards_2], fila_2:[card3][cards4], y quiero que mi cards tenga esta nueva estrcutura profesional de la imagen que te pase y quiero que cuando presione mi cards de filamento me muestre mis detalles de como en la misma imagen que la imagen me ocupe todo el cuadro de fondo pero quiero que me muestre sigue los datos que tengo es mi detalles de filamento que esos detalles de filamento que muestro esta bien: que tengo este codigo: // src/features/inventario/components/DetalleFilamentoModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { sharedStyles } from "../styles/sharedStyles";
import type { Filamento } from "../types";
import { DetalleItem } from "./DetalleItem";

type Props = {
  filamento: Filamento | null;
  theme: any;
  onClose: () => void;
};

export function DetalleFilamentoModal({ filamento, theme, onClose }: Props) {
  return (
    <Modal
      visible={!!filamento}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={sharedStyles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            sharedStyles.modalSheet,
            { backgroundColor: theme.bgPrimary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {filamento && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={sharedStyles.modalHandle} />

              <View style={sharedStyles.modalHeaderRow}>
                <View
                  style={[
                    styles.colorSwatchLg,
                    { backgroundColor: filamento.colorHex },
                  ]}
                >
                  <View style={styles.swatchInnerRing} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      sharedStyles.modalTitulo,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {filamento.tipo} {filamento.color}
                  </Text>
                  <View style={styles.subtituloRow}>
                    <Ionicons name="business-outline" size={12} color={theme.textSecondary} />
                    <Text
                      style={[
                        sharedStyles.modalSub,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {filamento.marca} · {filamento.proveedor ?? "Sin proveedor"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={sharedStyles.modalGrid}>
                <DetalleItem
                  theme={theme}
                  label="Stock restante"
                  valor={`${filamento.stockGramos} g`}
                  icono="cube-outline"
                  destacado
                />
                <DetalleItem
                  theme={theme}
                  label="Capacidad del rollo"
                  valor={`${filamento.capacidadRolloGramos} g`}
                  icono="disc-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Costo por rollo"
                  valor={`Bs ${filamento.costoCompra.toFixed(2)}`}
                  icono="cash-outline"
                />
                <DetalleItem
                  theme={theme}
                  label="Fecha de compra"
                  valor={filamento.fechaCompra}
                  icono="calendar-outline"
                />
              </View>

              {filamento.stockGramos <= filamento.umbralBajoStock && (
                <View style={styles.avisoBajoStock}>
                  <Ionicons name="warning-outline" size={18} color="#EF4444" />
                  <Text style={styles.avisoBajoStockTexto}>
                    Stock por debajo del umbral ({filamento.umbralBajoStock} g).
                    Considera reponer este rollo.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={sharedStyles.cerrarBtn}
                onPress={onClose}
              >
                <Text
                  style={[
                    sharedStyles.cerrarBtnTexto,
                    { color: theme.textSecondary },
                  ]}
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

const styles = StyleSheet.create({
  colorSwatchLg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#00000018",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  swatchInnerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffffff50",
    borderWidth: 1,
    borderColor: "#00000015",
  },
  subtituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  avisoBajoStock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EF444414",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#EF444430",
  },
  avisoBajoStockTexto: {
    color: "#EF4444",
    fontSize: 12,
    flex: 1,
    fontWeight: "600",
  },
});  quiero que me mantengas mis datos de detalles de filamento y de mi cards de filamentos pero ponme las mistra estrcutura profesioanl a mi cards de filamentos y de detalle de filamento