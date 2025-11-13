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
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPO,
  SHADOWS,
} from '../../components/theme'

const WHATSAPP_TEMPLATES = [
  {
    key: 'followup',
    label: 'Seguimiento',
    buildMessage: (search) =>
      `Hola ${search.client_name}, ¿cómo va? Te escribo para saber si seguís buscando ${search.brand || ''} ${
        search.model || ''
      }.`,
  },
  {
    key: 'new_unit',
    label: 'Ingresó unidad',
    buildMessage: (search) =>
      `Hola ${search.client_name}, ingresó una unidad que puede interesarte: ${
        search.brand || ''
      } ${
        search.model || ''
      } dentro del rango que buscabas. ¿Querés que te pase más info?`,
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

      // Solo autos no archivados
      query = query.eq('archived', false)

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
      <Text style={styles.interactionType}>{item.type || 'interacción'}</Text>
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
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={styles.clientName}>{search.client_name}</Text>
              {search.client_phone ? (
                <Text style={styles.clientLine}>
                  Tel: {search.client_phone}
                </Text>
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
              color={COLORS.warning}
            />
            <Button
              title="Cerrada"
              onPress={() => updateStatus('cerrada')}
              disabled={updatingStatus}
              color={COLORS.statusClosed}
            />
            <Button
              title="Descartar"
              color={COLORS.statusDiscarded}
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
              color={COLORS.secondary}
            />
          </View>

          {/* Recordatorio rápido */}
          <View style={styles.reminderRow}>
            <View style={{ flex: 1, marginRight: SPACING.xs }}>
              <Button
                title="Recordar en 7 días"
                onPress={() => setReminderInDays(7)}
                disabled={updatingReminder}
                color={COLORS.primary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.xs }}>
              <Button
                title="Quitar record."
                color={COLORS.subtle}
                onPress={clearReminder}
                disabled={updatingReminder}
              />
            </View>
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
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          <ActivityIndicator size="small" color={COLORS.primary} />
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
            placeholderTextColor={COLORS.inputPlaceholder}
            multiline
            value={newInteractionNotes}
            onChangeText={setNewInteractionNotes}
          />
          <Button
            title={savingInteraction ? 'Guardando...' : 'Guardar interacción'}
            onPress={saveInteraction}
            disabled={savingInteraction}
            color={COLORS.primary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // tarjeta principal de la búsqueda
  searchCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clientName: {
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  clientLine: {
    fontSize: TYPO.body,
    color: COLORS.textSoft,
    marginTop: 2,
  },
  date: {
    marginTop: SPACING.xs,
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },
  reminderText: {
    marginTop: SPACING.xs,
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: TYPO.tiny,
    fontWeight: '700',
    color: COLORS.textInverted,
  },
  status_activa: {
    backgroundColor: COLORS.statusActive,
  },
  status_contactado: {
    backgroundColor: COLORS.statusContacted,
  },
  status_cerrada: {
    backgroundColor: COLORS.statusClosed,
  },
  status_descartada: {
    backgroundColor: COLORS.statusDiscarded,
  },

  statusActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  editButtonRow: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  reminderRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },

  whatsappLink: {
    marginTop: SPACING.sm,
    fontSize: TYPO.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  templatesContainer: {
    marginTop: SPACING.sm,
  },
  templatesTitle: {
    fontSize: TYPO.small,
    fontWeight: '600',
    color: COLORS.textSoft,
    marginBottom: SPACING.xs,
  },
  templatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  templateChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondarySoft,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  templateChipText: {
    fontSize: TYPO.small,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  // autos que matchean
  vehicleCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  vehicleTitle: {
    fontSize: TYPO.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  badgeConsigna: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.highlight,
  },
  badgeText: {
    fontSize: TYPO.tiny,
    fontWeight: '600',
    color: COLORS.textInverted,
  },
  vehicleLine: {
    fontSize: TYPO.small,
    color: COLORS.textSoft,
    marginTop: 2,
  },

  emptyText: {
    fontSize: TYPO.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  emptyTextSmall: {
    fontSize: TYPO.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // interacciones
  interactionCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
  },
  interactionType: {
    fontSize: TYPO.small,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  interactionNotes: {
    fontSize: TYPO.body,
    color: COLORS.textSoft,
    marginBottom: 4,
  },
  interactionDate: {
    fontSize: TYPO.tiny,
    color: COLORS.textMuted,
  },

  // nueva interacción
  newInteractionBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  newInteractionTitle: {
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  interactionTypeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  interactionTypeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.chipBackground,
    marginRight: SPACING.xs,
    fontSize: TYPO.small,
    color: COLORS.chipText,
  },
  interactionTypeChipActive: {
    backgroundColor: COLORS.chipActiveBackground,
    borderColor: COLORS.chipActiveBorder,
    color: COLORS.chipTextActive,
  },
  interactionInput: {
    minHeight: 80,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    fontSize: TYPO.body,
    marginBottom: SPACING.sm,
    textAlignVertical: 'top',
  },
})
