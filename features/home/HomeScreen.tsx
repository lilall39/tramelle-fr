import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorRetry } from '@/components/ui/ErrorRetry';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FirstNameModal } from '@/components/home/FirstNameModal';
import { FloatingAddButton } from '@/components/home/FloatingAddButton';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ListSkeleton } from '@/components/home/ListSkeleton';
import { LoanRow } from '@/components/home/LoanRow';
import { SectionTitle } from '@/components/home/SectionTitle';
import { StatCard } from '@/components/home/StatCard';
import { StatsSkeleton } from '@/components/home/StatsSkeleton';
import { PulseSkeleton } from '@/components/ui/PulseSkeleton';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useHomeDerived } from '@/hooks/useHomeDerived';
import { useLocalFirstName } from '@/hooks/useLocalFirstName';
import { useLoansQuery } from '@/hooks/useLoansQuery';
import { isDevMockLoansMode } from '@/services/devLoansMock';
import { formatEur } from '@/utils/format';

const isDevBypassAuth = typeof __DEV__ !== 'undefined' && __DEV__;

const STAT_COUNT = 3;

function loansLoadErrorText(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return "Connexion à la base indisponible. Vérifiez que l'adresse Supabase et la clé publique sont bien actives sur le déploiement.";
    }
    return error.message;
  }
  if (error && typeof error === 'object') {
    const maybe = error as { message?: unknown };
    if (typeof maybe.message === 'string' && maybe.message.trim()) {
      return maybe.message;
    }
  }
  return 'Impossible de charger vos prêts.';
}

export function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const userId = user?.id;

  const isMockLoans = isDevMockLoansMode();

  const loansQuery = useLoansQuery({ userId });
  const { stats, urgent, recent } = useHomeDerived(loansQuery.data);
  const { displayFirstName, needsFirstNamePrompt, saveFirstName } = useLocalFirstName();

  const allowMainHome =
    isDevBypassAuth || isAuthLoading || Boolean(user) || isMockLoans;
  const showFirstNameModal = needsFirstNamePrompt && allowMainHome;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const statAnims = useRef(Array.from({ length: STAT_COUNT }, () => new Animated.Value(0))).current;
  const sectionLift = useRef(new Animated.Value(0)).current;

  const horizontalClass = useMemo(() => {
    if (width >= 1024) {
      return 'px-16';
    }
    if (width >= 768) {
      return 'px-12';
    }
    return 'px-6';
  }, [width]);

  const maxWidthClass = width >= 900 ? 'w-full max-w-3xl self-center' : 'w-full';

  const isBootstrapping = isAuthLoading && !isDevBypassAuth;
  const isLoansLoading = !isMockLoans && Boolean(userId) && loansQuery.isLoading;
  const showSkeleton = isBootstrapping || isLoansLoading;

  useEffect(() => {
    if (showSkeleton) {
      contentOpacity.setValue(0);
      statAnims.forEach((a) => a.setValue(0));
      sectionLift.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(
        58,
        statAnims.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 440,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ),
      Animated.timing(sectionLift, {
        toValue: 1,
        duration: 520,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, sectionLift, showSkeleton, statAnims]);

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['loans'] });
  };

  const statItems = useMemo(
    () =>
      [
        { label: 'On me doit', value: formatEur(stats.owedToMeTotalEur), variant: 'owed' as const },
        { label: 'Prêts ouverts', value: String(stats.openLoansCount), variant: 'open' as const },
        { label: 'À rendre', value: formatEur(stats.toReturnTotalEur), variant: 'return' as const },
      ] as const,
    [stats.openLoansCount, stats.owedToMeTotalEur, stats.toReturnTotalEur],
  );

  const openLoansSummaryLine = useMemo(() => {
    const n = stats.openLoansCount;
    if (n <= 0) {
      return 'Vous n’avez aucun prêt en cours.';
    }
    if (n === 1) {
      return 'Vous avez 1 prêt en cours.';
    }
    return `Vous avez ${n} prêts en cours.`;
  }, [stats.openLoansCount]);

  if (!isDevBypassAuth && !isAuthLoading && !user && !isMockLoans) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
        <View className={`flex-1 ${horizontalClass} pt-5`}>
          <HomeHeader firstName={displayFirstName} onAccountPress={() => router.push('/auth')} />
          <View className="mt-10 items-center">
            <Text className="text-center text-base leading-6 text-zinc-600 dark:text-muted">
              Connectez-vous pour afficher vos prêts synchronisés.
            </Text>
            <View className="mt-6 w-full max-w-xs">
              <PrimaryButton label="Se connecter" onPress={() => router.push('/auth')} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loansQuery.isError) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
        <View className="flex-1">
          <View className={`flex-1 ${horizontalClass} pt-5`}>
            <HomeHeader firstName={displayFirstName} onAccountPress={() => router.push('/auth')} />
            <ErrorRetry
              message={loansLoadErrorText(loansQuery.error)}
              onRetry={() => void loansQuery.refetch()}
            />
          </View>
          <FirstNameModal visible={showFirstNameModal} onContinue={saveFirstName} />
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !showSkeleton && (loansQuery.data?.length ?? 0) === 0;

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1">
        <ScrollView
          className={`flex-1 ${horizontalClass}`}
          contentContainerStyle={{ paddingBottom: 128 }}
          refreshControl={
            <RefreshControl refreshing={loansQuery.isFetching && !loansQuery.isLoading} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className={`${maxWidthClass} pb-8 pt-5`}>
            <HomeHeader firstName={displayFirstName} onAccountPress={() => router.push('/auth')} />

            {showSkeleton ? (
              <View className="mt-8">
                <StatsSkeleton />
                <View className="mt-7">
                  <PulseSkeleton heightClass="h-4" className="w-[88%] max-w-md" />
                </View>
                <SectionTitle title="Urgent" subtitle="Les prêts ouverts les plus anciens en premier." />
                <ListSkeleton rows={3} />
                <SectionTitle title="Activité récente" subtitle="Les entrées les plus récentes." />
                <ListSkeleton rows={3} />
              </View>
            ) : (
              <Animated.View style={{ opacity: contentOpacity }}>
                <View className="mt-8 flex-row flex-wrap gap-4">
                  {statItems.map((item, index) => (
                    <Animated.View
                      key={item.label}
                      style={{
                        flex: 1,
                        minWidth: 140,
                        opacity: statAnims[index],
                        transform: [
                          {
                            translateY: statAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [16, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <StatCard label={item.label} value={item.value} variant={item.variant} />
                    </Animated.View>
                  ))}
                </View>

                <Text className="mt-7 text-[15px] leading-[22px] tracking-[-0.2px] text-zinc-600 dark:text-zinc-400">
                  {openLoansSummaryLine}
                </Text>

                {isEmpty ? (
                  <Animated.View
                    style={{
                      marginTop: 36,
                      opacity: sectionLift,
                      transform: [
                        {
                          translateY: sectionLift.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <EmptyState title="Tout est à jour." />
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={{
                      opacity: sectionLift,
                      transform: [
                        {
                          translateY: sectionLift.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <View>
                      <SectionTitle title="Urgent" subtitle="Les prêts ouverts les plus anciens en premier." />
                      {urgent.length === 0 ? (
                        <Text className="text-sm leading-5 text-zinc-500 dark:text-muted">Aucun prêt urgent pour le moment.</Text>
                      ) : (
                        urgent.map((loan) => <LoanRow key={loan.id} loan={loan} />)
                      )}
                    </View>

                    <View>
                      <SectionTitle title="Activité récente" subtitle="Les entrées les plus récentes." />
                      {recent.length === 0 ? (
                        <Text className="text-sm leading-5 text-zinc-500 dark:text-muted">Aucune autre activité récente.</Text>
                      ) : (
                        recent.map((loan) => (
                          <LoanRow key={`recent-${loan.id}`} loan={loan} />
                        ))
                      )}
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {user || isDevBypassAuth || isMockLoans ? <FloatingAddButton onPress={() => router.push('/add')} /> : null}

        <FirstNameModal visible={showFirstNameModal} onContinue={saveFirstName} />
      </View>
    </SafeAreaView>
  );
}
