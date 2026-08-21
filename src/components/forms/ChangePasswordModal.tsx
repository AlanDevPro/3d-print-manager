import { useTheme } from "@/hooks/useTheme";
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  passActual: string;
  setPassActual: (v: string) => void;
  passNueva: string;
  setPassNueva: (v: string) => void;
  onSubmit: () => void;
}

export const ChangePasswordModal = ({
  visible,
  onClose,
  passActual,
  setPassActual,
  passNueva,
  setPassNueva,
  onSubmit,
}: ChangePasswordModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.bgSurface }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            Cambiar Contraseña
          </Text>

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Contraseña Actual
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.textPrimary,
                backgroundColor: theme.inputBg,
              },
            ]}
            secureTextEntry
            value={passActual}
            onChangeText={setPassActual}
            placeholder="••••••••"
            placeholderTextColor={theme.textMuted}
          />

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Nueva Contraseña
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.textPrimary,
                backgroundColor: theme.inputBg,
              },
            ]}
            secureTextEntry
            value={passNueva}
            onChangeText={setPassNueva}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={theme.textMuted}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.btnModal, { backgroundColor: theme.bgSecondary }]}
              onPress={onClose}
            >
              <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btnModal, { backgroundColor: theme.primary }]}
              onPress={onSubmit}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Actualizar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  btnModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
