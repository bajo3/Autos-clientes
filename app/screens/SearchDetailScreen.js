// app/screens/SearchDetailScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native'
import { supabase } from '../lib/supabase'

const WHATSAPP_TEMPLATES = [
  {
    key: 'followup',
    label: 'Seguimiento',
    buildMessage: (search) =>
      `Hola ${search.client_name}, ¿cómo va? Te escribo para saber si seguís buscando ${search.brand || ''} ${search.model || ''}.`,
  },
  {
    key: 'new_unit',
    label: 'Ingresó unidad',
    buildMessage: (search) =>
      `Hola ${search.client_name}, ingresó una unidad que puede interesarte: ${search.brand || ''} ${search.model || ''} dentro del rango que buscabas. ¿Querés que te pase más info?`,
  },
]

export default function SearchDetailScreen({ route, navigation }) {
  const [search, setSearch] = useState(route.params.search)
  const [vehicles, setVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [interactions, setInteractions] = useState([])
  const [loadingInteractions, setLoadingInteractions] = useState(false)
  const [newInteractionNotes, setNewInteractionNotes] = useState('')
  const [newInteractionType, setNewInteractionType] = useState('whatsapp')
  const [savingInteraction, setSavingInteraction] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingReminder, setUpdatingReminder] = useState(false)

  const refreshSearchRow = async () => {
    const { data, error } = await supabase
      .from('search_requests')
      .select('*')
      .eq('id', search.id)
      .single()
    if (!error && data) setSearch(data)
  }

  const loadMatches = async () => {
    setLoadingVehicles(true)
    try {
      let query = supabase.from('vehicles').select('*')

      if (search.brand) query = query.eq('brand', search.brand)
      if (search.model) query = query.eq('model', search.model)
      if (search.year_min) query = query.gte('year', search.year_min)
      if (search.year_max) query = query.lte('year', search.year_max)
      if (search.price_min) query = query.gte('price', search.price_min)
      if (search.price_max) query = query.lte('price', search.price_max)

      const { data, error } = await query.order('created_at', {
        ascending: false,
      })
      if (error) {
        console.log('Error loading matched vehicles', error)
        setVehicles([])
      } else {
        setVehicles(data || [])
      }
    } catch (e) {
      console.log('Unexpected error loading matches', e)
      setVehicles([])
    }
    setLoadingVehicles(false)
  }

  const loadInteractions = async () => {
    setLoadingInteractions(true)
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('search_request_id', search.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Error loading interactions', error)
      setInteractions([])
    } else {
      setInteractions(data || [])
    }
    setLoadingInteractions(false)
  }

  useEffect(() => {
    loadMatches()
    loadInteractions()
  }, [])

  const openWhatsAppWithTemplate = (templateKey) => {
    if (!search.client_phone) return

    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.key === templateKey)
    if (!tmpl) return

    const msg = tmpl.buildMessage(search)
    const phone = search.client_phone.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    Linking.openURL(url)
  }

  const openWhatsAppDirect = () => {
    if (!search.client_phone) return

    const msg = `Hola ${search.client_name}, soy de la agencia. Tengo algunos autos que se ajustan a lo que estás buscando.`
    const phone = search.client_phone.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    Linking.openURL(url)
  }

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true)
    const { error } = await supabase
      .from('search_requests')
      .update({ status: newStatus })
      .eq('id', search.id)

    setUpdatingStatus(false)

    if (error) {
      console.log('Error updating status', error)
      Alert.alert('Error', 'No se pudo actualizar el estado')
      return
    }
    await refreshSearchRow()
  }

  const setReminderInDays = async (days) => {
    setUpdatingReminder(true)
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('search_requests')
      .update({ reminder_at: date })
      .eq('id', search.id)

    setUpdatingReminder(false)

    if (error) {
      console.log('Error setting reminder', error)
      Alert.alert('Error', 'No se pudo guardar el recordatorio')
      return
    }
    await refreshSearchRow()
  }

  const clearReminder = async () => {
    setUpdatingReminder(true)
    const { error } = await supabase
      .from('search_requests')
      .update({ reminder_at: null })
      .eq('id', search.id)

    setUpdatingReminder(false)

    if (error) {
      console.log('Error clearing reminder', error)
      Alert.alert('Error', 'No se pudo borrar el recordatorio')
      return
    }
    await refreshSearchRow()
  }

  const saveInteraction = async () => {
    if (!newInteractionNotes.trim()) {
      Alert.alert('Escribí alguna nota de la interacción')
      return
    }

    setSavingInteraction(true)
    const { error } = await supabase.from('interactions').insert([
      {
        search_request_id: search.id,
        type: newInteractionType,
        notes: newInteractionNotes.trim(),
      },
    ])
    setSavingInteraction(false)

    if (error) {
      console.log('Error inserting interaction', error)
      Alert.alert('Error', 'No se pudo guardar la interacción')
      return
    }

    setNewInteractionNotes('')
    await loadInteractions()
  }

  const renderVehicle = (item) => (
    <View key={String(item.id)} style={styles.vehicleCard}>
      <View style={styles.vehicleHeaderRow}>
        <Text style={styles.vehicleTitle}>
          {item.brand} {item.model} {item.version ? `- ${item.version}` : ''}
        </Text>
        {item.is_consignment && (
          <View style={styles.badgeConsigna}>
            <Text style={styles.badgeText}>Consignación</Text>
          </View>
        )}
      </View>
      <Text style={styles.vehicleLine}>
        Año: {item.year || '-'} | KM:{' '}
        {item.km ? item.km.toLocaleString('es-AR') : '-'}
      </Text>
      <Text style={styles.vehicleLine}>
        Precio: {item.price ? `$ ${item.price.toLocaleString('es-AR')}` : '-'}
      </Text>
      {item.color ? (
        <Text style={styles.vehicleLine}>Color: {item.color}</Text>
      ) : null}
    </View>
  )

  const renderInteraction = (item) => (
    <View key={String(item.id)} style={styles.interactionCard}>
      <Text style={styles.interactionType}>
        {item.type || 'interacción'}
      </Text>
      <Text style={styles.interactionNotes}>{item.notes}</Text>
      <Text style={styles.interactionDate}>
        {new Date(item.created_at).toLocaleString('es-AR')}
      </Text>
    </View>
  )

  const status = search.status || 'activa'
  const statusLabelMap = {
    activa: 'Activa',
    contactado: 'Contactado',
    cerrada: 'Cerrada',
    descartada: 'Descartada',
  }
  const statusLabel = statusLabelMap[status] || status

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Datos de la búsqueda */}
        <View style={styles.searchCard}>
          <View style={styles.searchHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.clientName}>{search.client_name}</Text>
              {search.client_phone ? (
                <Text style={styles.clientLine}>Tel: {search.client_phone}</Text>
              ) : null}
            </View>
            <View style={[styles.statusBadge, styles[`status_${status}`]]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          {search.source ? (
            <Text style={styles.clientLine}>Origen: {search.source}</Text>
          ) : null}

          <Text style={styles.clientLine}>
            Busca: {search.brand || '-'} {search.model || ''}
          </Text>

          <Text style={styles.clientLine}>
            Años: {search.year_min || '?'} - {search.year_max || '?'}
          </Text>
          <Text style={styles.clientLine}>
            Precio{' '}
            {search.price_min
              ? search.price_min.toLocaleString('es-AR')
              : '?'}{' '}
            -{' '}
            {search.price_max
              ? search.price_max.toLocaleString('es-AR')
              : '?'}
          </Text>

          <Text style={styles.date}>
            Alta: {new Date(search.created_at).toLocaleString('es-AR')}
          </Text>

          {search.reminder_at ? (
            <Text style={styles.reminderText}>
              Recordatorio:{' '}
              {new Date(search.reminder_at).toLocaleString('es-AR')}
            </Text>
          ) : (
            <Text style={styles.reminderText}>Sin recordatorio</Text>
          )}

          {/* Acciones de estado */}
          <View style={styles.statusActionsRow}>
            <Button
              title="Contactado"
              onPress={() => updateStatus('contactado')}
              disabled={updatingStatus}
            />
            <Button
              title="Cerrada"
              onPress={() => updateStatus('cerrada')}
              disabled={updatingStatus}
            />
            <Button
              title="Descartar"
              color="#777"
              onPress={() => updateStatus('descartada')}
              disabled={updatingStatus}
            />
          </View>

          {/* Botón para editar la búsqueda */}
          <View style={styles.editButtonRow}>
            <Button
              title="Editar Cliente"
              onPress={() =>
                navigation.navigate('EditSearch', { searchId: search.id })
              }
            />
          </View>

          {/* Recordatorio rápido */}
          <View style={styles.reminderRow}>
            <Button
              title="Recordar en 7 días"
              onPress={() => setReminderInDays(7)}
              disabled={updatingReminder}
            />
            <View style={{ width: 8 }} />
            <Button
              title="Quitar record."
              color="#777"
              onPress={clearReminder}
              disabled={updatingReminder}
            />
          </View>

          {/* WhatsApp rápido */}
          {search.client_phone ? (
            <>
              <TouchableOpacity onPress={openWhatsAppDirect}>
                <Text style={styles.whatsappLink}>
                  👉 Escribirle por WhatsApp
                </Text>
              </TouchableOpacity>

              <View style={styles.templatesContainer}>
                <Text style={styles.templatesTitle}>Plantillas WhatsApp:</Text>
                <View style={styles.templatesRow}>
                  {WHATSAPP_TEMPLATES.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => openWhatsAppWithTemplate(t.key)}
                      style={styles.templateChip}
                    >
                      <Text style={styles.templateChipText}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Autos que matchean */}
        <Text style={styles.sectionTitle}>
          Autos que matchean ({vehicles.length})
        </Text>

        {loadingVehicles ? (
          <ActivityIndicator size="large" />
        ) : vehicles.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay autos que cumplan con esta búsqueda.
          </Text>
        ) : (
          vehicles.map((v) => renderVehicle(v))
        )}

        {/* Historial de interacciones */}
        <Text style={styles.sectionTitle}>Historial de contacto</Text>

        {loadingInteractions ? (
          <ActivityIndicator size="small" />
        ) : interactions.length === 0 ? (
          <Text style={styles.emptyTextSmall}>
            Todavía no hay interacciones.
          </Text>
        ) : (
          interactions.map((i) => renderInteraction(i))
        )}

        {/* Nueva interacción */}
        <View style={styles.newInteractionBox}>
          <Text style={styles.newInteractionTitle}>Agregar interacción</Text>
          <View style={styles.interactionTypeRow}>
            {['whatsapp', 'llamada', 'visita'].map((type) => (
              <Text
                key={type}
                style={[
                  styles.interactionTypeChip,
                  newInteractionType === type &&
                    styles.interactionTypeChipActive,
                ]}
                onPress={() => setNewInteractionType(type)}
              >
                {type}
              </Text>
            ))}
          </View>
          <TextInput
            style={styles.interactionInput}
            placeholder="Ej: Lo llamé, quedó en avisar la semana que viene..."
            multiline
            value={newInteractionNotes}
            onChangeText={setNewInteractionNotes}
          />
          <Button
            title={savingInteraction ? 'Guardando...' : 'Guardar interacción'}
            onPress={saveInteraction}
            disabled={savingInteraction}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: { fontSize: 18, fontWeight: '600', marginBottom: 2 },
  clientLine: { fontSize: 14 },
  date: { marginTop: 4, fontSize: 12, color: '#666' },
  reminderText: { marginTop: 4, fontSize: 12, color: '#444' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  status_activa: { backgroundColor: '#28a745' },
  status_contactado: { backgroundColor: '#ffc107' },
  status_cerrada: { backgroundColor: '#007bff' },
  status_descartada: { backgroundColor: '#6c757d' },
  statusActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButtonRow: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reminderRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  whatsappLink: {
    marginTop: 8,
    fontSize: 14,
    color: '#128C7E',
    fontWeight: '600',
  },
  templatesContainer: { marginTop: 10 },
  templatesTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  templatesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  templateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#128C7E22',
    marginRight: 8,
    marginBottom: 4,
  },
  templateChipText: { fontSize: 13, color: '#128C7E', fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  vehicleCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badgeConsigna: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: '#ffe9d5',
  },
  badgeText: { fontSize: 11, color: '#d26900', fontWeight: '500' },
  vehicleLine: { fontSize: 14 },
  emptyText: { marginBottom: 8, color: '#666' },
  emptyTextSmall: { fontSize: 12, color: '#666', marginBottom: 6 },
  interactionCard: {
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  interactionType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  interactionNotes: { fontSize: 13 },
  interactionDate: { fontSize: 11, color: '#777', marginTop: 2 },
  newInteractionBox: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  newInteractionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  interactionTypeRow: { flexDirection: 'row', marginBottom: 4 },
  interactionTypeChip: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
    color: '#555',
  },
  interactionTypeChipActive: {
    borderColor: '#007aff',
    color: '#007aff',
    backgroundColor: '#007aff11',
  },
  interactionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 60,
    marginBottom: 6,
  },
})
