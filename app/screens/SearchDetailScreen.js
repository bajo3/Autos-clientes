// app/screens/SearchDetailScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Linking } from 'react-native'
import { supabase } from '../lib/supabase'

export default function SearchDetailScreen({ route }) {
  const { search } = route.params
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMatches = async () => {
    setLoading(true)

    try {
      let query = supabase.from('vehicles').select('*')

      // Filtros básicos por marca / modelo
      if (search.brand) {
        query = query.eq('brand', search.brand)
      }
      if (search.model) {
        query = query.eq('model', search.model)
      }

      // Año dentro del rango pedido
      if (search.year_min) {
        query = query.gte('year', search.year_min)
      }
      if (search.year_max) {
        query = query.lte('year', search.year_max)
      }

      // Precio dentro del rango pedido
      if (search.price_min) {
        query = query.gte('price', search.price_min)
      }
      if (search.price_max) {
        query = query.lte('price', search.price_max)
      }

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

    setLoading(false)
  }

  useEffect(() => {
    loadMatches()
  }, [])

  const openWhatsApp = () => {
    if (!search.client_phone) return

    const msg = `Hola ${search.client_name}, soy de la agencia. Tengo algunos autos que se ajustan a lo que estás buscando.`
    const phone = search.client_phone.replace(/[^0-9]/g, '') // limpia espacios, +, guiones

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    Linking.openURL(url)
  }

  const renderVehicle = ({ item }) => (
    <View style={styles.vehicleCard}>
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
        Precio:{' '}
        {item.price ? `$ ${item.price.toLocaleString('es-AR')}` : '-'}
      </Text>
      {item.color ? (
        <Text style={styles.vehicleLine}>Color: {item.color}</Text>
      ) : null}
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Datos de la búsqueda */}
      <View style={styles.searchCard}>
        <Text style={styles.clientName}>{search.client_name}</Text>
        {search.client_phone ? (
          <Text style={styles.clientLine}>Tel: {search.client_phone}</Text>
        ) : null}

        <Text style={styles.clientLine}>
          Busca: {search.brand || '-'} {search.model || ''}
        </Text>

        <Text style={styles.clientLine}>
          Años: {search.year_min || '?'} - {search.year_max || '?'}
        </Text>
        <Text style={styles.clientLine}>
          Precio:{' '}
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

        {search.client_phone ? (
          <TouchableOpacity onPress={openWhatsApp}>
            <Text style={styles.whatsappLink}>
              👉 Escribirle por WhatsApp
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Matches */}
      <Text style={styles.matchesTitle}>
        Autos que matchean ({vehicles.length})
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : vehicles.length === 0 ? (
        <Text style={styles.emptyText}>
          No hay autos que cumplan con esta búsqueda.
        </Text>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicle}
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
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientLine: {
    fontSize: 14,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  whatsappLink: {
    marginTop: 8,
    fontSize: 14,
    color: '#128C7E',
    fontWeight: '600',
  },
  matchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  vehicleCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  badgeText: {
    fontSize: 11,
    color: '#d26900',
    fontWeight: '500',
  },
  vehicleLine: {
    fontSize: 14,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
})
