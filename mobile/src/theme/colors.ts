export const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  accent: {
    50: '#EEF9FF',
    100: '#D8F1FF',
    200: '#BAE7FF',
    300: '#8ADAFF',
    400: '#53C4FF',
    500: '#2BA6FF',
    600: '#1488FC',
    700: '#0D6FE8',
    800: '#1259BB',
    900: '#154E93',
    950: '#122F59',
  },
  green: {
    500: '#22C55E',
  },
  red: {
    500: '#EF4444',
  },
} as const;

export type ThemeName = 'light' | 'dark';

export type BoltTheme = {
  backgroundDepth1: string;
  backgroundDepth2: string;
  backgroundDepth3: string;
  backgroundDepth4: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  promptBackground: string;
  messagesBackground: string;
  itemBackgroundAccent: string;
  itemContentAccent: string;
  itemBackgroundActive: string;
  sidebarButtonBackground: string;
  sidebarButtonText: string;
  codeBackground: string;
  codeText: string;
  previewAddressBar: string;
  loaderProgress: string;
  iconPrimary: string;
  iconSecondary: string;
  dividerColor: string;
  accent: string;
};

export const themes: Record<ThemeName, BoltTheme> = {
  light: {
    backgroundDepth1: BASE_COLORS.white,
    backgroundDepth2: BASE_COLORS.gray[50],
    backgroundDepth3: BASE_COLORS.gray[200],
    backgroundDepth4: 'rgba(23, 23, 23, 0.05)',
    borderColor: 'rgba(23, 23, 23, 0.1)',
    textPrimary: BASE_COLORS.gray[950],
    textSecondary: BASE_COLORS.gray[600],
    textTertiary: BASE_COLORS.gray[500],
    promptBackground: 'rgba(255, 255, 255, 0.8)',
    messagesBackground: BASE_COLORS.gray[100],
    itemBackgroundAccent: 'rgba(43, 166, 255, 0.1)',
    itemContentAccent: BASE_COLORS.accent[700],
    itemBackgroundActive: 'rgba(23, 23, 23, 0.05)',
    sidebarButtonBackground: 'rgba(43, 166, 255, 0.1)',
    sidebarButtonText: BASE_COLORS.accent[700],
    codeBackground: BASE_COLORS.gray[100],
    codeText: BASE_COLORS.gray[950],
    previewAddressBar: BASE_COLORS.gray[100],
    loaderProgress: BASE_COLORS.accent[500],
    iconPrimary: BASE_COLORS.gray[950],
    iconSecondary: BASE_COLORS.gray[600],
    dividerColor: BASE_COLORS.gray[100],
    accent: BASE_COLORS.accent[500],
  },
  dark: {
    backgroundDepth1: BASE_COLORS.gray[950],
    backgroundDepth2: BASE_COLORS.gray[900],
    backgroundDepth3: BASE_COLORS.gray[800],
    backgroundDepth4: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textPrimary: BASE_COLORS.white,
    textSecondary: BASE_COLORS.gray[400],
    textTertiary: BASE_COLORS.gray[500],
    promptBackground: 'rgba(10, 10, 10, 0.8)',
    messagesBackground: BASE_COLORS.gray[800],
    itemBackgroundAccent: 'rgba(43, 166, 255, 0.1)',
    itemContentAccent: BASE_COLORS.accent[500],
    itemBackgroundActive: 'rgba(255, 255, 255, 0.05)',
    sidebarButtonBackground: 'rgba(43, 166, 255, 0.1)',
    sidebarButtonText: BASE_COLORS.accent[500],
    codeBackground: BASE_COLORS.gray[800],
    codeText: BASE_COLORS.white,
    previewAddressBar: BASE_COLORS.gray[800],
    loaderProgress: BASE_COLORS.accent[500],
    iconPrimary: BASE_COLORS.white,
    iconSecondary: BASE_COLORS.gray[400],
    dividerColor: BASE_COLORS.gray[800],
    accent: BASE_COLORS.accent[500],
  },
};
