// components/ui/Spacer.js
import React from 'react'
import { View } from 'react-native'

export default function Spacer({ size = 8, horizontal = false }) {
  return horizontal ? (
    <View style={{ width: size }} />
  ) : (
    <View style={{ height: size }} />
  )
}
