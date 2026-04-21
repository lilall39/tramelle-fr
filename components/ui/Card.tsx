import type { ReactNode } from 'react';
import { Platform, View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
  children: ReactNode;
};

const shadowStyle =
  Platform.OS === 'web'
    ? ({
        boxShadow:
          '0 14px 40px rgba(15, 15, 20, 0.05), 0 4px 12px rgba(15, 15, 20, 0.035), 0 1px 3px rgba(15, 15, 20, 0.03)',
      } as const)
    : {
        elevation: 3,
        shadowColor: '#0B0B0C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      };

export function Card({ children, className, style, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-[20px] border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 ${className ?? ''}`}
      style={[shadowStyle, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
