// src/utils/whatsapp.ts
import { Linking } from "react-native";

export function normalizarTelefonoWhatsapp(telefono: string): string {
  let limpio = telefono.replace(/[^\d+]/g, "");
  if (!limpio.startsWith("+")) {
    // Ajusta el código de país por defecto a tu mercado
    limpio = limpio.startsWith("591") ? `+${limpio}` : `+591${limpio}`;
  }
  return limpio.replace("+", "");
}

export async function abrirWhatsappConEnlace(
  telefono: string,
  mensaje: string,
): Promise<void> {
  const numero = normalizarTelefonoWhatsapp(telefono);
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  const soportado = await Linking.canOpenURL(url);
  if (!soportado) {
    throw new Error("No se pudo abrir WhatsApp en este dispositivo.");
  }
  await Linking.openURL(url);
}