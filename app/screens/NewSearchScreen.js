// app/screens/NewSearchScreen.js
import React, { useState } from 'react'
import {
  View,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { COLORS, SPACING } from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import Input from '../../components/ui/Input'
import Spacer from '../../components/ui/Spacer'

export default function NewSearchScreen({ navigation }) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [source, setSource] = useState('')
  const [saving, setSaving] = useState(false)

  const normalize = (str) => (str ? str.trim().toLowerCase() : null)

  const handleSave = async () => {
    if (!clientName.trim()) {
      Alert.alert('Falta el nombre del cliente')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('search_requests').insert([
      {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || null,
        brand: normalize(brand),
        model: normalize(model),
        year_min: yearMin ? Number(yearMin) : null,
        year_max: yearMax ? Number(yearMax) : null,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        status: 'activa',
        source: source.trim() || null,
      },
    ])

    setSaving(false)

    if (error) {
      console.log('Error inserting search', error)
      Alert.alert('Error', 'No se pudo guardar la búsqueda')
      return
    }

    Alert.alert('OK', 'Búsqueda guardada')
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <SectionTitle title="Datos del cliente" />
          <Input
            label="Nombre *"
            value={clientName}
            onChangeText={setClientName}
            placeholder="Juan Pérez"
          />
          <Input
            label="Teléfono"
            value={clientPhone}
            onChangeText={setClientPhone}
            placeholder="+54 9 2494..."
            keyboardType="phone-pad"
          />
          <Input
            label="Origen del lead"
            value={source}
            onChangeText={setSource}
            placeholder="WhatsApp, Instagram, Marketplace..."
          />
        </Card>

        <Spacer size={SPACING.lg} />

        <Card>
          <SectionTitle title="Qué busca" />
          <Input
            label="Marca"
            value={brand}
            onChangeText={setBrand}
            placeholder="Ford, Chevrolet..."
          />
          <Input
            label="Modelo"
            value={model}
            onChangeText={setModel}
            placeholder="Ecosport, Onix..."
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Año desde"
                value={yearMin}
                onChangeText={setYearMin}
                keyboardType="numeric"
                placeholder="2012"
              />
            </View>
            <View style={styles.col}>
              <Input
                label="Año hasta"
                value={yearMax}
                onChangeText={setYearMax}
                keyboardType="numeric"
                placeholder="2016"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Precio mín."
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
                placeholder="5000000"
              />
            </View>
            <View style={styles.col}>
              <Input
                label="Precio máx."
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
                placeholder="10000000"
              />
            </View>
          </View>
        </Card>

        <Spacer size={SPACING.xl} />

        <View style={styles.buttonRow}>
          <Button
            title={saving ? 'Guardando...' : 'Guardar búsqueda'}
            onPress={handleSave}
            disabled={saving}
            color={COLORS.primary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  col: {
    flex: 1,
  },
  buttonRow: {
    marginBottom: SPACING.lg,
  },
})
