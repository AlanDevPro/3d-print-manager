// src/features/cotizacion/components/forms/sections/ClienteInfoSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LabeledField } from "@/components/ui/LabeledField";
import { SeccionErroresInline } from "@/components/ui/SeccionErroresInline";
import { SelectableChip } from "@/components/ui/SelectableChip";
import type { ClienteResumen } from "@/features/clientes/types";
import type { ErrorCampo } from "@/features/cotizacion/utils/validarSecuenciaCotizacion";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeInteger } from "@/utils/formSanitizers";

interface ClienteInfoSectionProps {
  clientes: ClienteResumen[];
  clienteId?: string;
  nombreCliente: string;
  telefonoCliente: string;
  onSeleccionarCliente: (cliente: ClienteResumen) => void;
  onChangeNombre: (v: string) => void;
  onChangeTelefono: (v: string) => void;
  errores?: ErrorCampo[];
  completo?: boolean;
}

export function ClienteInfoSection({
  clientes,
  clienteId,
  nombreCliente,
  telefonoCliente,
  onSeleccionarCliente,
  onChangeNombre,
  onChangeTelefono,
  errores = [],
  completo = false,
}: ClienteInfoSectionProps) {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = useState("");

  const clientesVisibles = useMemo(() => {
    if (!clientes || clientes.length === 0) return [];

    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes.slice(0, 5);

    return clientes
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(termino) ||
          (c.telefono && c.telefono.includes(termino)),
      )
      .slice(0, 5);
  }, [clientes, busqueda]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgSurface,
          borderColor: completo ? "rgba(22, 163, 74, 0.45)" : theme.border,
        },
      ]}
    >
      <View style={styles.headerGroup}>
        <Ionicons
          name="person-circle-outline"
          size={20}
          color={theme.primary}
        />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Información del Cliente
        </Text>
        {completo && (
          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
        )}
      </View>

      {clientes.length > 0 && (
        <LabeledField
          icon="search-outline"
          label="Buscar Cliente Registrado"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChangeText={setBusqueda}
          containerStyle={styles.searchField}
        />
      )}

      {clientes.length > 0 && (
        <View style={styles.sectionChips}>
          <View style={styles.labelHeader}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={[styles.chipsTitle, { color: theme.textSecondary }]}>
              {busqueda.trim().length > 0
                ? "Resultados de búsqueda"
                : "Clientes recientes"}
            </Text>
          </View>

          {clientesVisibles.length > 0 ? (
            <View style={styles.chipsRow}>
              {clientesVisibles.map((c) => (
                <SelectableChip
                  key={c.id}
                  label={c.nombre}
                  selected={clienteId === c.id}
                  onPress={() => onSeleccionarCliente(c)}
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No se encontraron clientes que coincidan con la búsqueda.
            </Text>
          )}
        </View>
      )}

      <View style={styles.row}>
        <LabeledField
          icon="person-outline"
          label="Nombre / Razón Social"
          placeholder="Ej. Juan Pérez"
          value={nombreCliente}
          onChangeText={onChangeNombre}
          containerStyle={styles.flex1}
        />
        <LabeledField
          icon="call-outline"
          label="Teléfono (WhatsApp)"
          placeholder="Ej. 71234567"
          value={telefonoCliente}
          onChangeText={(v) => onChangeTelefono(sanitizeInteger(v))}
          keyboardType="number-pad"
          maxLength={15}
          containerStyle={[styles.flex1, styles.ml8]}
        />
      </View>

      <SeccionErroresInline
        errores={errores}
        resumen={
          errores.length > 1
            ? "Completa los datos del cliente para poder enviar la cotización."
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  headerGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  searchField: { marginBottom: 4 },
  sectionChips: { marginBottom: 6 },
  labelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  chipsTitle: { fontSize: 12, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emptyText: { fontSize: 12, fontStyle: "italic", marginVertical: 4 },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  ml8: { marginLeft: 8 },
});
