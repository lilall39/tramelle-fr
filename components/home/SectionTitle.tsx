import { Text, View } from 'react-native';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View className="mb-4 mt-11">
      <Text className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-foreground">{title}</Text>
      {subtitle ? (
        <Text className="mt-1.5 text-[13px] leading-5 text-zinc-500 dark:text-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
