import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSupabase } from '@/services/supabase';
import type { CreateLoanPayload } from '@/types/loan';

type Args = {
  userId: string;
  payload: CreateLoanPayload;
};

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, payload }: Args) => {
      const supabase = getSupabase();
      const { error } = await supabase.from('loans').insert({
        user_id: userId,
        mode: payload.mode,
        loan_kind: payload.loan_kind,
        person_name: payload.person_name,
        item_name: payload.item_name,
        amount: payload.amount,
        item_value: payload.item_value,
        loan_date: payload.loan_date,
        expected_return_date: payload.expected_return_date,
        note: payload.note,
        status: payload.status,
        reminder_at: null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
