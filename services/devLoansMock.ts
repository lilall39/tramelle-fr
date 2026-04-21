import { isSupabaseConfigured } from '@/services/supabase';
import type { LoanRow } from '@/types/loan';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

function isoDaysAgo(n: number): string {
  const t = Date.now() - n * 86_400_000;
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Données de démo en développement lorsque les variables Supabase ne sont pas définies. */
export function isDevMockLoansMode(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ && !isSupabaseConfigured();
}

export function getDevMockLoans(): LoanRow[] {
  const created = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

  return [
    {
      id: 'mock-1',
      user_id: MOCK_USER_ID,
      loan_kind: 'object',
      mode: 'lent',
      person_name: 'Camille Rousseau',
      person_email: null,
      person_phone: null,
      item_name: 'Appareil photo Leica Q3',
      amount: null,
      item_value: 1200,
      note: null,
      created_at: created(52),
      loan_date: isoDaysAgo(52),
      expected_return_date: isoDaysAgo(12),
      reminder_at: null,
      status: 'open',
      returned_at: null,
    },
    {
      id: 'mock-2',
      user_id: MOCK_USER_ID,
      loan_kind: 'object',
      mode: 'lent',
      person_name: 'Thomas Bernard',
      person_email: null,
      person_phone: null,
      item_name: 'Montre mécanique vintage',
      amount: null,
      item_value: 890,
      note: null,
      created_at: created(38),
      loan_date: isoDaysAgo(38),
      expected_return_date: isoDaysAgo(4),
      reminder_at: null,
      status: 'open',
      returned_at: null,
    },
    {
      id: 'mock-3',
      user_id: MOCK_USER_ID,
      loan_kind: 'money',
      mode: 'borrowed',
      person_name: 'Atelier Lumière',
      person_email: null,
      person_phone: null,
      item_name: null,
      amount: 850,
      item_value: null,
      note: null,
      created_at: created(19),
      loan_date: isoDaysAgo(19),
      expected_return_date: null,
      reminder_at: null,
      status: 'open',
      returned_at: null,
    },
    {
      id: 'mock-4',
      user_id: MOCK_USER_ID,
      loan_kind: 'object',
      mode: 'lent',
      person_name: 'Marie Hébert',
      person_email: null,
      person_phone: null,
      item_name: 'Polaroid SX-70',
      amount: null,
      item_value: null,
      note: null,
      created_at: created(11),
      loan_date: isoDaysAgo(11),
      expected_return_date: null,
      reminder_at: null,
      status: 'open',
      returned_at: null,
    },
    {
      id: 'mock-5',
      user_id: MOCK_USER_ID,
      loan_kind: 'object',
      mode: 'borrowed',
      person_name: 'Sophie Martin',
      person_email: null,
      person_phone: null,
      item_name: 'Sac cuir artisanal',
      amount: null,
      item_value: 320,
      note: null,
      created_at: created(4),
      loan_date: isoDaysAgo(4),
      expected_return_date: isoDaysAgo(1),
      reminder_at: null,
      status: 'open',
      returned_at: null,
    },
    {
      id: 'mock-6',
      user_id: MOCK_USER_ID,
      loan_kind: 'object',
      mode: 'lent',
      person_name: 'Julien Petit',
      person_email: null,
      person_phone: null,
      item_name: 'Platine Rega Planar 3',
      amount: null,
      item_value: 450,
      note: null,
      created_at: created(63),
      loan_date: isoDaysAgo(63),
      expected_return_date: null,
      reminder_at: null,
      status: 'returned',
      returned_at: created(5),
    },
  ];
}
