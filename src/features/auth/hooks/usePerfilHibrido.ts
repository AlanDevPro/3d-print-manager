import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import {
  getProfile,
  updateProfile,
  UserProfile,
} from "../services/perfilService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function usePerfilHibrido(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.AUTH.PERFIL(userId ?? "");

  // 1. Lectura con caché en memoria (TanStack Query)
  const query = useQuery({
    queryKey,
    queryFn: () => getProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15, // 15 minutos de caché fresca
  });

  // 2. Escucha activa de cambios en tiempo real vía WebSockets (Supabase Realtime)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-perfil-${userId}`)
      // Escuchar cambios directos en la tabla 'profiles'
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Actualización instantánea de la caché local sin hacer request extra
          queryClient.setQueryData(queryKey, (oldData: UserProfile | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...payload.new,
            };
          });
        }
      )
      // Escuchar cambios de ROL o Empresa en 'empresa_miembros'
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "empresa_miembros",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-solicitar el perfil si un Admin cambia el rol o la membresía
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, queryKey]);

  return query;
}

// 3. Mutación para actualizar perfil desde el cliente
export function useUpdatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => updateProfile(userId, updates),
    onSuccess: (updatedData, { userId }) => {
      const queryKey = QUERY_KEYS.AUTH.PERFIL(userId);

      // Si el servicio retorna el perfil actualizado, actualizamos la caché directamente
      if (updatedData) {
        queryClient.setQueryData(queryKey, updatedData);
      }

      // Invalida la caché para forzar sincronización con el servidor
      queryClient.invalidateQueries({ queryKey });
    },
  });
}