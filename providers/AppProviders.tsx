import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from '@/services/queryClient';

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Point unique pour les providers globaux (évite les doubles QueryClientProvider).
 * Le QueryClient est créé une fois par montage de l’arbre racine (stable web + mobile, bon comportement au Fast Refresh).
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
