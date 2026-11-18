
// 1) Colors
export const colors = {
  bg: '#FFFFFF',        // page background (white)
  card: '#F6F6F6',      // card background (light gray)
  ink: '#111111',       // main text (near black)
  muted: '#8A8A8A',     // lighter text
  border: '#E8E8E8',
  accent: '#111111',    // buttons, active tabs, highlights (black)
  accentSoft: '#EFEFEF',
  sage: '#5E8C6A', sageSoft: '#F1F5F2',   // green  = clear skin
  amber: '#B8912F', amberSoft: '#F8F4E8',  // yellow = mild acne
  red: '#B5533F', redSoft: '#F8EEEB',    // red    = moderate acne
};

// 2) Each acne level gets a color (strong + soft background)
export const levelColor = { clear: colors.sage, mild: colors.amber, moderate: colors.red };
export const levelSoft = { clear: colors.sageSoft, mild: colors.amberSoft, moderate: colors.redSoft };

// 3) Spacing and rounded corners (in pixels)
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

// 4) Text styles
export const type = {
  title: { fontSize: 26, fontWeight: '600', color: colors.ink },
  h2: { fontSize: 20, fontWeight: '600', color: colors.ink },
  h3: { fontSize: 16, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
};

// 5) Helper: "oily" -> "Oily"
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');