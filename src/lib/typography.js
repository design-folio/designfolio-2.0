// Typography scale — user.typography (numeric, scalable).
// 0 = compact (default), 1 = expressive. Add 2, 3… later for larger scales.
// The actual sizing engine is the CSS variable --tpg-scale (see src/styles/typography.css),
// scoped by data-typography on <html>. These helpers cover the JS side.

export const TYPOGRAPHY = {
  COMPACT: 0,
  EXPRESSIVE: 1,
};

export const DEFAULT_TYPOGRAPHY = TYPOGRAPHY.COMPACT;

// Per-level multiplier — must stay in sync with the --tpg-scale values in typography.css.
const TYPOGRAPHY_SCALE = {
  [TYPOGRAPHY.COMPACT]: 1,
  [TYPOGRAPHY.EXPRESSIVE]: 1.08,
};

// Returns the font-size multiplier for a typography level (falls back to compact).
export const getTypographyScale = (level) =>
  TYPOGRAPHY_SCALE[level] ?? TYPOGRAPHY_SCALE[TYPOGRAPHY.COMPACT];

// Normalizes any stored value to a valid typography level.
export const normalizeTypography = (value) =>
  value === TYPOGRAPHY.EXPRESSIVE ? TYPOGRAPHY.EXPRESSIVE : TYPOGRAPHY.COMPACT;
