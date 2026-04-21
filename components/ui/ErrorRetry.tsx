import { Pressable, Text, View } from 'react-native';

type ErrorRetryProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <View className="mt-6 rounded-[20px] border border-red-200/50 bg-red-50/90 p-5 dark:border-red-900/45 dark:bg-red-950/35">
      <Text className="text-[15px] leading-5 text-red-900/95 dark:text-red-100/95">{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-4 self-start rounded-2xl border border-red-200/80 bg-white px-5 py-2.5 active:opacity-90 dark:border-red-800/80 dark:bg-zinc-900"
      >
        <Text className="text-sm font-semibold text-red-900 dark:text-red-100">Réessayer</Text>
      </Pressable>
    </View>
  );
}
