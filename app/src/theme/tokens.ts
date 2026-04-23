// This is the ONLY file in the codebase permitted to contain raw hex values.
// All other files must reference semantic tokens via useTheme() or NativeWind classes.

export const primitives = {
  // --- Brand core palette ---
  coral: {
    50:  '#FFE9ED',
    100: '#FFC8D1',
    300: '#FF8A9D',
    500: '#FF5D73',
    600: '#E64563',
    700: '#BF3551',
  },
  peach: {
    300: '#FFB997',
    500: '#FF9A6B',
  },
  indigo: {
    300: '#A5A5E2',
    500: '#7F7FD5',
    700: '#5E5EBA',
  },
  sky: {
    300: '#B6D0F0',
    500: '#86A8E7',
  },
  mint: {
    300: '#B3E8D1',
    500: '#91EAE4',
  },

  // --- Ink ramp ---
  ink: {
    50:  '#F5F5F7',
    100: '#E8E8EE',
    200: '#CDCDD7',
    300: '#9B9BAD',
    400: '#6E6E8A',
    500: '#4B4B64',
    700: '#26262E',
    800: '#16161C',
    900: '#0B0B0F',
    950: '#050507',
  },
  white:    '#FFFFFF',
  offWhite: '#FAFAFF',

  // --- Status ---
  success: '#4AC28A',
  danger:  '#E85D5D',
  warning: '#F2B040',

  // --- Shadows (as style objects, not hex) ---
  shadow: {
    light: {
      sm: {
        shadowColor: '#7F7FD5',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
      },
      md: {
        shadowColor: '#7F7FD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
      },
      lg: {
        shadowColor: '#7F7FD5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 8,
      },
    },
    dark: {
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 1,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 8,
      },
    },
  },
} as const;

export const lightTheme = {
  // --- Backgrounds ---
  bg:            primitives.offWhite,       // #FAFAFF
  bgSubtle:      '#F4F4FB',
  surface:       primitives.white,          // #FFFFFF
  surfaceRaised: primitives.white,          // #FFFFFF
  surfaceSunken: '#F4F4FB',

  // --- Text ---
  textPrimary:   primitives.ink[900],       // #0B0B0F
  textSecondary: primitives.ink[400],       // #6E6E8A
  textMuted:     primitives.ink[300],       // #9B9BAD
  textOnAccent:  primitives.white,          // #FFFFFF

  // --- Accent (coral) ---
  accent:        primitives.coral[500],     // #FF5D73
  accentHover:   primitives.coral[600],     // #E64563
  accentMuted:   primitives.coral[100],     // #FFC8D1
  accentSubtle:  primitives.coral[50],      // #FFE9ED

  // --- Borders ---
  border:        '#EDEDF5',
  borderStrong:  '#DADAEA',
  divider:       '#F0F0F8',

  // --- Status ---
  success: primitives.success,              // #4AC28A
  danger:  primitives.danger,               // #E85D5D
  warning: primitives.warning,              // #F2B040

  // --- Overlay ---
  overlay: 'rgba(11,11,15,0.5)',

  // --- Tag palette ---
  tagPinkBg:   '#FFE4EC',
  tagPinkInk:  '#C73E5A',
  tagBlueBg:   '#E4F3FF',
  tagBlueInk:  '#2D6FBF',
  tagGreenBg:  '#E8F6E4',
  tagGreenInk: '#4A8E3A',
  tagPurpleBg: '#EEE4FF',
  tagPurpleInk:'#6B3FB8',

  // --- Gradients ---
  gradPrimaryStart: primitives.coral[500],   // #FF5D73
  gradPrimaryEnd:   primitives.peach[500],   // #FF9A6B
  gradBrandStart:   primitives.coral[500],   // #FF5D73
  gradBrandEnd:     primitives.indigo[500],  // #7F7FD5

  // --- Shadows ---
  shadowSm: primitives.shadow.light.sm,
  shadowMd: primitives.shadow.light.md,
  shadowLg: primitives.shadow.light.lg,
} as const;

export const darkTheme = {
  // --- Backgrounds ---
  bg:            primitives.ink[900],        // #0B0B0F
  bgSubtle:      primitives.ink[800],        // #16161C
  surface:       primitives.ink[800],        // #16161C
  surfaceRaised: '#1D1D24',
  surfaceSunken: primitives.ink[900],        // #0B0B0F

  // --- Text ---
  textPrimary:   primitives.ink[50],         // #F5F5F7
  textSecondary: primitives.ink[300],        // #9B9BAD
  textMuted:     '#5A5A63',
  textOnAccent:  primitives.white,           // #FFFFFF

  // --- Accent (desaturated coral for dark bg) ---
  accent:        primitives.coral[300],      // #FF8A9D
  accentHover:   primitives.coral[500],      // #FF5D73
  accentMuted:   'rgba(255,138,157,0.18)',
  accentSubtle:  'rgba(255,138,157,0.08)',

  // --- Borders ---
  border:        '#26262E',
  borderStrong:  '#32323C',
  divider:       '#1F1F26',

  // --- Status ---
  success: '#5DD69F',
  danger:  '#F07878',
  warning: '#F5C061',

  // --- Overlay ---
  overlay: 'rgba(0,0,0,0.6)',

  // --- Tag palette ---
  tagPinkBg:    'rgba(255,93,115,0.15)',
  tagPinkInk:   '#FFA3B2',
  tagBlueBg:    'rgba(134,168,231,0.15)',
  tagBlueInk:   '#B6D0F0',
  tagGreenBg:   'rgba(145,234,228,0.12)',
  tagGreenInk:  '#9ADDC8',
  tagPurpleBg:  'rgba(127,127,213,0.18)',
  tagPurpleInk: '#B9B9EA',

  // --- Gradients ---
  gradPrimaryStart: primitives.coral[500],   // #FF5D73 — gradient stays brand in dark
  gradPrimaryEnd:   primitives.peach[500],   // #FF9A6B
  gradBrandStart:   primitives.coral[500],   // #FF5D73
  gradBrandEnd:     primitives.indigo[500],  // #7F7FD5

  // --- Shadows ---
  shadowSm: primitives.shadow.dark.sm,
  shadowMd: primitives.shadow.dark.md,
  shadowLg: primitives.shadow.dark.lg,
} as const;

export type ThemeTokens = typeof lightTheme;
