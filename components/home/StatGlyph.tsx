import { Text, View } from 'react-native';

type StatGlyphKind = 'owed' | 'open' | 'return';

type StatGlyphProps = {
  kind: StatGlyphKind;
};

/** Petites icônes géométriques discrètes (style premium, sans dépendance icônes). */
export function StatGlyph({ kind }: StatGlyphProps) {
  if (kind === 'owed') {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-stone-100 dark:border-gold/35 dark:bg-zinc-800/80">
        <Text className="text-[12px] font-semibold text-gold" accessible={false}>
          €
        </Text>
      </View>
    );
  }

  if (kind === 'open') {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-stone-100 dark:border-gold/35 dark:bg-zinc-800/80">
        <View className="items-center gap-[3px]">
          <View className="h-[2px] w-[11px] rounded-[1px] bg-gold/75" />
          <View className="h-[2px] w-[15px] rounded-[1px] bg-gold/55" />
          <View className="h-[2px] w-[11px] rounded-[1px] bg-gold/75" />
        </View>
      </View>
    );
  }

  return (
    <View className="h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-stone-100 dark:border-gold/35 dark:bg-zinc-800/80">
      <Text className="text-[13px] leading-none text-gold" accessible={false}>
        ↩
      </Text>
    </View>
  );
}
