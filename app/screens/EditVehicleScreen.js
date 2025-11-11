// app/screens/EditVehicleScreen.js
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
  Switch,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function EditVehicleScreen({ route, navigation }) {
  const { vehicleId } = route.params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [version, setVersion] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')
  const [price, setPrice] = useState('')
  const [color, setColor] = useState('')
  const [status, setStatus] = useState('disponible')
  const [isConsignment, setIsConsignment] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')

  const loadVehicle = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    if (error || !data) {
      console.log('Error loading vehicle for edit', error)
      Alert.alert('Error', 'No se pudo cargar el auto')
      setLoading(false)
      return
    }

    setBrand(data.brand || '')
    setModel(data.model || '')
    setVersion(data.version || '')
    setYear(data.year ? String(data.year) : '')
    setKm(data.km ? String(data.km) : '')
    setPrice(data.price ? String(data.price) : '')
    setColor(data.color || '')
    setStatus(data.status || 'disponible')
    setIsConsignment(!!data.is_consignment)
    setOwnerName(data.owner_name || '')
    setOwnerPhone(data.owner_phone || '')

    setLoading(false)
  }

  useEffect(() => {
    loadVehicle()
  }, [vehicleId])

  const handleSave = async () => {
    if (!brand.trim() || !model.trim()) {
      Alert.alert('Completá al menos marca y modelo')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('vehicles')
      .update({
        brand: brand.trim(),
        model: model.trim(),
        version: version.trim() || null,
        year: year ? Number(year) : null,
        km: km ? Number(km) : null,
        price: price ? Number(price) : null,
        color: color.trim() || null,
        status,
        is_consignment: isConsignment,
        owner_name: isConsignment ? ownerName.trim() || null : null,
        owner_phone: isConsignment ? ownerPhone.trim() || null : null,
      })
      .eq('id', vehicleId)

    setSaving(false)

    if (error) {
      console.log('Error updating vehicle', error)
      Alert.alert('Error', 'No se pudo guardar los cambios')
      return
    }

    Alert.alert('OK', 'Auto actualizado')
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
      <Text style={styles.sectionTitle}>Datos del auto</Text>

      <Text style={styles.label}>Marca *</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="VW, Ford, etc."
      />

      <Text style={styles.label}>Modelo *</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="Gol, Focus, etc."
      />

      <Text style={styles.label}>Versión</Text>
      <TextInput
        style={styles.input}
        value={version}
        onChangeText={setVersion}
        placeholder="Trendline, SE, etc."
      />

      <Text style={styles.label}>Año</Text>
      <TextInput
        style={styles.input}
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <Text style={styles.label}>KM</Text>
      <TextInput
        style={styles.input}
        value={km}
        onChangeText={setKm}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Color</Text>
      <TextInput
        style={styles.input}
        value={color}
        onChangeText={setColor}
        placeholder="Blanco, Gris..."
      />

      <Text style={styles.sectionTitle}>Estado</Text>
      <View style={styles.statusRow}>
        {['disponible', 'reservado', 'vendido', 'baja'].map((st) => (
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

      <Text style={styles.sectionTitle}>Consignación</Text>
      <View style={styles.switchRow}>
        <Text style={styles.label}>¿Es consignación?</Text>
        <Switch
          value={isConsignment}
          onValueChange={setIsConsignment}
        />
      </View>

      {isConsignment && (
        <>
          <Text style={styles.label}>Nombre del dueño</Text>
          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Juan Pérez"
          />

          <Text style={styles.label}>Teléfono del dueño</Text>
          <TextInput
            style={styles.input}
            value={ownerPhone}
            onChangeText={setOwnerPhone}
            placeholder="+54 9..."
            keyboardType="phone-pad"
          />
        </>
      )}

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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
})
