import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSupabase } from '@/services/supabase';
import type { CreateLoanPayload } from '@/types/loan';

export function useMarkLoanReturned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, userId }: { loanId: string; userId: string }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('loans')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString(),
        })
        .eq('id', loanId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, userId }: { loanId: string; userId: string }) => {
      const supabase = getSupabase();
      const { error } = await supabase.from('loans').delete().eq('id', loanId).eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      loanId,
      userId,
      payload,
    }: {
      loanId: string;
      userId: string;
      payload: CreateLoanPayload;
    }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('loans')
        .update({
          mode: payload.mode,
          loan_kind: payload.loan_kind,
          person_name: payload.person_name,
          person_email: payload.person_email,
          person_phone: payload.person_phone,
          item_name: payload.item_name,
          amount: payload.amount,
          item_value: payload.item_value,
          loan_date: payload.loan_date,
          expected_return_date: payload.expected_return_date,
          note: payload.note,
          status: payload.status,
        })
        .eq('id', loanId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
