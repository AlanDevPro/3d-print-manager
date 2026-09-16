import { supabase } from "@/services/supabase/client";
import * as Device from "expo-device";

// Importación y configuración segura para evitar fallos en entornos como Expo Go
let Notifications: typeof import("expo-notifications") | null = null;

try {
  Notifications = require("expo-notifications");
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async (): Promise<any> => ({
        shouldShowBanner: true, // Muestra la alerta/banner superior
        shouldShowList: true, // Muestra la notificación en el centro de notificaciones
        shouldPlaySound: true, // Reproduce el sonido
        shouldSetBadge: false, // Actualiza el indicador (badge) del icono
      }),
    });
  }
} catch (e) {
  console.warn(
    "Las notificaciones no son totalmente compatibles en este entorno (Expo Go).",
    e,
  );
}

export async function registrarPushToken(userId: string, empresaId: string) {
  // Asignamos a una constante local para que TypeScript permita el narrowing correctamente
  const notifs = Notifications;

  // Validamos tanto que sea un dispositivo físico como que el módulo de notificaciones esté disponible
  if (!Device.isDevice || !notifs) return;

  const { status: existingStatus } = await notifs.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await notifs.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  const tokenData = await notifs.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      empresa_id: empresaId,
      expo_push_token: expoPushToken,
    },
    { onConflict: "expo_push_token" },
  );
}
