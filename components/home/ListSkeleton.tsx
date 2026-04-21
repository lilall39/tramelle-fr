import { View } from 'react-native';

import { PulseSkeleton } from '@/components/ui/PulseSkeleton';

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          className="mb-4 rounded-[20px] border border-zinc-200/55 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40"
        >
          <PulseSkeleton heightClass="h-4" className="w-2/3" />
          <PulseSkeleton heightClass="h-3" className="mt-3 w-1/2" />
          <PulseSkeleton heightClass="h-3" className="mt-4 w-full" />
        </View>
      ))}
    </View>
  );
}
