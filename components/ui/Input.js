// components/ui/Input.js
import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { COLORS, SPACING, RADIUS, TYPO } from '../theme'

export default function Input({
  label,
  helperText,
  error,
  multiline,
  style,
  ...rest
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.inputPlaceholder}
        multiline={multiline}
        {...rest}
      />
      {helperText && !error ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPO.small,
    color: COLORS.textSoft,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.text,
    fontSize: TYPO.body,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helper: {
    marginTop: SPACING.xs,
    fontSize: TYPO.tiny,
    color: COLORS.textMuted,
  },
  error: {
    marginTop: SPACING.xs,
    fontSize: TYPO.tiny,
    color: COLORS.danger,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
})
