export const colors = {
  bg: '#FAF7F4',
  card: '#FFFFFF',
  ink: '#2B2A28',
  muted: '#7A746D',
  border: '#ECE6DF',
  accent: '#C97B63',
  accentSoft: '#F6E7E1',
  sage: '#7FA38A',
  sageSoft: '#E6EFE8',
  amber: '#D9A441',
  amberSoft: '#F8EED6',
  red: '#C9654F',
  redSoft: '#F6E1DB',
};

export const levelColor = {
  clear: colors.sage,
  mild: colors.amber,
  moderate: colors.red,
};

export const levelSoft = {
  clear: colors.sageSoft,
  mild: colors.amberSoft,
  moderate: colors.redSoft,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const type = {
  title: { fontSize: 28, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 20, fontWeight: '700', color: colors.ink },
  h3: { fontSize: 16, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
};

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
