import { useMemo } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function LandingScreen() {
  const { width } = useWindowDimensions();

  const horizontalPadding = useMemo(() => {
    if (width >= 1024) {
      return 'px-16';
    }
    if (width >= 768) {
      return 'px-12';
    }
    return 'px-6';
  }, [width]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background" edges={['top', 'left', 'right']}>
      <View className={`flex-1 items-center justify-center ${horizontalPadding}`}>
        <View className="w-full max-w-2xl items-center gap-8">
          <View className="items-center gap-3">
            <Text className="text-5xl font-bold tracking-tight text-black dark:text-foreground">RendsÇa</Text>
            <Text className="text-center text-lg text-zinc-600 dark:text-muted">
              N&apos;oubliez plus ce qu&apos;on vous doit.
            </Text>
          </View>

          <PrimaryButton label="Commencer" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
}
