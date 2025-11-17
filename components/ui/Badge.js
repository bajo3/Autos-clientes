// components/ui/Badge.js
import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPO } from '../theme'

const STATUS_COLORS = {
  activa: COLORS.statusActive,
  contactado: COLORS.statusContacted,
  cerrada: COLORS.statusClosed,
  descartada: COLORS.statusDiscarded,
  disponible: COLORS.statusDisponible,
  reservado: COLORS.statusReservado,
  vendido: COLORS.statusVendido,
  baja: COLORS.statusBaja,
}

export default function Badge({ label, status, tone = 'solid', style }) {
  const color = status ? STATUS_COLORS[status] || COLORS.primary : COLORS.primary

  const bg =
    tone === 'solid'
      ? color + '22'
      : 'transparent'

  const border =
    tone === 'solid'
      ? color + '55'
      : color + '88'

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: TYPO.tiny,
    fontWeight: '500',
  },
})
