// components/ui/SectionTitle.js
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, TYPO } from '../theme'

export default function SectionTitle({ title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },
  right: {
    marginLeft: SPACING.md,
  },
})
