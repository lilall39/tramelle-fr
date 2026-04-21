import { useMemo } from 'react';

import type { HomeStats, LoanRow } from '@/types/loan';

const URGENT_LIMIT = 5;
const RECENT_LIMIT = 12;

function openContributionEur(loan: LoanRow, mode: LoanRow['mode']): number {
  if (loan.status !== 'open' || loan.mode !== mode) {
    return 0;
  }
  const kind: 'object' | 'money' = loan.loan_kind === 'money' ? 'money' : 'object';
  if (kind === 'money') {
    const a = loan.amount;
    if (a === null || Number.isNaN(Number(a))) {
      return 0;
    }
    return Number(a);
  }
  const v = loan.item_value;
  if (v === null || Number.isNaN(Number(v))) {
    return 0;
  }
  return Number(v);
}

function sumAmountOpen(loans: LoanRow[], mode: LoanRow['mode']): number {
  return loans.reduce((acc, loan) => acc + openContributionEur(loan, mode), 0);
}

export function useHomeDerived(loans: LoanRow[] | undefined) {
  return useMemo(() => {
    const list = loans ?? [];

    const stats: HomeStats = {
      owedToMeTotalEur: sumAmountOpen(list, 'lent'),
      openLoansCount: list.filter((l) => l.status === 'open').length,
      toReturnTotalEur: sumAmountOpen(list, 'borrowed'),
    };

    const urgent: LoanRow[] = [...list]
      .filter((l) => l.status === 'open')
      .sort((a, b) => {
        const ta = new Date(a.loan_date || a.created_at).getTime();
        const tb = new Date(b.loan_date || b.created_at).getTime();
        return ta - tb;
      })
      .slice(0, URGENT_LIMIT);

    const urgentIds = new Set(urgent.map((loan) => loan.id));

    const recent: LoanRow[] = [...list]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter((loan) => !urgentIds.has(loan.id))
      .slice(0, RECENT_LIMIT);

    return { stats, urgent, recent };
  }, [loans]);
}
