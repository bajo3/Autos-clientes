// screens/NewSearchScreen.js
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function NewSearchScreen({ navigation }) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [source, setSource] = useState('') // NUEVO
  const [saving, setSaving] = useState(false)

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
        brand: brand.trim() || null,
        model: model.trim() || null,
        year_min: yearMin ? Number(yearMin) : null,
        year_max: yearMax ? Number(yearMax) : null,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        status: 'activa',                 // NUEVO
        source: source.trim() || null,    // NUEVO
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
        placeholder="+54 9 2494..."
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
        placeholder="Ford, Chevrolet..."
      />

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="Ecosport, Onix..."
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Año desde</Text>
          <TextInput
            style={styles.input}
            value={yearMin}
            onChangeText={setYearMin}
            keyboardType="numeric"
            placeholder="2012"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Año hasta</Text>
          <TextInput
            style={styles.input}
            value={yearMax}
            onChangeText={setYearMax}
            keyboardType="numeric"
            placeholder="2016"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Precio mín.</Text>
          <TextInput
            style={styles.input}
            value={priceMin}
            onChangeText={setPriceMin}
            keyboardType="numeric"
            placeholder="5000000"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Precio máx.</Text>
          <TextInput
            style={styles.input}
            value={priceMax}
            onChangeText={setPriceMax}
            keyboardType="numeric"
            placeholder="10000000"
          />
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? 'Guardando...' : 'Guardar búsqueda'}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
  },
})
