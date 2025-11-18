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
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPO,
  SHADOWS,
} from '../../components/theme'

export default function VehicleListScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadVehicles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select(
        'id, brand, model, version, year, km, price, color, is_consignment, owner_name, owner_phone, created_at'
      )
      .eq('archived', false)
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
          <Text style={styles.title} numberOfLines={2}>
            {item.brand} {item.model} {item.version ? `- ${item.version}` : ''}
          </Text>
          {item.is_consignment && (
            <View style={styles.badgeConsigna}>
              <Text style={styles.badgeText}>Consignación</Text>
            </View>
          )}
        </View>

        <Text style={styles.line}>
          Año: <Text style={styles.lineStrong}>{item.year || '-'}</Text> | KM:{' '}
          <Text style={styles.lineStrong}>
            {item.km ? item.km.toLocaleString('es-AR') : '-'}
          </Text>
        </Text>

        <Text style={styles.line}>
          Precio:{' '}
          <Text style={styles.price}>
            {item.price ? `$ ${item.price.toLocaleString('es-AR')}` : '-'}
          </Text>
        </Text>

        {item.color ? (
          <Text style={styles.line}>
            Color: <Text style={styles.lineStrong}>{item.color}</Text>
          </Text>
        ) : null}

        {item.is_consignment && item.owner_name ? (
          <Text style={styles.owner}>
            Dueño: <Text style={styles.lineStrong}>{item.owner_name}</Text>{' '}
            {item.owner_phone ? `(${item.owner_phone})` : ''}
          </Text>
        ) : null}

        <Text style={styles.date}>
          Cargado:{' '}
          {new Date(item.created_at).toLocaleString('es-AR')}
        </Text>

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }} />
          <Button
            title="Editar"
            color={COLORS.primary}
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
        <View>
          <Text style={styles.screenTitle}>Autos</Text>
          <Text style={styles.screenSubtitle}>
            Lista de unidades no archivadas
          </Text>
        </View>
        <Button
          title="+ Nuevo"
          color={COLORS.secondary}
          onPress={() => navigation.navigate('NewVehicle')}
        />
      </View>

      {loading && vehicles.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
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
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  screenTitle: {
    fontSize: TYPO.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  screenSubtitle: {
    marginTop: 2,
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badgeConsigna: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.highlight,
  },
  badgeText: {
    fontSize: TYPO.tiny,
    color: COLORS.textInverted,
    fontWeight: '600',
  },
  line: {
    fontSize: TYPO.body,
    color: COLORS.textSoft,
    marginTop: 2,
  },
  lineStrong: {
    color: COLORS.text,
    fontWeight: '500',
  },
  price: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  owner: {
    fontSize: TYPO.small,
    marginTop: 4,
    color: COLORS.textSoft,
  },
  date: {
    marginTop: SPACING.xs,
    fontSize: TYPO.tiny,
    color: COLORS.textMuted,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyText: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPO.body,
  },
})
