import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatTodayFrLong } from '@/utils/format';

type HomeHeaderProps = {
  firstName?: string | null;
  /** Accès permanent connexion / inscription / compte (route /auth). */
  onAccountPress?: () => void;
};

export function HomeHeader({ firstName, onAccountPress }: HomeHeaderProps) {
  const name = firstName?.trim();
  const greeting = name ? `Bonjour ${name}` : 'Bonjour';
  const todayLine = useMemo(() => formatTodayFrLong(), []);

  return (
    <View className="mb-2 flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text
          className="text-[32px] font-semibold tracking-[-0.6px] text-zinc-950 dark:text-foreground"
          accessibilityRole="header"
        >
          {greeting}
        </Text>
        {todayLine ? (
          <Text
            className="mt-2 text-[15px] font-normal leading-5 tracking-[-0.2px] text-zinc-500 dark:text-muted"
            accessibilityLabel={`Aujourd’hui, ${todayLine}`}
          >
            {todayLine}
          </Text>
        ) : null}
      </View>
      {onAccountPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compte, connexion et inscription"
          hitSlop={10}
          onPress={onAccountPress}
          className="mt-1 shrink-0 rounded-lg px-1 py-1 active:opacity-80"
        >
          <Text className="text-[14px] font-semibold text-gold">Compte</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
