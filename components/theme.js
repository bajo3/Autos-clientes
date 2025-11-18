// components/theme.js

export const COLORS = {
  // Fondo general
  background: '#05060A', // casi negro, toque azulado
  backgroundSoft: '#070816',

  // Superficies / cards
  card: '#070816',
  cardAlt: '#050814',
  cardBorder: '#15192B',

  // Header de navegación
  headerBackground: 'rgba(5, 6, 10, 0.9)',
  headerText: '#F9FAFB',

  // Texto
  text: '#E5E7EB',
  textSoft: '#D1D5DB',
  textMuted: '#64748B',
  textInverted: '#020617',

  // Inputs
  inputBackground: '#050814',
  inputBorder: '#1F2937',
  inputPlaceholder: '#6B7280',

  // Acentos neón
  primary: '#58F0F5',      // cian neón
  primarySoft: '#071923',
  primaryBorder: '#22D3EE',

  secondary: '#B388FF',    // violeta neón
  secondarySoft: '#1E1038',

  // Estados
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#F97373',

  // Estados de búsqueda
  statusActive: '#22C55E',
  statusContacted: '#EAB308',
  statusClosed: '#60A5FA',
  statusDiscarded: '#6B7280',

  // Estados de autos
  statusDisponible: '#22C55E',
  statusReservado: '#EAB308',
  statusVendido: '#F97316',
  statusBaja: '#6B7280',

  // Chips / filtros
  chipBackground: '#05060F',
  chipBorder: '#1E293B',
  chipText: '#9CA3AF',
  chipActiveBackground: '#020617',
  chipActiveBorder: '#58F0F5',
  chipTextActive: '#E5E7EB',

  subtle: '#020617',
  separator: '#111827',
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
}

export const TYPO = {
  title: 22,
  subtitle: 18,
  body: 15,
  small: 13,
  tiny: 11,
}

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
}
