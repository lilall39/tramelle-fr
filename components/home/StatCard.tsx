import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { StatGlyph } from '@/components/home/StatGlyph';

type StatVariant = 'owed' | 'open' | 'return';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  variant: StatVariant;
};

export function StatCard({ label, value, hint, variant }: StatCardProps) {
  return (
    <Card className="min-w-[140px] flex-1 px-4 py-5">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            {label}
          </Text>
          <Text className="mt-3 text-[30px] font-semibold tabular-nums tracking-[-0.8px] text-zinc-950 dark:text-foreground">
            {value}
          </Text>
        </View>
        <StatGlyph kind={variant} />
      </View>
      {hint ? <Text className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{hint}</Text> : null}
    </Card>
  );
}
