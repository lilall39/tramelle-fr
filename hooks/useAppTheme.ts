import { useColorScheme } from 'react-native';

import { theme } from '@/constants/theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';

  return {
    mode,
    colors: theme[mode],
  };
}
