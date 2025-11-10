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

  const loadSearches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('search_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Error loading searches', error)
    } else {
      setSearches(data || [])
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SearchDetail', { search: item })}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <Text style={styles.clientName}>{item.client_name}</Text>
        <Text style={styles.line}>
          {item.brand} {item.model} ({item.year_min || '?'} - {item.year_max || '?'})
        </Text>
        <Text style={styles.line}>
          Precio:{' '}
          {item.price_min ? item.price_min.toLocaleString('es-AR') : '?'} -{' '}
          {item.price_max ? item.price_max.toLocaleString('es-AR') : '?'}
        </Text>
        {item.client_phone ? (
          <Text style={styles.line}>Tel: {item.client_phone}</Text>
        ) : null}
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString('es-AR')}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Búsquedas</Text>
        <View style={styles.actionsRow}>
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

      {loading && searches.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={searches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Todavía no hay búsquedas cargadas.
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  line: {
    fontSize: 14,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
})
