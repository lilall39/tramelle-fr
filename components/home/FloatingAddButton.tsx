import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingAddButtonProps = {
  onPress: () => void;
};

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajouter un prêt"
      onPress={onPress}
      className="absolute rounded-full bg-gold px-5 py-4"
      style={({ pressed }) => ({
        right: 20,
        bottom: Math.max(20, insets.bottom + 8),
        elevation: 8,
        shadowColor: '#0B0B0C',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.14,
        shadowRadius: 22,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text className="text-base font-semibold text-black">+ Ajouter</Text>
    </Pressable>
  );
}
