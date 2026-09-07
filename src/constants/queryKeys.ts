export const QUERY_KEYS = {
  AUTH: {
    PERFIL: (userId: string) => ['auth', 'perfil', userId] as const,
  },
} as const;