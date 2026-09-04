// src/components/ui/parametros/RespaldoSection.tsx
import { ThemeContext } from "@/context/ThemeContext";
import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { ParametroCampoSwitch } from "../ParametroCampo";

interface RespaldoValores {
  backupNubeActivo?: boolean;
}

interface RespaldoSectionProps {
  respaldo: RespaldoValores;
  onChange: (cambios: Partial<RespaldoValores>) => void;
}

export function RespaldoSection({ respaldo, onChange }: RespaldoSectionProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <ParametroCampoSwitch
        label="Copia de Seguridad en la Nube"
        value={respaldo.backupNubeActivo ?? true}
        onChange={(backupNubeActivo) => onChange({ backupNubeActivo })}
      />
      <Text style={[styles.hint, { color: theme.textMuted }]}>
        Exportar registros (CSV / Excel) disponible desde la pantalla de
        Comprobantes.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, marginTop: 8 },
});
