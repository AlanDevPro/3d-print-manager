import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ItemDatoProps {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  editable: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "phone-pad" | "email-address";
}

export const ItemDato = ({
  icono,
  label,
  valor,
  editable,
  onChangeText,
  keyboardType = "default",
}: ItemDatoProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.itemDato}>
      <Ionicons
        name={icono}
        size={20}
        color={theme.textSecondary}
        style={styles.itemIcono}
      />
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: theme.textMuted }]}>
          {label}
        </Text>
        {editable ? (
          <TextInput
            style={[
              styles.itemInput,
              { color: theme.textPrimary, borderBottomColor: theme.primary },
            ]}
            value={valor}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={[styles.itemValor, { color: theme.textPrimary }]}>
            {valor}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemDato: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  itemIcono: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  itemValor: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  itemInput: {
    fontSize: 14,
    fontWeight: "500",
    borderBottomWidth: 1,
    paddingVertical: 2,
    marginTop: 2,
  },
});
