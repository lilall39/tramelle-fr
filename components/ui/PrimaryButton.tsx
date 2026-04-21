import { Pressable, Text, View } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function PrimaryButton({ label, onPress, disabled, className }: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      className={`w-full rounded-2xl border border-gold/40 bg-gold px-6 py-4 ${disabled ? 'opacity-50' : 'active:opacity-90'} ${className ?? ''}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <View className="items-center justify-center">
        <Text className="text-base font-semibold text-black">{label}</Text>
      </View>
    </Pressable>
  );
}
