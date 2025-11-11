// app/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function DashboardScreen() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    activeSearches: 0,
    closedThisMonth: 0,
    totalSearches: 0,
    availableVehicles: 0,
    totalVehicles: 0,
  })

  const loadStats = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const firstOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString()

      // Búsquedas activas
      const { count: activeSearches, error: e1 } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'activa')
      if (e1) console.log('Error activeSearches', e1)

      // Total búsquedas
      const { count: totalSearches, error: e2 } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })
      if (e2) console.log('Error totalSearches', e2)

      // Búsquedas cerradas este mes
      const { count: closedThisMonth, error: e3 } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cerrada')
        .gte('created_at', firstOfMonth)
      if (e3) console.log('Error closedThisMonth', e3)

      // Autos disponibles
      const { count: availableVehicles, error: e4 } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disponible')
      if (e4) console.log('Error availableVehicles', e4)

      // Total autos
      const { count: totalVehicles, error: e5 } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
      if (e5) console.log('Error totalVehicles', e5)

      setStats({
        activeSearches: activeSearches || 0,
        closedThisMonth: closedThisMonth || 0,
        totalSearches: totalSearches || 0,
        availableVehicles: availableVehicles || 0,
        totalVehicles: totalVehicles || 0,
      })
    } catch (err) {
      console.log('Unexpected error loading dashboard stats', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={styles.row}>
            <View style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardLabel}>Búsquedas activas</Text>
              <Text style={styles.cardValue}>{stats.activeSearches}</Text>
            </View>

            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardLabel}>Cerradas este mes</Text>
              <Text style={styles.cardValue}>{stats.closedThisMonth}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardGray]}>
              <Text style={styles.cardLabel}>Total búsquedas</Text>
              <Text style={styles.cardValue}>{stats.totalSearches}</Text>
            </View>

            <View style={[styles.card, styles.cardOrange]}>
              <Text style={styles.cardLabel}>Autos disponibles</Text>
              <Text style={styles.cardValue}>
                {stats.availableVehicles}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardDark]}>
              <Text style={styles.cardLabel}>Total autos</Text>
              <Text style={styles.cardValue}>{stats.totalVehicles}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>Resumen</Text>
          <Text style={styles.summaryText}>
            Tenés {stats.activeSearches} búsqueda(s) activa(s) y{' '}
            {stats.availableVehicles} auto(s) disponible(s) para ofrecer.
          </Text>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: '#f5f5f5',
  },
  cardValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  cardGreen: { backgroundColor: '#28a745' },
  cardBlue: { backgroundColor: '#007bff' },
  cardOrange: { backgroundColor: '#fd7e14' },
  cardGray: { backgroundColor: '#6c757d' },
  cardDark: { backgroundColor: '#343a40' },
  subtitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryText: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
})
