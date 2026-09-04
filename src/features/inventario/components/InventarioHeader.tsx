// src/features/inventario/components/InventarioHeader.tsx
import { KpiCard } from "@/components/ui/KpiCard";
import { COLOR_DANGER, COLOR_INFO, COLOR_OK } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
}: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Inventario
        </Text>
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

      {filamentosBajoStock.length > 0 && (
        <View
          style={[
            styles.alertaBanner,
            { backgroundColor: COLOR_DANGER + "14" },
          ]}
        >
          <Ionicons name="alert-circle" size={16} color={COLOR_DANGER} />
          <Text style={[styles.alertaTexto, { color: COLOR_DANGER }]}>
            {filamentosBajoStock.length === 1
              ? "1 rollo está por debajo del umbral de stock: "
              : `${filamentosBajoStock.length} rollos están por debajo del umbral de stock: `}
            {filamentosBajoStock.map((f) => `${f.tipo} ${f.color}`).join(", ")}
          </Text>
        </View>
      )}

      {/* --- BOTONES DE ACCIÓN RÁPIDA --- */}
      <View style={styles.accionesRow}>
        {onAgregarFilamento && (
          <TouchableOpacity
            style={[styles.btnAccion, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
            onPress={onAgregarFilamento}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.btnAccionTexto}>Filamento</Text>
          </TouchableOpacity>
        )}

        {onAgregarImpresora && (
          <TouchableOpacity
            style={[
              styles.btnAccion,
              styles.btnAccionOutline,
              {
                borderColor: theme.border ? theme.border + "80" : "#ffffff33",
                backgroundColor: theme.bgSecondary,
              },
            ]}
            activeOpacity={0.8}
            onPress={onAgregarImpresora}
          >
            <Ionicons name="print-outline" size={17} color={theme.textPrimary} />
            <Text style={[styles.btnAccionTextoOutline, { color: theme.textPrimary }]}>
              Impresora
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 2 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  kpiScroll: { gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  alertaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
  },
  alertaTexto: { fontSize: 11.5, flex: 1, fontWeight: "600" },
  accionesRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  btnAccion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  btnAccionOutline: {
    borderWidth: 1.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnAccionTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnAccionTextoOutline: {
    fontSize: 13,
    fontWeight: "700",
  },
  tabsRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
});