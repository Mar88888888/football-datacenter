/**
 * Team color mappings - converts color names to hex values
 */
export const TEAM_COLORS: Record<string, string> = {
  red: '#DC2626',
  blue: '#2563EB',
  white: '#FFFFFF',
  black: '#1F2937',
  yellow: '#EAB308',
  gold: '#CA8A04',
  green: '#16A34A',
  orange: '#EA580C',
  purple: '#9333EA',
  pink: '#EC4899',
  brown: '#92400E',
  navy: '#1E3A5A',
  sky: '#0EA5E9',
  claret: '#7B1E3A',
  maroon: '#7F1D1D',
  silver: '#9CA3AF',
  grey: '#6B7280',
  gray: '#6B7280',
};

/**
 * Get hex color from color name, with fallback
 */
export const getTeamColor = (colorName: string | null | undefined, fallback = '#6B7280'): string => {
  if (!colorName) return fallback;
  return TEAM_COLORS[colorName.toLowerCase()] || fallback;
};
