import type { LoanKind, LoanRow } from '@/types/loan';

import { formatEur, formatShortDate } from '@/utils/format';

export function normalizeLoanKind(loan: LoanRow): LoanKind {
  return loan.loan_kind === 'money' ? 'money' : 'object';
}

/** Libellé principal : objet = nom ; argent = montant formaté. */
export function loanPrimaryLabel(loan: LoanRow): string {
  const kind = normalizeLoanKind(loan);
  if (kind === 'money') {
    if (loan.amount !== null && !Number.isNaN(Number(loan.amount))) {
      return formatEur(Number(loan.amount));
    }
    return '—';
  }
  return loan.item_name?.trim() || '—';
}

/**
 * Montant à afficher à droite : uniquement pour un objet avec valeur estimée.
 * Jamais pour objet sans valeur ; pas de doublon pour type argent.
 */
export function loanRightAmountEur(loan: LoanRow): string | null {
  const kind = normalizeLoanKind(loan);
  if (kind !== 'object') {
    return null;
  }
  if (loan.item_value !== null && !Number.isNaN(Number(loan.item_value))) {
    return formatEur(Number(loan.item_value));
  }
  return null;
}

export function loanDateLabel(loan: LoanRow): string {
  const raw = loan.loan_date || loan.created_at;
  return formatShortDate(raw);
}

export function expectedReturnLabel(loan: LoanRow): string | null {
  if (!loan.expected_return_date) {
    return null;
  }
  return formatShortDate(loan.expected_return_date);
}

/** Comparaison simple sur chaînes YYYY-MM-JJ (UTC). */
export function isIsoDateBeforeToday(isoDate: string): boolean {
  const t = todayIsoDateLocal();
  return isoDate < t;
}

export function todayIsoDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Retard : date de retour prévue strictement avant aujourd’hui.
 * Compat : ancien reminder_at si pas de expected_return_date.
 */
export function isLoanOverdue(loan: LoanRow): boolean {
  if (loan.status !== 'open') {
    return false;
  }
  const iso =
    loan.expected_return_date?.slice(0, 10) ??
    (loan.reminder_at ? loan.reminder_at.slice(0, 10) : null);
  if (!iso) {
    return false;
  }
  return isIsoDateBeforeToday(iso);
}

export function urgentSortKey(loan: LoanRow): number {
  const raw = loan.loan_date || loan.created_at;
  return new Date(raw).getTime();
}

function parseLocalDay(iso: string): Date {
  const raw = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  return new Date(iso);
}

/** Nombre de jours calendaires depuis la date du prêt (à partir de minuit local). */
export function loanDaysElapsed(loan: LoanRow): number {
  const start = parseLocalDay(loan.loan_date || loan.created_at);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}
