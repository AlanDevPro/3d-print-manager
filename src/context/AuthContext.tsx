import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";
import { usePerfilHibrido } from "@/features/auth/hooks/usePerfilHibrido";
import { RolUsuario } from "@/features/auth/types";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  telefono: string | null;
  avatar_url: string | null;
  rol: RolUsuario;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  initialized: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  initialized: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionInitializing, setSessionInitializing] = useState(true);

  const user = session?.user ?? null;

  // 1. Delegamos la obtención, caché y sincronización en tiempo real del perfil al hook híbrido
  const { data: rawProfile, isLoading: isProfileLoading, refetch } = usePerfilHibrido(user?.id);

  // 2. Control del ciclo de vida de autenticación (JWT y tokens de Supabase Auth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setSessionInitializing(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setSessionInitializing(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Mapear estrictamente los campos existentes en la tabla `profiles`
  const profile: Profile | null = rawProfile
    ? {
        id: rawProfile.id,
        email: rawProfile.email ?? user?.email ?? "",
        full_name: rawProfile.full_name ?? null,
        telefono: rawProfile.telefono ?? null,
        avatar_url: rawProfile.avatarUrl ?? rawProfile.avatarUrl ?? null,
        rol: (rawProfile.rol as RolUsuario) ?? "cliente",
      }
    : null;

  // La app se considera inicializada cuando la sesión resuelve Y cuando finaliza la carga del perfil
  const initialized = !sessionInitializing && !(Boolean(user) && isProfileLoading);

  const refreshProfile = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        initialized,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};