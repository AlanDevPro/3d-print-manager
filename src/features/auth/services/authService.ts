//src/feature/auth/services/authService
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/services/supabase/client";

WebBrowser.maybeCompleteAuthSession();

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const loginWithGoogle = async () => {
  try {
    const redirectTo = makeRedirectUri({
      scheme: "cotizador3d",
      path: "auth/callback",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success" && result.url) {
        const { params, errorCode } = QueryParams.getQueryParams(result.url);
        if (errorCode) throw new Error(`Error OAuth: ${errorCode}`);

        const { access_token, refresh_token } = params;
        if (access_token && refresh_token) {
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
    console.error("Error durante inicio de sesión con Google:", err);
    throw err;
  }
};

export const changePassword = async (passActual: string, passNueva: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("No hay un usuario autenticado activo.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: passActual,
  });

  if (signInError) throw new Error("La contraseña actual es incorrecta.");

  const { error: updateError } = await supabase.auth.updateUser({
    password: passNueva,
  });
  if (updateError) throw updateError;
};

export const deleteAccount = async (userId: string) => {
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) throw profileError;

  const { error: authError } = await supabase.rpc("delete_user_account");
  if (authError)
    console.warn("Nota sobre eliminación Auth:", authError.message);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
