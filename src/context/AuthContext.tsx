import {
  getProfile,
  UserProfile,
} from "@/features/auth/services/perfilService";
import { RolUsuario } from "@/features/auth/types";
import { supabase } from "@/services/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  telefono: string | null;
  plan: string;
  verificado: boolean;
  rol: RolUsuario;
  avatar_url?: string | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const data: UserProfile | null = await getProfile(userId);
      if (data) {
        setProfile({
          id: data.id,
          email: data.email ?? "",
          full_name: data.full_name ?? null,
          telefono: data.telefono ?? null,
          plan: data.plan ?? "free",
          verificado: data.verificado ?? false,
          rol: data.rol ?? "cliente",
          avatar_url: data.avatarUrl ?? null,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error al cargar perfil global:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Obtener la sesión inicial almacenada
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setInitialized(true);
    });

    // 2. Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        setInitialized(true);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
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
