import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <Card className="items-center justify-center py-12">
      <Text className="text-center text-[17px] font-medium tracking-tight text-zinc-800 dark:text-foreground">{title}</Text>
      {subtitle ? (
        <Text className="mt-2 text-center text-sm leading-5 text-zinc-500 dark:text-muted">{subtitle}</Text>
      ) : null}
    </Card>
  );
}
