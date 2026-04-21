import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { LoanRow as LoanRowType } from '@/types/loan';
import {
  expectedReturnLabel,
  isLoanOverdue,
  loanDateLabel,
  loanPrimaryLabel,
  loanRightAmountEur,
  normalizeLoanKind,
} from '@/utils/loanDisplay';

type LoanRowProps = {
  loan: LoanRowType;
  showMeta?: boolean;
};

export function LoanRow({ loan, showMeta = true }: LoanRowProps) {
  const router = useRouter();
  const kind = normalizeLoanKind(loan);
  const modeLabel = loan.mode === 'lent' ? 'Prêté' : 'Emprunté';
  const kindLabel = kind === 'money' ? 'Argent' : 'Objet';
  const title = loanPrimaryLabel(loan);
  const rightEur = loanRightAmountEur(loan);
  const overdue = isLoanOverdue(loan);
  const loanWhen = loanDateLabel(loan);
  const returnWhen = expectedReturnLabel(loan);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Ouvre le détail du prêt"
      onPress={() => router.push(`/loan/${loan.id}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.93 : 1,
        transform: [{ scale: pressed ? 0.988 : 1 }],
      })}
    >
      <Card
        className={`mb-4 py-4 ${overdue ? 'border border-amber-200/70 bg-amber-50/35 dark:border-amber-900/45 dark:bg-amber-950/25' : ''}`}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text
              className={`text-base font-semibold ${kind === 'money' ? 'text-gold' : 'text-zinc-950 dark:text-foreground'}`}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text className="mt-1.5 text-sm text-zinc-600 dark:text-muted" numberOfLines={1}>
              {loan.person_name}
            </Text>
            {showMeta ? (
              <Text className="mt-2 text-[13px] leading-5 text-zinc-500 dark:text-muted">
                Prêt le {loanWhen}
                {returnWhen ? ` · Retour prévu le ${returnWhen}` : ''}
              </Text>
            ) : null}
          </View>
          {rightEur ? (
            <View className="items-end">
              <Text className="text-[15px] font-semibold tabular-nums text-gold">{rightEur}</Text>
              <Text className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Valeur
              </Text>
            </View>
          ) : null}
        </View>
        <View className="mt-4 flex-row flex-wrap items-center gap-2">
          <View className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">
            <Text className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{modeLabel}</Text>
          </View>
          <View className="rounded-full border border-zinc-200/80 bg-white px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-800/60">
            <Text className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{kindLabel}</Text>
          </View>
          {overdue ? (
            <View className="rounded-full border border-amber-300/60 bg-white/80 px-2 py-0.5 dark:border-amber-700/50 dark:bg-zinc-900/80">
              <Text className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                Retour dépassé
              </Text>
            </View>
          ) : null}
          <Text className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
            {loan.status === 'open' ? 'Ouvert' : 'Rendu'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
