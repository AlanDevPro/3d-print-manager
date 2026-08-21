import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SeccionProps {
  titulo: string;
  actionText?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
}

export const Seccion = ({
  titulo,
  actionText,
  onActionPress,
  children,
}: SeccionProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.seccion}>
      <View style={styles.seccionHeader}>
        <Text style={[styles.seccionTitulo, { color: theme.textSecondary }]}>
          {titulo}
        </Text>
        {actionText && (
          <Pressable onPress={onActionPress}>
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {actionText}
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: {
    gap: 8,
  },
  seccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
