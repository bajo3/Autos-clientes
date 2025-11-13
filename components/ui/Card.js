// components/ui/Card.js
import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme'

export default function Card({
  children,
  onPress,
  variant = 'default', // 'default' | 'outline' | 'soft'
  style,
}) {
  const Wrapper = onPress ? TouchableOpacity : View

  return (
    <Wrapper
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.base,
        variant === 'outline' && styles.outline,
        variant === 'soft' && styles.soft,
        style,
      ]}
    >
      {children}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  soft: {
    backgroundColor: COLORS.backgroundSoft,
    shadowOpacity: 0.1,
  },
})
