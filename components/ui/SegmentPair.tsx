import { Pressable, Text, View } from 'react-native';

type SegProps<T extends string> = {
  left: { key: T; label: string };
  right: { key: T; label: string };
  value: T;
  onChange: (v: T) => void;
};

export function SegmentPair<T extends string>({ left, right, value, onChange }: SegProps<T>) {
  return (
    <View className="flex-row gap-2">
      {[left, right].map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            onPress={() => onChange(opt.key)}
            className={`flex-1 rounded-2xl border py-3 ${
              active
                ? 'border-gold bg-gold/15 dark:border-gold dark:bg-gold/10'
                : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
            }`}
          >
            <Text
              className={`text-center text-[15px] font-semibold ${active ? 'text-zinc-950 dark:text-foreground' : 'text-zinc-500 dark:text-muted'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
