// This is the ONLY file in the codebase permitted to contain raw hex values.
// All other files must reference semantic tokens via useTheme() or NativeWind classes.

export const primitives = {
  // --- Brand core palette ---
  coral: {
    50: '#FFF0F2',
    100: '#FFD6DC',
    200: '#FFADB8',
    300: '#FF8595',
    400: '#FF5D73',
    500: '#E64563',
    600: '#C73050',
    700: '#A01E3B',
  },
  indigo: {
    50: '#F4F4FF',
    100: '#E8E8FF',
    200: '#C8C8F5',
    300: '#A8A8EB',
    400: '#8888E0',
    500: '#6868D5',
    600: '#4C4CBF',
    700: '#3333A0',
  },
  sky: {
    500: '#86A8E7',
  },
  mint: {
    500: '#91EAE4',
  },

  // --- Ink ramp ---
  ink: {
    50: '#FAFAFF',
    100: '#F4F4FB',
    200: '#EDEDF5',
    300: '#DADAEA',
    400: '#B8B8CC',
    500: '#9B9BAD',
    600: '#6E6E8A',
    700: '#5A5A63',
    800: '#3A3A44',
    900: '#26262E',
    950: '#16161C',
  },
  white: '#FFFFFF',
  offWhite: '#F5F5F7',
  black: '#0B0B0F',

  // --- Status ---
  success: {
    500: '#4AC28A',
    600: '#5DD69F',
  },
  danger: {
    500: '#E85D5D',
    600: '#F07878',
  },
  warning: {
    500: '#F2B040',
    600: '#F5C061',
  },

  // --- Shadows (as style objects, not hex) ---
  shadow: {
    light: {
      sm: {
        shadowColor: '#0B0B0F',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#0B0B0F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
      lg: {
        shadowColor: '#0B0B0F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      },
    },
    dark: {
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 8,
      },
    },
  },
} as const;

export const lightTheme = {
  // --- Backgrounds ---
  bg: primitives.ink[50],              // #FAFAFF
  bgSubtle: primitives.ink[100],       // #F4F4FB
  surface: primitives.white,           // #FFFFFF
  surfaceRaised: primitives.white,     // #FFFFFF
  surfaceSunken: primitives.ink[100],  // #F4F4FB

  // --- Text ---
  textPrimary: primitives.black,       // #0B0B0F
  textSecondary: primitives.ink[600],  // #6E6E8A
  textMuted: primitives.ink[500],      // #9B9BAD
  textOnAccent: primitives.white,      // #FFFFFF

  // --- Accent (coral) ---
  accent: primitives.coral[400],       // #FF5D73
  accentHover: primitives.coral[500],  // #E64563
  accentMuted: '#FFC8D1',
  accentSubtle: '#FFE9ED',

  // --- Borders ---
  border: primitives.ink[200],         // #EDEDF5
  borderStrong: primitives.ink[300],   // #DADAEA
  divider: '#F0F0F8',

  // --- Status ---
  success: primitives.success[500],   // #4AC28A
  danger: primitives.danger[500],     // #E85D5D
  warning: primitives.warning[500],   // #F2B040

  // --- Overlay ---
  overlay: 'rgba(11,11,15,0.5)',

  // --- Tag palette ---
  tagPinkBg: '#FFE4EC',
  tagPinkInk: '#C73E5A',
  tagBlueBg: '#E4F3FF',
  tagBlueInk: '#2D6FBF',
  tagGreenBg: '#E8F6E4',
  tagGreenInk: '#4A8E3A',
  tagPurpleBg: '#EEE4FF',
  tagPurpleInk: '#6B3FB8',

  // --- Shadows ---
  shadowSm: primitives.shadow.light.sm,
  shadowMd: primitives.shadow.light.md,
  shadowLg: primitives.shadow.light.lg,
} as const;

export const darkTheme = {
  // --- Backgrounds ---
  bg: primitives.black,                // #0B0B0F
  bgSubtle: primitives.ink[950],       // #16161C
  surface: primitives.ink[950],        // #16161C
  surfaceRaised: '#1D1D24',
  surfaceSunken: primitives.black,     // #0B0B0F

  // --- Text ---
  textPrimary: primitives.offWhite,    // #F5F5F7
  textSecondary: primitives.ink[500],  // #9B9BAD
  textMuted: primitives.ink[700],      // #5A5A63
  textOnAccent: primitives.white,      // #FFFFFF

  // --- Accent (coral, lighter for dark bg) ---
  accent: '#FF8A9D',
  accentHover: primitives.coral[400],  // #FF5D73
  accentMuted: 'rgba(255,138,157,0.18)',
  accentSubtle: 'rgba(255,138,157,0.08)',

  // --- Borders ---
  border: primitives.ink[900],         // #26262E
  borderStrong: '#32323C',
  divider: '#1F1F26',

  // --- Status ---
  success: primitives.success[600],   // #5DD69F
  danger: primitives.danger[600],     // #F07878
  warning: primitives.warning[600],   // #F5C061

  // --- Overlay ---
  overlay: 'rgba(0,0,0,0.6)',

  // --- Tag palette ---
  tagPinkBg: 'rgba(255,93,115,0.15)',
  tagPinkInk: '#FFA3B2',
  tagBlueBg: 'rgba(134,168,231,0.15)',
  tagBlueInk: '#B6D0F0',
  tagGreenBg: 'rgba(145,234,228,0.12)',
  tagGreenInk: '#9ADDC8',
  tagPurpleBg: 'rgba(127,127,213,0.18)',
  tagPurpleInk: '#B9B9EA',

  // --- Shadows ---
  shadowSm: primitives.shadow.dark.sm,
  shadowMd: primitives.shadow.dark.md,
  shadowLg: primitives.shadow.dark.lg,
} as const;

export type ThemeTokens = typeof lightTheme;
