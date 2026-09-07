// src/features/cotizacion/components/forms/sections/ClienteInfoSection.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LabeledField } from "@/components/ui/LabeledField";
import { SelectableChip } from "@/components/ui/SelectableChip";
import type { ClienteResumen } from "@/features/clientes/types";
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
}

export function ClienteInfoSection({
  clientes,
  clienteId,
  nombreCliente,
  telefonoCliente,
  onSeleccionarCliente,
  onChangeNombre,
  onChangeTelefono,
}: ClienteInfoSectionProps) {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = useState("");

  // Filtrar los clientes según la búsqueda o limitar a los últimos 5
  const clientesVisibles = useMemo(() => {
    if (!clientes || clientes.length === 0) return [];

    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      // Retorna únicamente los últimos 5 clientes recientes
      return clientes.slice(0, 5);
    }

    // Filtrar por nombre o teléfono
    return clientes
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(termino) ||
          (c.telefono && c.telefono.includes(termino))
      )
      .slice(0, 5); // Limitar también a máximo 5 resultados de búsqueda
  }, [clientes, busqueda]);

  return (
    <View style={styles.container}>
      {/* Buscador de clientes */}
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

      {/* Lista de chips de clientes (Top 5 o Filtrados) */}
      {clientes.length > 0 && (
        <View style={styles.sectionChips}>
          <View style={styles.labelHeader}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
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

      {/* Formulario de Nombre y Teléfono (Soporta nuevos clientes o edición) */}
      <View style={styles.row}>
        <LabeledField
          icon="person-outline"
          label="Nombre / Razón Social"
          placeholder="Ej. Juan Pérez"
          value={nombreCliente}
          onChangeText={(v) => {
            onChangeNombre(v);
          }}
          containerStyle={styles.flex1}
        />
        <LabeledField
          icon="call-outline"
          label="Teléfono (WhatsApp)"
          placeholder="Ej. 71234567"
          value={telefonoCliente}
          onChangeText={(v) =>
            onChangeTelefono(sanitizeInteger(v, 9999999999915))
          }
          keyboardType="number-pad"
          maxLength={15}
          containerStyle={[styles.flex1, styles.ml8]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchField: {
    marginBottom: 4,
  },
  sectionChips: {
    marginBottom: 6,
  },
  labelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  chipsTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
  },
  ml8: {
    marginLeft: 8,
  },
});