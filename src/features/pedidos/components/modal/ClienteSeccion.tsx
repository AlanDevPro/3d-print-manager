// src/features/pedidos/components/modal/ClienteSeccion.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Pedido } from "../../types";
import { AccionBoton } from "./AccionBoton";
import { FilaDetalle } from "./FilaDetalle";
import { SeccionModal } from "./SeccionModal";

interface ClienteSeccionProps {
  theme: any;
  pedido: Pedido;
  onLlamar: () => void;
  onWhatsapp: () => void;
}

export function ClienteSeccion({
  theme,
  pedido,
  onLlamar,
  onWhatsapp,
}: ClienteSeccionProps) {
  return (
    <SeccionModal titulo="Cliente" icono="person-outline" theme={theme}>
      <FilaDetalle
        theme={theme}
        label="Nombre"
        valor={pedido.cliente.nombre}
        icono="person-circle-outline"
      />
      <FilaDetalle
        theme={theme}
        label="Teléfono"
        valor={pedido.cliente.telefono}
        icono="call-outline"
      />
      <FilaDetalle
        theme={theme}
        label="Dirección"
        valor={pedido.cliente.direccion}
        icono="location-outline"
      />
      {!!pedido.cliente.notas && (
        <FilaDetalle
          theme={theme}
          label="Notas"
          valor={pedido.cliente.notas}
          icono="document-text-outline"
        />
      )}
      <View style={styles.accionesRow}>
        <AccionBoton
          theme={theme}
          icono="call-outline"
          label="Llamar"
          color="#3B82F6"
          onPress={onLlamar}
        />
        <AccionBoton
          theme={theme}
          icono="logo-whatsapp"
          label="WhatsApp"
          color="#25D366"
          onPress={onWhatsapp}
        />
      </View>
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  accionesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
});