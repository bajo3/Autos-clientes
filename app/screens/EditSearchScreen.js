// app/screens/EditSearchScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'

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
        brand: brand.trim() || null,
        model: model.trim() || null,
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
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Datos del cliente</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={clientName}
        onChangeText={setClientName}
        placeholder="Juan Pérez"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={clientPhone}
        onChangeText={setClientPhone}
        placeholder="+54 9..."
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Origen del lead</Text>
      <TextInput
        style={styles.input}
        value={source}
        onChangeText={setSource}
        placeholder="WhatsApp, Instagram, Marketplace..."
      />

      <Text style={styles.sectionTitle}>Qué busca</Text>

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="Ford, VW, etc."
      />

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="Ecosport, Gol, etc."
      />

      <Text style={styles.label}>Año desde</Text>
      <TextInput
        style={styles.input}
        value={yearMin}
        onChangeText={setYearMin}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Año hasta</Text>
      <TextInput
        style={styles.input}
        value={yearMax}
        onChangeText={setYearMax}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio mínimo</Text>
      <TextInput
        style={styles.input}
        value={priceMin}
        onChangeText={setPriceMin}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio máximo</Text>
      <TextInput
        style={styles.input}
        value={priceMax}
        onChangeText={setPriceMax}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Estado</Text>

      <View style={styles.statusRow}>
        {['activa', 'contactado', 'cerrada', 'descartada'].map((st) => (
          <Text
            key={st}
            style={[
              styles.statusChip,
              status === st && styles.statusChipActive,
            ]}
            onPress={() => setStatus(st)}
          >
            {st}
          </Text>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? 'Guardando...' : 'Guardar cambios'}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  label: { fontSize: 14, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },
  statusChipActive: {
    borderColor: '#007aff',
    backgroundColor: '#007aff11',
    color: '#007aff',
    fontWeight: '600',
  },
})
