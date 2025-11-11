// screens/SearchListScreen.js
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

  const { data: searchesData, error: searchError } = await supabase
    .from('search_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: vehiclesData, error: vehicleError } = await supabase
    .from('vehicles')
    .select('brand, model, year, price')

  if (searchError || vehicleError) {
    console.log('Error cargando datos', searchError || vehicleError)
    setLoading(false)
    return
  }

  // lógica básica de coincidencia (marca + rango año + rango precio)
  const enhanced = searchesData.map((s) => {
    const matches = vehiclesData?.filter((v) => {
      const brandOk = v.brand?.toLowerCase() === s.brand?.toLowerCase()
      const yearOk =
        (!s.year_min || v.year >= s.year_min) &&
        (!s.year_max || v.year <= s.year_max)
      const priceOk =
        (!s.price_min || v.price >= s.price_min) &&
        (!s.price_max || v.price <= s.price_max)
      return brandOk && yearOk && priceOk
    })
    return { ...s, has_match: matches?.length > 0 }
  })

  setSearches(enhanced)
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

  const filteredSearches =
    filterStatus === 'todas'
      ? searches
      : searches.filter((s) => (s.status || 'activa') === 'activa')

  const renderItem = ({ item }) => {
  const status = item.status || 'activa'
  const statusLabelMap = {
    activa: 'Activa',
    contactado: 'Contactado',
    cerrada: 'Cerrada',
    descartada: 'Descartada',
  }
  const statusLabel = statusLabelMap[status] || status

  const hasMatch = item.has_match // este campo lo vamos a calcular más abajo

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
          <Text style={styles.matchText}>✅ Coincidencia encontrada</Text>
        )}

        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString('es-AR')}
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
  date: { marginTop: 6, fontSize: 12, color: '#666' },
  emptyText: { marginTop: 40, textAlign: 'center', color: '#666' },
  cardMatched: {
  backgroundColor: '#e6ffe6',
  borderColor: '#28a745',
  borderWidth: 1,
},
matchText: {
  marginTop: 4,
  color: '#28a745',
  fontSize: 13,
  fontWeight: '600',
},

})

