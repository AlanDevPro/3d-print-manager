import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { supabase } from "@/services/supabase/client";

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,  // Muestra la alerta/banner superior
    shouldShowList: true,    // Muestra la notificación en el centro de notificaciones
    shouldPlaySound: true,   // Reproduce el sonido
    shouldSetBadge: false,   // Actualiza el indicador (badge) del icono
  }),
});

export async function registrarPushToken(userId: string, empresaId: string) {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
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