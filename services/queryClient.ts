import { QueryClient } from '@tanstack/react-query';

const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
} as const;

/** Utilisé une seule fois dans `AppProviders` (racine). Ne pas instancier ailleurs pour éviter plusieurs clients sans provider. */
export function createQueryClient(): QueryClient {
  return new QueryClient(defaultQueryClientOptions);
}
