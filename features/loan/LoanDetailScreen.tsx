import { useState, type ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RelanceModal } from '@/components/loan/RelanceModal';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useLoanById } from '@/hooks/useLoanById';
import { useDeleteLoan, useMarkLoanReturned } from '@/hooks/useLoanMutations';
import { isDevMockLoansMode } from '@/services/devLoansMock';
import { isSupabaseConfigured } from '@/services/supabase';
import type { LoanRow } from '@/types/loan';
import {
  expectedReturnLabel,
  isLoanOverdue,
  loanDateLabel,
  loanDaysElapsed,
  loanPrimaryLabel,
  loanRightAmountEur,
  normalizeLoanKind,
} from '@/utils/loanDisplay';

function buildReminderBody(loan: LoanRow): string {
  const label = loanPrimaryLabel(loan);
  return `Bonjour,\n\nJe me permets de vous relancer concernant : ${label}.\n\nMerci de votre retour.`;
}

function InfoCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
        {label}
      </Text>
      <View className="mt-1.5">{children}</View>
    </Card>
  );
}

export function LoanDetailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthSession();
  const [relanceOpen, setRelanceOpen] = useState(false);
  const { loan, isLoading, isError } = useLoanById(typeof id === 'string' ? id : undefined);

  const markReturned = useMarkLoanReturned();
  const deleteLoan = useDeleteLoan();

  const mockMode = isDevMockLoansMode();
  const canMutate = Boolean(user?.id && isSupabaseConfigured() && !mockMode);

  const twoCol = width >= 380;
  const tileHalf = twoCol ? 'w-[48%]' : 'w-full';

  const onMarkReturned = () => {
    if (!loan) {
      return;
    }
    if (!canMutate || !user?.id) {
      Alert.alert(
        'Enregistrement indisponible',
        mockMode || !isSupabaseConfigured()
          ? 'En mode démo sans base Supabase, le marquage « rendu » ne peut pas être enregistré. Ajoutez vos variables d’environnement et connectez-vous pour synchroniser vos prêts.'
          : 'Connectez-vous pour enregistrer ce changement dans le cloud.',
      );
      return;
    }
    void (async () => {
      try {
        await markReturned.mutateAsync({ loanId: loan.id, userId: user.id });
        router.back();
      } catch (e) {
        Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible.');
      }
    })();
  };

  const onDelete = () => {
    if (!loan) {
      return;
    }
    if (!canMutate || !user?.id) {
      Alert.alert(
        'Suppression indisponible',
        mockMode || !isSupabaseConfigured()
          ? 'En mode démo sans Supabase, la suppression côté serveur n’est pas possible. Configurez la base et connectez-vous.'
          : 'Connectez-vous pour supprimer ce prêt.',
      );
      return;
    }
    Alert.alert(
      'Supprimer ce prêt ?',
      'Cette action est définitive. Vous ne pourrez pas annuler.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            void (async () => {
              try {
                await deleteLoan.mutateAsync({ loanId: loan.id, userId: user.id });
                router.replace('/');
              } catch (e) {
                Alert.alert('Erreur', e instanceof Error ? e.message : 'Suppression impossible.');
              }
            })(),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-stone-50 dark:bg-background" edges={['top']}>
        <ActivityIndicator color="#A17E45" />
      </SafeAreaView>
    );
  }

  if (isError || !loan) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 px-5 dark:bg-background" edges={['top', 'left', 'right']}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="mt-2 py-3">
          <Text className="text-[15px] font-medium text-zinc-600 dark:text-muted">Retour</Text>
        </Pressable>
        <Text className="mt-8 text-center text-base text-zinc-600 dark:text-muted">Prêt introuvable.</Text>
      </SafeAreaView>
    );
  }

  const kind = normalizeLoanKind(loan);
  const overdue = isLoanOverdue(loan);
  const days = loanDaysElapsed(loan);
  const rightVal = loanRightAmountEur(loan);
  const retLabel = expectedReturnLabel(loan);
  const loanWhen = loanDateLabel(loan);

  const dayWord = days === 1 ? 'jour' : 'jours';
  const daysLine =
    loan.mode === 'lent'
      ? `Prêté depuis ${days} ${dayWord}`
      : `Emprunté depuis ${days} ${dayWord}`;

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center px-4 pb-1 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          hitSlop={14}
          className="py-2 pr-4"
        >
          <Text className="text-[22px] font-light text-zinc-500 dark:text-zinc-400">‹</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-1">
          <Text
            className={`text-[28px] font-semibold leading-[34px] tracking-[-0.5px] ${kind === 'money' ? 'text-gold' : 'text-zinc-950 dark:text-foreground'}`}
          >
            {loanPrimaryLabel(loan)}
          </Text>
          <Text className="mt-3 text-[18px] font-medium tracking-[-0.2px] text-zinc-800 dark:text-zinc-200">
            {loan.person_name}
          </Text>
          <Text className="mt-2 text-[14px] leading-5 text-zinc-500 dark:text-muted">{daysLine}</Text>
          {rightVal ? (
            <Text className="mt-2 text-[14px] font-medium text-gold">Valeur estimée · {rightVal}</Text>
          ) : null}
        </View>

        <View className="mt-6 flex-row flex-wrap gap-3">
          <View className={tileHalf}>
            <InfoCard label="Type">
              <Text className="text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                {kind === 'money' ? 'Argent' : 'Objet'}
              </Text>
            </InfoCard>
          </View>
          <View className={tileHalf}>
            <InfoCard label="Sens">
              <Text className="text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                {loan.mode === 'lent' ? 'Je prête' : "J'emprunte"}
              </Text>
            </InfoCard>
          </View>
          <View className={tileHalf}>
            <InfoCard label="Date du prêt">
              <Text className="text-[15px] font-semibold text-zinc-950 dark:text-foreground">{loanWhen}</Text>
            </InfoCard>
          </View>
          <View className={tileHalf}>
            <InfoCard label="Retour prévu">
              <Text className="text-[15px] font-semibold text-zinc-950 dark:text-foreground">{retLabel ?? '—'}</Text>
            </InfoCard>
          </View>
          <View className="w-full">
            <InfoCard label="Statut">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                  {loan.status === 'open' ? 'Ouvert' : 'Rendu'}
                </Text>
                {overdue && loan.status === 'open' ? (
                  <View className="rounded-full border border-amber-300/60 bg-amber-50/90 px-2 py-0.5 dark:border-amber-800/60 dark:bg-amber-950/50">
                    <Text className="text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                      Retour dépassé
                    </Text>
                  </View>
                ) : null}
              </View>
            </InfoCard>
          </View>
        </View>

        {loan.note?.trim() ? (
          <Card className="mt-4 border-l-[3px] border-l-gold/70 p-4">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
              Note
            </Text>
            <Text className="mt-2 text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">{loan.note.trim()}</Text>
          </Card>
        ) : null}

        <View className="mt-7 gap-3">
          <PrimaryButton label="Relancer" onPress={() => setRelanceOpen(true)} />
          <RelanceModal
            visible={relanceOpen}
            onClose={() => setRelanceOpen(false)}
            message={buildReminderBody(loan)}
          />

          {loan.status === 'open' ? (
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                disabled={markReturned.isPending}
                onPress={onMarkReturned}
                className="flex-1 rounded-2xl border border-gold/45 bg-white py-3.5 active:opacity-90 dark:border-gold/40 dark:bg-zinc-900"
              >
                <Text className="text-center text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                  Marquer rendu
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/loan/${loan.id}/edit`)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3.5 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Text className="text-center text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                  Modifier
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/loan/${loan.id}/edit`)}
              className="rounded-2xl border border-zinc-200 bg-white py-3.5 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Text className="text-center text-[15px] font-semibold text-zinc-950 dark:text-foreground">
                Modifier
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={deleteLoan.isPending}
            onPress={onDelete}
            className="items-center py-3 active:opacity-80"
          >
            <Text className="text-[15px] font-semibold text-red-600 dark:text-red-400">Supprimer</Text>
          </Pressable>
        </View>

        {!canMutate ? (
          <Text className="mt-4 text-center text-[12px] leading-5 text-zinc-500 dark:text-muted">
            {mockMode || !isSupabaseConfigured()
              ? 'Sans Supabase, vous pouvez ouvrir « Modifier » pour voir le formulaire ; l’enregistrement nécessite une base connectée et une session.'
              : 'Connectez-vous pour enregistrer les changements dans le cloud.'}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
