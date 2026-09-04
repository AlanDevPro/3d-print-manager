// src/features/pedidos/components/PedidosEmptyState.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PedidosEmptyStateProps {
  theme: any;
  mensaje?: string;
  subtitulo?: string;
  icono?: keyof typeof Ionicons.glyphMap;
  accionSugerida?: string;
}

export function PedidosEmptyState({ 
  theme, 
  mensaje, 
  subtitulo,
  icono = "file-tray-outline",
  accionSugerida = "Crea tu primer pedido desde el módulo de cotización"
}: PedidosEmptyStateProps) {
  // Determinar el mensaje según el contexto
  const getMensajePorDefecto = () => {
    if (mensaje) return mensaje;
    
    // Puedes personalizar según el filtro
    switch (icono) {
      case "checkmark-done-circle-outline":
        return "No hay pedidos completados";
      case "time-outline":
        return "No hay pedidos en progreso";
      case "alert-circle-outline":
        return "No hay pedidos urgentes";
      case "cash-outline":
        return "No hay pedidos pendientes de pago";
      default:
        return "No hay pedidos en esta categoría";
    }
  };

  // Determinar el subtítulo por defecto
  const getSubtituloPorDefecto = () => {
    if (subtitulo) return subtitulo;
    
    switch (icono) {
      case "checkmark-done-circle-outline":
        return "Los pedidos completados aparecerán aquí una vez finalizados";
      case "time-outline":
        return "Los pedidos en proceso se mostrarán cuando se inicien";
      case "alert-circle-outline":
        return "Los pedidos marcados como urgentes aparecerán aquí";
      case "cash-outline":
        return "Los pedidos pendientes de pago se listarán en esta sección";
      default:
        return "Los pedidos aparecerán aquí cuando los registres en el sistema";
    }
  };

  // Determinar el icono de acción sugerida
  const getIconoAccion = () => {
    switch (icono) {
      case "checkmark-done-circle-outline":
        return "stats-chart-outline";
      case "time-outline":
        return "play-circle-outline";
      case "alert-circle-outline":
        return "notifications-outline";
      case "cash-outline":
        return "card-outline";
      default:
        return "add-circle-outline";
    }
  };

  // Determinar el color de fondo del icono
  const getColorIcono = () => {
    switch (icono) {
      case "checkmark-done-circle-outline":
        return theme.success || "#10B981";
      case "time-outline":
        return theme.warning || "#F59E0B";
      case "alert-circle-outline":
        return theme.danger || "#EF4444";
      case "cash-outline":
        return theme.info || "#3B82F6";
      default:
        return theme.primary;
    }
  };

  const colorIcono = getColorIcono();

  return (
    <View style={styles.emptyState}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: `${colorIcono}15` }]}>
          <Ionicons name={icono} size={40} color={colorIcono} />
        </View>
      </View>
      
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {getMensajePorDefecto()}
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {getSubtituloPorDefecto()}
      </Text>
      
      <View style={[styles.actionContainer, { borderColor: theme.border }]}>
        <Ionicons 
          name={getIconoAccion()} 
          size={18} 
          color={colorIcono} 
        />
        <Text style={[styles.actionText, { color: theme.textMuted }]}>
          {accionSugerida}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 300,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});