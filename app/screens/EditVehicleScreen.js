// app/screens/EditVehicleScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
  Switch,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { COLORS, SPACING } from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import Input from '../../components/ui/Input'
import FilterBar from '../../components/ui/FilterBar'

// mismo helper
const normalize = (str) => {
  if (!str) return ''
  return str.trim().toLowerCase()
}

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

    const shouldArchive = status === 'vendido' || status === 'baja'

    const { error } = await supabase
      .from('vehicles')
      .update({
        brand: normalize(brand),
        model: normalize(model),
        version: normalize(version) || null,
        year: year ? Number(year) : null,
        km: km ? Number(km) : null,
        price: price ? Number(price) : null,
        color: normalize(color) || null,
        status,
        is_consignment: isConsignment,
        owner_name: isConsignment ? ownerName.trim() || null : null,
        owner_phone: isConsignment ? ownerPhone.trim() || null : null,
        archived: shouldArchive,
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  const statusItems = ['disponible', 'reservado', 'vendido', 'baja'].map(
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
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <SectionTitle title="Datos del auto" />
        <Input
          label="Marca *"
          value={brand}
          onChangeText={setBrand}
          placeholder="VW, Ford, etc."
        />
        <Input
          label="Modelo *"
          value={model}
          onChangeText={setModel}
          placeholder="Gol, Focus, etc."
        />
        <Input
          label="Versión"
          value={version}
          onChangeText={setVersion}
          placeholder="Trendline, SE, etc."
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Año"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="KM"
              value={km}
              onChangeText={setKm}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Precio"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Input
          label="Color"
          value={color}
          onChangeText={setColor}
          placeholder="Blanco, Gris..."
        />
      </Card>

      <View style={{ height: SPACING.lg }} />

      <Card>
        <SectionTitle title="Estado" />
        <FilterBar items={statusItems} horizontal={false} />
      </Card>

      <View style={{ height: SPACING.lg }} />

      <Card>
        <SectionTitle title="Consignación" />
        <View style={styles.switchRow}>
          <Input
            label="¿Es consignación?"
            editable={false}
            value={isConsignment ? 'Sí' : 'No'}
            style={{ opacity: 0 }}
          />
          <Switch value={isConsignment} onValueChange={setIsConsignment} />
        </View>

        {isConsignment && (
          <>
            <Input
              label="Nombre del dueño"
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Juan Pérez"
            />
            <Input
              label="Teléfono del dueño"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              placeholder="+54 9..."
              keyboardType="phone-pad"
            />
          </>
        )}
      </Card>

      <View style={{ height: SPACING.xl }} />

      <View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
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
  },
})
