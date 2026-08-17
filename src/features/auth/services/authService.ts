import { supabase } from "@/services/supabase/client";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

// Completa la sesión web en Android si la app fue reabierta vía navegador
WebBrowser.maybeCompleteAuthSession();

/**
 * 1. Registro con Email y Contraseña
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * 2. Login con Email y Contraseña
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * 3. Login con Google vía Supabase OAuth (Soporte dinámico para Expo Go y Build nativo)
 */
export const loginWithGoogle = async () => {
  try {
    // 1. Generar la URL de redirección dinámicamente según el entorno
    const redirectTo = makeRedirectUri({
      scheme: "cotizador3d",
      path: "auth/callback",
    });

    console.log("Redirect URI configurado:", redirectTo);

    // 2. Solicitar URL de autenticación OAuth a Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    // 3. Abrir la sesión de autenticación en el navegador del dispositivo
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success" && result.url) {
        // 4. Extraer el hash (#access_token=...) de forma limpia y segura
        const { params, errorCode } = QueryParams.getQueryParams(result.url);

        if (errorCode)
          throw new Error(`Error en redirección OAuth: ${errorCode}`);

        const { access_token, refresh_token } = params;

        if (access_token && refresh_token) {
          // 5. Inyectar los tokens a la sesión activa del cliente de Supabase
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

          if (sessionError) throw sessionError;
          return sessionData;
        }
      }
    }
  } catch (err) {
    console.error("Error durante el inicio de sesión con Google:", err);
    throw err;
  }
};

/**
 * 4. Cerrar sesión
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
