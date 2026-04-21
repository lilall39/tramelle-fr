import { useQuery } from '@tanstack/react-query';

import { getDevMockLoans, isDevMockLoansMode } from '@/services/devLoansMock';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import type { LoanRow } from '@/types/loan';

type UseLoansQueryArgs = {
  userId: string | undefined;
};

export function useLoansQuery({ userId }: UseLoansQueryArgs) {
  const mock = isDevMockLoansMode();

  return useQuery({
    queryKey: ['loans', mock ? 'dev-mock' : userId],
    enabled: mock || Boolean(isSupabaseConfigured() && userId),
    initialData: mock ? getDevMockLoans() : undefined,
    staleTime: mock ? Infinity : undefined,
    queryFn: async (): Promise<LoanRow[]> => {
      if (mock) {
        return getDevMockLoans();
      }
      if (!userId) {
        return [];
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as LoanRow[];
    },
  });
}
