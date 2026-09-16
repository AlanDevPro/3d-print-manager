// src/features/pedidos/components/modal/ClienteSeccion.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import { Pedido } from "../../types";
import { AccionBoton } from "./AccionBoton";
import { FilaDetalle } from "./FilaDetalle";
import { SeccionModal } from "./SeccionModal";

interface ClienteSeccionProps {
  theme: any;
  pedido: Pedido;
  ubicacionLocalUrl: string | null; // viene de empresas.ubicacion_url
  onLlamar: () => void;
  onWhatsapp: () => void;
}

export function ClienteSeccion({
  theme,
  pedido,
  ubicacionLocalUrl,
  onLlamar,
  onWhatsapp,
}: ClienteSeccionProps) {
  const esRecoger =
    pedido.envio.tipo === "recoger" 

  const handleTercerBoton = () => {
    if (esRecoger) {
      if (!ubicacionLocalUrl || !pedido.cliente.telefono) return;
      const numero = pedido.cliente.telefono.replace(/[^0-9]/g, "");
      const mensaje = `Hola ${pedido.cliente.nombre}, aquí tienes la ubicación de nuestro local: ${ubicacionLocalUrl}`;
      Linking.openURL(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
      );
    } else {
      if (!pedido.cliente.direccion) return;
      const query = encodeURIComponent(pedido.cliente.direccion);
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${query}`
      );
    }
  };

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
        <AccionBoton
          theme={theme}
          icono={esRecoger ? "storefront-outline" : "navigate-outline"}
          label={esRecoger ? "Ubicación local" : "Ver ruta cliente"}
          color="#F59E0B"
          onPress={handleTercerBoton}
        />
      </View>
    </SeccionModal>
  );
}

const styles = StyleSheet.create({
  accionesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
});