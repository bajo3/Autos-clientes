// components/ui/FilterBar.js
import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { SPACING } from '../theme'
import Chip from './Chip'

export default function FilterBar({ items, horizontal = true }) {
  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontal}
      >
        {items.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            active={item.active}
            size={item.size || 'md'}
            onPress={item.onPress}
            style={item.style}
          />
        ))}
      </ScrollView>
    )
  }

  return (
    <View style={styles.vertical}>
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          active={item.active}
          size={item.size || 'md'}
          onPress={item.onPress}
          style={item.style}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  horizontal: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },
  vertical: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
})
