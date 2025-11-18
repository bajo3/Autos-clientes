// app/screens/EditSearchScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPO,
} from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import Input from '../../components/ui/Input'
import FilterBar from '../../components/ui/FilterBar'
import { normalizeNullable } from '../lib/normalize'


export default function EditSearchScreen({ route, navigation }) {
  const { searchId } = route.params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('activa')

  const loadSearch = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('search_requests')
      .select('*')
      .eq('id', searchId)
      .single()

    if (error || !data) {
      console.log('Error loading search for edit', error)
      Alert.alert('Error', 'No se pudo cargar la búsqueda')
      setLoading(false)
      return
    }

    setClientName(data.client_name || '')
    setClientPhone(data.client_phone || '')
    setBrand(data.brand || '')
    setModel(data.model || '')
    setYearMin(data.year_min ? String(data.year_min) : '')
    setYearMax(data.year_max ? String(data.year_max) : '')
    setPriceMin(data.price_min ? String(data.price_min) : '')
    setPriceMax(data.price_max ? String(data.price_max) : '')
    setSource(data.source || '')
    setStatus(data.status || 'activa')

    setLoading(false)
  }

  useEffect(() => {
    loadSearch()
  }, [searchId])

  const handleSave = async () => {
    if (!clientName.trim()) {
      Alert.alert('Falta el nombre del cliente')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('search_requests')
      .update({
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || null,
        brand: normalizeNullable(brand),
        model: normalizeNullable(model),
        year_min: yearMin ? Number(yearMin) : null,
        year_max: yearMax ? Number(yearMax) : null,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        source: source.trim() || null,
        status,
      })
      .eq('id', searchId)


    setSaving(false)

    if (error) {
      console.log('Error updating search', error)
      Alert.alert('Error', 'No se pudo guardar los cambios')
      return
    }

    Alert.alert('OK', 'Búsqueda actualizada')
    navigation.goBack()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  const statusItems = ['activa', 'contactado', 'cerrada', 'descartada'].map(
    (st) => ({
      key: st,
      label: st.charAt(0).toUpperCase() + st.slice(1),
      active: status === st,
      size: 'sm',
      onPress: () => setStatus(st),
    })
  )

  return (
    <ScrollView
      style={styles.screen}
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
          placeholder="+54 9..."
          keyboardType="phone-pad"
        />
        <Input
          label="Origen del lead"
          value={source}
          onChangeText={setSource}
          placeholder="WhatsApp, Instagram..."
        />
      </Card>

      <View style={styles.spacerLg} />

      <Card>
        <SectionTitle title="Qué busca" />
        <Input
          label="Marca"
          value={brand}
          onChangeText={setBrand}
          placeholder="Ford, VW, etc."
        />
        <Input
          label="Modelo"
          value={model}
          onChangeText={setModel}
          placeholder="Ecosport, Gol, etc."
        />
        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Año desde"
              value={yearMin}
              onChangeText={setYearMin}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Año hasta"
              value={yearMax}
              onChangeText={setYearMax}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Precio mínimo"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Precio máximo"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <View style={styles.spacerLg} />

      <Card>
        <SectionTitle title="Estado" />
        <FilterBar items={statusItems} horizontal={false} />
      </Card>

      <View style={styles.spacerXl} />

      <View style={styles.footer}>
        <Button
          title={saving ? 'Guardando...' : 'Guardar cambios'}
          onPress={handleSave}
          disabled={saving}
          color={COLORS.primary}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  col: {
    flex: 1,
  },
  spacerLg: {
    height: SPACING.lg,
  },
  spacerXl: {
    height: SPACING.xl,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    paddingTop: SPACING.md,
  },
})
