export const theme = {
  light: {
    background: '#FFFFFF',
    foreground: '#0B0B0C',
    muted: '#5F5F67',
    gold: '#A17E45',
    card: '#F4F4F5',
  },
  dark: {
    background: '#0B0B0C',
    foreground: '#F8F8F8',
    muted: '#A7A7AB',
    gold: '#C8A96B',
    card: '#141416',
  },
} as const;

export type AppThemeMode = keyof typeof theme;
export type AppTheme = (typeof theme)[AppThemeMode];
