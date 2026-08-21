import { supabase } from "@/services/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useEffect, useState } from "react";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  initialized: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Obtener la sesión inicial almacenada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. Suscribirse a cambios de estado de autenticación (login, logout, refresh token)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setInitialized(true);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
