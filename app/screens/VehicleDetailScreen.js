// app/screens/VehicleDetailScreen.js
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

export default function VehicleDetailScreen({ route }) {
  const { vehicle } = route.params
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMatches = async () => {
    setLoading(true)

    try {
      let query = supabase.from('search_requests').select('*')

      if (vehicle.brand) {
        query = query.eq('brand', vehicle.brand)
      }
      if (vehicle.model) {
        query = query.eq('model', vehicle.model)
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      })

      if (error) {
        console.log('Error loading search matches', error)
        setMatches([])
      } else {
        const all = data || []

        const filtered = all.filter((req) => {
          const yearOk =
            !vehicle.year ||
            ((!req.year_min || vehicle.year >= req.year_min) &&
              (!req.year_max || vehicle.year <= req.year_max))

          const priceOk =
            !vehicle.price ||
            ((!req.price_min || vehicle.price >= req.price_min) &&
              (!req.price_max || vehicle.price <= req.price_max))

          return yearOk && priceOk
        })

        setMatches(filtered)
      }
    } catch (e) {
      console.log('Unexpected error loading search matches', e)
      setMatches([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadMatches()
  }, [])

  const openOwnerWhatsApp = () => {
    if (!vehicle.owner_phone) return

    const msg = `Hola ${vehicle.owner_name}, te hablo por la ${vehicle.brand} ${vehicle.model} que tenés en consignación.`
    const phone = vehicle.owner_phone.replace(/[^0-9]/g, '')

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    Linking.openURL(url)
  }

  const renderMatch = ({ item }) => (
    <View style={styles.matchCard}>
      <Text style={styles.matchName}>{item.client_name}</Text>
      {item.client_phone ? (
        <Text style={styles.matchLine}>Tel: {item.client_phone}</Text>
      ) : null}
      <Text style={styles.matchLine}>
        Busca: {item.brand || '-'} {item.model || ''}
      </Text>
      <Text style={styles.matchLine}>
        Años: {item.year_min || '?'} - {item.year_max || '?'}
      </Text>
      <Text style={styles.matchLine}>
        Precio:{' '}
        {item.price_min
          ? item.price_min.toLocaleString('es-AR')
          : '?'}{' '}
        -{' '}
        {item.price_max
          ? item.price_max.toLocaleString('es-AR')
          : '?'}
      </Text>
      <Text style={styles.matchDate}>
        {new Date(item.created_at).toLocaleString('es-AR')}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Datos del auto */}
      <View style={styles.vehicleCard}>
        <Text style={styles.vehicleTitle}>
          {vehicle.brand} {vehicle.model}{' '}
          {vehicle.version ? `- ${vehicle.version}` : ''}
        </Text>
        <Text style={styles.vehicleLine}>
          Año: {vehicle.year || '-'} | KM:{' '}
          {vehicle.km ? vehicle.km.toLocaleString('es-AR') : '-'}
        </Text>
        <Text style={styles.vehicleLine}>
          Precio:{' '}
          {vehicle.price
            ? `$ ${vehicle.price.toLocaleString('es-AR')}`
            : '-'}
        </Text>
        {vehicle.color ? (
          <Text style={styles.vehicleLine}>Color: {vehicle.color}</Text>
        ) : null}

        {vehicle.is_consignment && vehicle.owner_name ? (
          <>
            <Text style={styles.vehicleLine}>
              Consignación de {vehicle.owner_name}{' '}
              {vehicle.owner_phone ? `(${vehicle.owner_phone})` : ''}
            </Text>
            {vehicle.owner_phone ? (
              <TouchableOpacity onPress={openOwnerWhatsApp}>
                <Text style={styles.whatsappLink}>
                  👉 Escribir al dueño por WhatsApp
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <Text style={styles.vehicleLine}>Stock propio</Text>
        )}

        <Text style={styles.vehicleDate}>
          Alta: {new Date(vehicle.created_at).toLocaleString('es-AR')}
        </Text>
      </View>

      {/* Búsquedas que matchean */}
      <Text style={styles.matchesTitle}>
        Personas interesadas ({matches.length})
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : matches.length === 0 ? (
        <Text style={styles.emptyText}>
          No hay búsquedas que matcheen este auto.
        </Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
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
  vehicleCard: {
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
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleLine: {
    fontSize: 14,
  },
  whatsappLink: {
    marginTop: 6,
    fontSize: 14,
    color: '#128C7E',
    fontWeight: '600',
  },
  vehicleDate: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  matchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  matchCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  matchLine: {
    fontSize: 13,
  },
  matchDate: {
    marginTop: 4,
    fontSize: 11,
    color: '#777',
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
})
