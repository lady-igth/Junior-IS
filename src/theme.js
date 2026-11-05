
// 1) Colors
export const colors = {
  bg: '#FAF7F4',        // page background (warm off-white)
  card: '#FFFFFF',      // card background
  ink: '#2B2A28',       // main text
  muted: '#7A746D',     // lighter text
  border: '#ECE6DF',
  accent: '#C97B63',    // main brand color (terracotta)
  accentSoft: '#F6E7E1',
  sage: '#7FA38A', sageSoft: '#E6EFE8',   // green  = clear skin
  amber: '#D9A441', amberSoft: '#F8EED6',  // yellow = mild acne
  red: '#C9654F', redSoft: '#F6E1DB',    // red    = moderate acne
};

// 2) Each acne level gets a color (strong + soft background)
export const levelColor = { clear: colors.sage, mild: colors.amber, moderate: colors.red };
export const levelSoft = { clear: colors.sageSoft, mild: colors.amberSoft, moderate: colors.redSoft };

// 3) Spacing and rounded corners (in pixels)
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

// 4) Text styles
export const type = {
  title: { fontSize: 28, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 20, fontWeight: '700', color: colors.ink },
  h3: { fontSize: 16, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
};

// 5) Helper: "oily" -> "Oily"
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');