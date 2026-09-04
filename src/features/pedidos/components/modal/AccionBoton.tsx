// src/features/pedidos/components/modal/AccionBoton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export interface AccionBotonProps extends TouchableOpacityProps {
  theme: any;
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress?: () => void;
  disabled?: boolean;
  cargando?: boolean;
}

export function AccionBoton({
  theme,
  icono,
  label,
  color,
  onPress,
  disabled = false,
  cargando = false,
  ...rest
}: AccionBotonProps) {
  const estaDeshabilitado = disabled || cargando;

  return (
    <TouchableOpacity
      style={[
        styles.accionBoton,
        {
          backgroundColor: color + "1A",
          opacity: estaDeshabilitado ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={estaDeshabilitado}
      activeOpacity={0.8}
      {...rest}
    >
      {cargando ? (
        <ActivityIndicator size={15} color={color} />
      ) : (
        <Ionicons name={icono} size={15} color={color} />
      )}
      <Text style={[styles.accionBotonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accionBoton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accionBotonText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
});
