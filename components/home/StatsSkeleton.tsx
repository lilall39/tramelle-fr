import { View } from 'react-native';

import { PulseSkeleton } from '@/components/ui/PulseSkeleton';

function StatCardSkeleton() {
  return (
    <View className="min-w-[140px] flex-1 rounded-[20px] border border-zinc-200/55 bg-white px-4 py-5 dark:border-zinc-800/80 dark:bg-zinc-900/40">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <PulseSkeleton heightClass="h-2.5" className="w-20" />
          <PulseSkeleton heightClass="h-9" className="mt-3 w-[70%]" />
        </View>
        <PulseSkeleton heightClass="h-7" className="w-7 rounded-full" />
      </View>
    </View>
  );
}

export function StatsSkeleton() {
  return (
    <View className="flex-row flex-wrap gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </View>
  );
}
