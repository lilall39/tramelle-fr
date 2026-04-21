import { useMemo } from 'react';

import { useAuthSession } from '@/hooks/useAuthSession';
import { useLoansQuery } from '@/hooks/useLoansQuery';
import { isDevMockLoansMode } from '@/services/devLoansMock';
import type { LoanRow } from '@/types/loan';

export function useLoanById(loanId: string | undefined): {
  loan: LoanRow | undefined;
  isLoading: boolean;
  isError: boolean;
  userId: string | undefined;
  mock: boolean;
} {
  const { user } = useAuthSession();
  const userId = user?.id;
  const mock = isDevMockLoansMode();
  const loansQuery = useLoansQuery({ userId });

  const loan = useMemo(
    () => loansQuery.data?.find((l) => l.id === loanId),
    [loansQuery.data, loanId],
  );

  const isLoading = !mock && loansQuery.isLoading;

  return {
    loan,
    isLoading,
    isError: loansQuery.isError,
    userId,
    mock,
  };
}
