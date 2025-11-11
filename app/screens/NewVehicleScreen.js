// app/screens/NewVehicleScreen.js
import { useState } from 'react'
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function NewVehicleScreen({ navigation }) {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [version, setVersion] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [km, setKm] = useState('')
  const [color, setColor] = useState('')
  const [isConsignment, setIsConsignment] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!brand.trim() || !model.trim()) {
      Alert.alert('Faltan datos', 'Marca y modelo son obligatorios.')
      return
    }

    if (isConsignment && !ownerName.trim()) {
      Alert.alert('Faltan datos', 'Para consignación, poné el nombre del dueño.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('vehicles').insert([
      {
        brand: brand.trim(),
        model: model.trim(),
        version: version.trim() || null,
        year: year ? Number(year) : null,
        price: price ? Number(price) : null,
        km: km ? Number(km) : null,
        color: color.trim() || null,
        is_consignment: isConsignment,
        owner_name: isConsignment ? ownerName.trim() : null,
        owner_phone: isConsignment ? ownerPhone.trim() || null : null,
        notes: notes.trim() || null,
      },
    ])

    setSaving(false)

    if (error) {
      console.log('Error inserting vehicle', error)
      Alert.alert('Error', 'No se pudo guardar el auto')
      return
    }

    Alert.alert('OK', 'Auto guardado')
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // Ajustá este offset si el header de la stack tapa algo
      keyboardVerticalOffset={120}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Datos del auto</Text>

        <Text style={styles.label}>Marca *</Text>
        <TextInput
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
          placeholder="Ford, Chevrolet..."
        />

        <Text style={styles.label}>Modelo *</Text>
        <TextInput
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="Ecosport, Onix..."
        />

        <Text style={styles.label}>Versión</Text>
        <TextInput
          style={styles.input}
          value={version}
          onChangeText={setVersion}
          placeholder="1.6 SE, LTZ, etc."
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Año</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholder="2015"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>KM</Text>
            <TextInput
              style={styles.input}
              value={km}
              onChangeText={setKm}
              keyboardType="numeric"
              placeholder="120000"
            />
          </View>
        </View>

        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          value={color}
          onChangeText={setColor}
          placeholder="Blanco, gris..."
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="10000000"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Es consignación</Text>
          <Switch
            value={isConsignment}
            onValueChange={setIsConsignment}
          />
        </View>

        {isConsignment && (
          <>
            <Text style={styles.label}>Dueño (nombre)</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Nombre del dueño"
            />

            <Text style={styles.label}>Teléfono del dueño</Text>
            <TextInput
              style={styles.input}
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
              placeholder="+54 9..."
            />
          </>
        )}

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Detalles, estado, papeles, etc."
          multiline
        />

        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Button
            title={saving ? 'Guardando...' : 'Guardar auto'}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    
  )
  
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40, // un poco de espacio extra abajo
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
})
