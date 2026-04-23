export const theme = {
  colors: {
    // Backgrounds
    bgBase:      '#1F1D27',   // app background
    bgSurface:   '#2A2734',   // cards
    bgElevated:  '#3A3748',   // active pills, icon wells

    // Borders
    borderDefault: '#3A3748',
    borderAccent:  '#3DD4C0',

    // Text
    textPrimary:   '#F7F5F0',
    textSecondary: '#B5AFC2',
    textTertiary:  '#6B6578',
    textAccent:    '#3DD4C0',

    // Semantic accents
    accentPrimary: '#3DD4C0',  // teal — main actions, progress
    accentWarm:    '#F5A524',  // amber — streak, warnings, rewards
    accentSuccess: '#7FD99A',  // green — completion, correct answers
    accentDanger:  '#E56B6F',  // soft red — errors, incorrect
  },

  radii: {
    pill: 999,
    lg:   16,  // hero cards
    md:   14,  // secondary cards
    sm:   12,  // icon wells, small elements
    xs:   8,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  fontSize: {
    display: 24,    // hero greetings
    title:   18,    // section headers
    heading: 15,    // card titles
    body:    13,    // default
    label:   11,    // caps labels like "DAILY QUEST"
    caption: 10,    // meta info
  },

  fontWeight: {
    regular: '400' as const,
    medium:  '500' as const,  // default for emphasis — DO NOT use 600 or 700
  },
};

export type Theme = typeof theme;
