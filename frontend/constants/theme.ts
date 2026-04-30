import { Platform } from 'react-native';

export const AppTheme = {
  colors: {
    canvas: '#09090B',
    surface: '#121214',
    surfaceElevated: '#141416',
    surfaceMuted: '#1B1B1F',
    surfaceStrong: '#17171A',
    surfaceSoft: '#101012',
    surfaceContrast: '#FFFFFF',
    outline: '#26262B',
    outlineStrong: '#303038',
    outlineSubtle: 'rgba(255,255,255,0.08)',
    outlineInverse: 'rgba(0,0,0,0.06)',
    text: '#FFFFFF',
    textSoft: '#E4E4E7',
    textMuted: '#A1A1AA',
    textSubtle: '#71717A',
    textInverse: '#111111',
    brand: '#FF6B00',
    brandStrong: '#FF7B00',
    brandSoft: '#311809',
    success: '#A6FF00',
    successSoft: '#28340A',
    danger: '#FC3956',
    dangerSoft: 'rgba(251,113,133,0.12)',
    overlay: 'rgba(9,9,11,0.95)',
    tabSurface: '#FFFFFF',
    tabIcon: '#111111',
  },
} as const;

export const navigationThemeColors = {
  background: AppTheme.colors.canvas,
  card: AppTheme.colors.canvas,
  border: AppTheme.colors.outline,
  primary: AppTheme.colors.brandStrong,
  text: AppTheme.colors.text,
  notification: AppTheme.colors.brandStrong,
} as const;

export const Colors = {
  light: {
    text: AppTheme.colors.textInverse,
    background: AppTheme.colors.surfaceContrast,
    tint: AppTheme.colors.brandStrong,
    icon: AppTheme.colors.textSubtle,
    tabIconDefault: AppTheme.colors.textSubtle,
    tabIconSelected: AppTheme.colors.brandStrong,
  },
  dark: {
    text: AppTheme.colors.text,
    background: AppTheme.colors.canvas,
    tint: AppTheme.colors.brandStrong,
    icon: AppTheme.colors.textMuted,
    tabIconDefault: AppTheme.colors.textMuted,
    tabIconSelected: AppTheme.colors.text,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export default AppTheme;
