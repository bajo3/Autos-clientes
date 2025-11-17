// components/ui/ListItem.js
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, SPACING, RADIUS, TYPO } from '../theme'

export default function ListItem({
  title,
  subtitle,
  meta,
  badge,
  right,
  onPress,
  compact = false,
  muted = false,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, compact && styles.compact, style]}
    >
      <View style={styles.left}>
        <Text
          style={[
            styles.title,
            compact && styles.titleCompact,
            muted && styles.titleMuted,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[styles.subtitle, muted && styles.subtitleMuted]}
            numberOfLines={compact ? 1 : 2}
          >
            {subtitle}
          </Text>
        ) : null}

        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {badge}
        {right}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  compact: {
    paddingVertical: SPACING.xs + 2,
  },
  left: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPO.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  titleCompact: {
    fontSize: TYPO.small,
  },
  titleMuted: {
    color: COLORS.textMuted,
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPO.small,
    color: COLORS.textSoft,
  },
  subtitleMuted: {
    color: COLORS.textMuted,
  },
  meta: {
    marginTop: 4,
    fontSize: TYPO.tiny,
    color: COLORS.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
})
