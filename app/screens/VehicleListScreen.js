// app/screens/VehicleListScreen.js
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Button,
  TouchableOpacity,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function VehicleListScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadVehicles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Error loading vehicles', error)
    } else {
      setVehicles(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadVehicles()
    const unsubscribe = navigation.addListener('focus', loadVehicles)
    return unsubscribe
  }, [navigation])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadVehicles()
    setRefreshing(false)
  }, [])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            {item.brand} {item.model} {item.version ? `- ${item.version}` : ''}
          </Text>
          {item.is_consignment && (
            <View style={styles.badgeConsigna}>
              <Text style={styles.badgeText}>Consignación</Text>
            </View>
          )}
        </View>

        <Text style={styles.line}>
          Año: {item.year || '-'} | KM:{' '}
          {item.km ? item.km.toLocaleString('es-AR') : '-'}
        </Text>
        <Text style={styles.line}>
          Precio:{' '}
          {item.price
            ? `$ ${item.price.toLocaleString('es-AR')}`
            : '-'}
        </Text>
        {item.color ? (
          <Text style={styles.line}>Color: {item.color}</Text>
        ) : null}

        {item.is_consignment && item.owner_name ? (
          <Text style={styles.owner}>
            Dueño: {item.owner_name}{' '}
            {item.owner_phone ? `(${item.owner_phone})` : ''}
          </Text>
        ) : null}

        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString('es-AR')}
        </Text>

        {/* ⬇️ BOTÓN EDITAR EN EL CARD */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }} />
          <Button
            title="Editar"
            onPress={() =>
              navigation.navigate('EditVehicle', { vehicleId: item.id })
            }
          />
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Autos</Text>
        <Button
          title="+ Nuevo"
          onPress={() => navigation.navigate('NewVehicle')}
        />
      </View>

      {loading && vehicles.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Todavía no cargaste ningún auto.
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
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
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
  badgeText: {
    fontSize: 11,
    color: '#d26900',
    fontWeight: '500',
  },
  line: {
    fontSize: 14,
  },
  owner: {
    fontSize: 13,
    marginTop: 4,
    color: '#444',
  },
  date: {
    marginTop: 6,
    fontSize: 11,
    color: '#777',
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
})
