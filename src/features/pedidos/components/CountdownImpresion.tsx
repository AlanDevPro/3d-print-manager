import { Text, View } from "react-native";
import { useCountdownPedido } from "../hooks/useCountdownPedido";

export function CountdownImpresion({ fechaEstimadaListo }: { fechaEstimadaListo: string | null }) {
  const { texto, finalizado } = useCountdownPedido(fechaEstimadaListo);
  if (!texto) return null;

  return (
    <View>
      <Text>
        {finalizado ? "Actualizando estado..." : `Listo en: ${texto}`}
      </Text>
    </View>
  );
}