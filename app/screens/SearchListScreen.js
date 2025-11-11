// app/screens/SearchListScreen.js
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function SearchListScreen({ navigation }) {
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState('activa') // 'activa' | 'todas'

  const loadSearches = async () => {
    setLoading(true)

    try {
      // Pedimos TODO lo que necesitamos en paralelo:
      const [searchRes, vehicleRes, interactionsRes] = await Promise.all([
        supabase
          .from('search_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('vehicles').select('brand, model, year, price'),
        supabase.from('interactions').select('search_request_id, created_at'),
      ])

      if (searchRes.error) {
        console.log('Error loading searches', searchRes.error)
        setSearches([])
        setLoading(false)
        return
      }
      if (vehicleRes.error) {
        console.log('Error loading vehicles for matches', vehicleRes.error)
      }
      if (interactionsRes.error) {
        console.log('Error loading interactions', interactionsRes.error)
      }

      const searchesData = searchRes.data || []
      const vehiclesData = vehicleRes.data || []
      const interactionsData = interactionsRes.data || []

      // Mapa de última interacción por búsqueda
      const latestBySearchId = {}
      interactionsData.forEach((i) => {
        const prev = latestBySearchId[i.search_request_id]
        if (!prev || new Date(i.created_at) > new Date(prev)) {
          latestBySearchId[i.search_request_id] = i.created_at
        }
      })

      const now = new Date()
      const todayY = now.getFullYear()
      const todayM = now.getMonth()
      const todayD = now.getDate()

      const isSameDayOrBeforeToday = (dateStr) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        const y = d.getFullYear()
        const m = d.getMonth()
        const dd = d.getDate()
        // <= hoy (ignorando hora)
        if (y < todayY) return true
        if (y > todayY) return false
        if (m < todayM) return true
        if (m > todayM) return false
        if (dd <= todayD) return true
        return false
      }

      const isSameDay = (dateStr) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        return (
          d.getFullYear() === todayY &&
          d.getMonth() === todayM &&
          d.getDate() === todayD
        )
      }

      // Enriquecemos cada búsqueda:
      const enhanced = searchesData.map((s) => {
        // Match de autos: marca + rango de año + rango de precio
        const matches = vehiclesData.filter((v) => {
          const brandOk =
            !s.brand ||
            !v.brand ||
            v.brand.toLowerCase() === s.brand.toLowerCase()
          const modelOk =
            !s.model ||
            !v.model ||
            v.model.toLowerCase() === s.model.toLowerCase()

          const yearOk =
            (!s.year_min || !v.year || v.year >= s.year_min) &&
            (!s.year_max || !v.year || v.year <= s.year_max)

          const priceOk =
            (!s.price_min || !v.price || v.price >= s.price_min) &&
            (!s.price_max || !v.price || v.price <= s.price_max)

          return brandOk && modelOk && yearOk && priceOk
        })

        const lastInteractionAt = latestBySearchId[s.id] || null
        const hasReminderToday = s.reminder_at && isSameDay(s.reminder_at)

        return {
          ...s,
          has_match: matches.length > 0,
          match_count: matches.length,
          lastInteractionAt,
          hasReminderToday,
        }
      })

      setSearches(enhanced)
    } catch (err) {
      console.log('Unexpected error loading searches', err)
      setSearches([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSearches()
    const unsubscribe = navigation.addListener('focus', loadSearches)
    return unsubscribe
  }, [navigation])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadSearches()
    setRefreshing(false)
  }, [])

  // Calculamos el orden de "agenda"
  const getPriority = (s) => {
    const now = new Date()
    const reminder = s.reminder_at ? new Date(s.reminder_at) : null
    const lastInt = s.lastInteractionAt
      ? new Date(s.lastInteractionAt)
      : null

    // Recordatorio vencido o para hoy → prioridad máxima
    if (reminder && reminder <= now) return 0
    // Recordatorio futuro → segundo nivel
    if (reminder && reminder > now) return 1
    // Sin recordatorio pero con interacciones → tercero
    if (lastInt) return 2
    // Nunca tocada → cuarta
    return 3
  }

  const filteredSearchesRaw =
    filterStatus === 'todas'
      ? searches
      : searches.filter((s) => (s.status || 'activa') === 'activa')

  const filteredSearches = [...filteredSearchesRaw].sort((a, b) => {
    const pa = getPriority(a)
    const pb = getPriority(b)
    if (pa !== pb) return pa - pb

    // Si tienen recordatorio, ordenamos por el más próximo
    if (a.reminder_at && b.reminder_at) {
      return new Date(a.reminder_at) - new Date(b.reminder_at)
    }

    // Si tienen última interacción, ordenamos por la más vieja primero
    if (a.lastInteractionAt && b.lastInteractionAt) {
      return new Date(a.lastInteractionAt) - new Date(b.lastInteractionAt)
    }

    // Fallback: más nuevas primero
    return new Date(b.created_at) - new Date(a.created_at)
  })

 const renderItem = ({ item }) => {
  const status = item.status || 'activa'
  const statusLabelMap = {
    activa: 'Activa',
    contactado: 'Contactado',
    cerrada: 'Cerrada',
    descartada: 'Descartada',
  }
  const statusLabel = statusLabelMap[status] || status

  const hasMatch = item.has_match
  const matchCount = item.match_count || 0
  const lastInteractionAt = item.lastInteractionAt
  const hasReminderToday = item.hasReminderToday

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('SearchDetail', { search: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.card, hasMatch && styles.cardMatched]}>
        <View style={styles.cardHeader}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <View style={[styles.statusBadge, styles[`status_${status}`]]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.line}>
          {item.brand} {item.model} ({item.year_min || '?'} - {item.year_max || '?'})
        </Text>
        <Text style={styles.line}>
          Precio:{' '}
          {item.price_min ? item.price_min.toLocaleString('es-AR') : '?'} -{' '}
          {item.price_max ? item.price_max.toLocaleString('es-AR') : '?'}
        </Text>

        {item.source ? (
          <Text style={styles.source}>Origen: {item.source}</Text>
        ) : null}

        {item.client_phone ? (
          <Text style={styles.line}>Tel: {item.client_phone}</Text>
        ) : null}

        {hasMatch && (
          <Text style={styles.matchText}>
            ✅{' '}
            {matchCount === 1
              ? '1 auto coincide'
              : `${matchCount} autos coinciden`}
          </Text>
        )}

        {lastInteractionAt && (
          <Text style={styles.lastInteractionText}>
            Último contacto:{' '}
            {new Date(lastInteractionAt).toLocaleString('es-AR')}
          </Text>
        )}

        {item.reminder_at && (
          <Text
            style={[
              styles.reminderText,
              hasReminderToday && styles.reminderTodayText,
            ]}
          >
            Recordar:{' '}
            {new Date(item.reminder_at).toLocaleDateString('es-AR')}
            {hasReminderToday ? ' (hoy)' : ''}
          </Text>
        )}

        <Text style={styles.date}>
          Alta: {new Date(item.created_at).toLocaleString('es-AR')}
        </Text>

        
      </View>
    </TouchableOpacity>
  )
}


  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Búsquedas</Text>
          <View style={styles.filterRow}>
            <Text
              style={[
                styles.filterChip,
                filterStatus === 'activa' && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus('activa')}
            >
              Activas
            </Text>
            <Text
              style={[
                styles.filterChip,
                filterStatus === 'todas' && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus('todas')}
            >
              Todas
            </Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <Button
            title="Dash"
            onPress={() => navigation.navigate('Dashboard')}
          />
          <View style={{ width: 8 }} />
          <Button
            title="Autos"
            onPress={() => navigation.navigate('VehicleList')}
          />
          <View style={{ width: 8 }} />
          <Button
            title="+ Nueva"
            onPress={() => navigation.navigate('NewSearch')}
          />
        </View>
      </View>

      {loading && filteredSearches.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredSearches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay búsquedas en este filtro.
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  filterRow: { flexDirection: 'row', marginTop: 4 },
  filterChip: {
    marginRight: 8,
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: '#eee',
    color: '#555',
  },
  filterChipActive: {
    backgroundColor: '#007aff22',
    color: '#007aff',
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardMatched: {
    backgroundColor: '#e6ffe6',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
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
  line: { fontSize: 14 },
  source: { fontSize: 12, color: '#555', marginTop: 2 },
  matchText: {
    marginTop: 4,
    color: '#28a745',
    fontSize: 13,
    fontWeight: '600',
  },
  lastInteractionText: {
    marginTop: 2,
    fontSize: 12,
    color: '#444',
  },
  reminderText: {
    marginTop: 2,
    fontSize: 12,
    color: '#555',
  },
  reminderTodayText: {
    color: '#d9534f',
    fontWeight: '700',
  },
  date: { marginTop: 6, fontSize: 12, color: '#666' },
  emptyText: { marginTop: 40, textAlign: 'center', color: '#666' },
})
