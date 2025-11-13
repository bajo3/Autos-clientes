// components/ui/Chip.js
import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPO } from '../theme'

export default function Chip({
  label,
  active = false,
  size = 'md', // 'sm' | 'md'
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        active && styles.active,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          active && styles.textActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: TYPO.small,
    color: COLORS.chipText,
    fontWeight: '500',
  },
  textSm: {
    fontSize: TYPO.tiny,
  },
  active: {
    backgroundColor: COLORS.chipActiveBackground,
    borderColor: COLORS.chipActiveBorder,
  },
  textActive: {
    color: COLORS.chipTextActive,
  },
})
