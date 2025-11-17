// components/theme.js

export const COLORS = {
  // Fondo general
  background: '#020617', // slate-950
  backgroundSoft: '#020617',

  // Superficies / cards
  card: '#020617',
  cardAlt: '#030712',
  cardBorder: '#1f2937',

  // Header de navegación
  headerBackground: '#020617',
  headerText: '#e5e7eb',

  // Texto
  text: '#e5e7eb',
  textSoft: '#cbd5f5',
  textMuted: '#64748b',
  textInverted: '#020617',

  // Inputs
  inputBackground: '#020617',
  inputBorder: '#1f2937',
  inputPlaceholder: '#64748b',

  // Acentos
  primary: '#38bdf8',
  primarySoft: '#0b1120',
  primaryBorder: '#0ea5e9',
  secondary: '#a855f7',
  secondarySoft: '#1e1b4b',

  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',

  // Estados de búsqueda
  statusActive: '#22c55e',
  statusContacted: '#eab308',
  statusClosed: '#2563eb',
  statusDiscarded: '#6b7280',

  // Estados de autos
  statusDisponible: '#22c55e',
  statusReservado: '#eab308',
  statusVendido: '#f97316',
  statusBaja: '#6b7280',

  // Chips / filtros
  chipBackground: '#020617',
  chipBorder: '#1f2937',
  chipText: '#9ca3af',
  chipActiveBackground: '#0f172a',
  chipActiveBorder: '#38bdf8',
  chipTextActive: '#e5e7eb',

  // Especiales
  subtle: '#111827',
  separator: '#111827',

  // Tarjetas especiales
  cardMatchBackground: '#022c22',
  cardReminderBackground: '#020617',
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
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
}
