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
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { COLORS, SPACING } from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import Input from '../../components/ui/Input'
import Spacer from '../../components/ui/Spacer'
import { normalizeNullable, normalizeText } from '../lib/normalize'


// helper para normalizar texto
const normalize = (str) => {
  if (!str) return ''
  return str.trim().toLowerCase()
}

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
        brand: normalizeText(brand),
        model: normalizeText(model),
        version: normalizeNullable(version),
        color: normalizeNullable(color),
        year: year ? Number(year) : null,
        price: price ? Number(price) : null,
        km: km ? Number(km) : null,
        is_consignment: isConsignment,
        owner_name: isConsignment ? ownerName.trim() : null,
        owner_phone: isConsignment ? ownerPhone.trim() || null : null,
        notes: notes.trim() || null,
        archived: false,
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
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <SectionTitle title="Datos del auto" />
          <Input
            label="Marca *"
            value={brand}
            onChangeText={setBrand}
            placeholder="Ford, Chevrolet..."
          />
          <Input
            label="Modelo *"
            value={model}
            onChangeText={setModel}
            placeholder="Ecosport, Onix..."
          />
          <Input
            label="Versión"
            value={version}
            onChangeText={setVersion}
            placeholder="1.6 SE, LTZ, etc."
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Año"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                placeholder="2015"
              />
            </View>
            <View style={styles.col}>
              <Input
                label="KM"
                value={km}
                onChangeText={setKm}
                keyboardType="numeric"
                placeholder="120000"
              />
            </View>
          </View>

          <Input
            label="Color"
            value={color}
            onChangeText={setColor}
            placeholder="Blanco, gris..."
          />
          <Input
            label="Precio"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="10000000"
          />
        </Card>

        <Spacer size={SPACING.lg} />

        <Card>
          <SectionTitle title="Consignación" />
          <View style={styles.switchRow}>
            <Input
              label="Es consignación"
              editable={false}
              value={isConsignment ? 'Sí' : 'No'}
              style={{ opacity: 0 }}
            />
            <Switch value={isConsignment} onValueChange={setIsConsignment} />
          </View>

          {isConsignment && (
            <>
              <Input
                label="Dueño (nombre)"
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Nombre del dueño"
              />
              <Input
                label="Teléfono del dueño"
                value={ownerPhone}
                onChangeText={setOwnerPhone}
                keyboardType="phone-pad"
                placeholder="+54 9..."
              />
            </>
          )}
        </Card>

        <Spacer size={SPACING.lg} />

        <Card>
          <SectionTitle title="Notas" />
          <Input
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Detalles, estado, papeles, etc."
          />
        </Card>

        <Spacer size={SPACING.xl} />

        <View style={styles.buttonRow}>
          <Button
            title={saving ? 'Guardando...' : 'Guardar auto'}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  buttonRow: {
    marginBottom: SPACING.lg,
  },
})
