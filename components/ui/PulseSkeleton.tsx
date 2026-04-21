import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

type PulseSkeletonProps = {
  className?: string;
  heightClass?: string;
};

export function PulseSkeleton({ className, heightClass = 'h-4' }: PulseSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className={`w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800 ${heightClass} ${className ?? ''}`}>
      <View />
    </Animated.View>
  );
}
