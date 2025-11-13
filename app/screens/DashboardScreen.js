// app/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { supabase } from '../lib/supabase'
import {
  COLORS,
  SPACING,
  TYPO,
  RADIUS,
} from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import Spacer from '../../components/ui/Spacer'

export default function DashboardScreen({ navigation }) {
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

      const { count: activeSearches } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'activa')

      const { count: totalSearches } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })

      const { count: closedThisMonth } = await supabase
        .from('search_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cerrada')
        .gte('created_at', firstOfMonth)

      const { count: availableVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disponible')

      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })

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

  const closingRate =
    stats.totalSearches > 0
      ? Math.round((stats.closedThisMonth / stats.totalSearches) * 100)
      : 0

  const inventoryUsage =
    stats.totalVehicles > 0
      ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100)
      : 0

  const today = new Date()
  const monthLabel = today.toLocaleString('es-AR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SectionTitle
        title="Dashboard"
        subtitle={`Resumen de ${monthLabel}`}
      />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {/* BLOQUE BÚSQUEDAS */}
          <Text style={styles.sectionLabel}>Búsquedas</Text>
          <View style={styles.row}>
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Activas</Text>
              <Text style={styles.cardValue}>{stats.activeSearches}</Text>
              <Text style={styles.cardHint}>
                Clientes esperando seguimiento
              </Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Cerradas este mes</Text>
              <Text style={styles.cardValue}>{stats.closedThisMonth}</Text>
              <Text style={styles.cardHint}>
                Operaciones marcadas como cerradas
              </Text>
            </Card>
          </View>

          <View style={styles.row}>
            <Card style={styles.cardFull}>
              <Text style={styles.cardLabel}>Total de búsquedas</Text>
              <Text style={styles.cardValue}>{stats.totalSearches}</Text>
              <View style={styles.inlineStatRow}>
                <Text style={styles.inlineLabel}>Tasa de cierre del mes</Text>
                <Text
                  style={[
                    styles.inlineValue,
                    closingRate >= 30
                      ? styles.badgeOk
                      : closingRate >= 10
                      ? styles.badgeWarn
                      : styles.badgeLow,
                  ]}
                >
                  {closingRate}%
                </Text>
              </View>
            </Card>
          </View>

          <Spacer size={SPACING.lg} />

          {/* BLOQUE AUTOS */}
          <Text style={styles.sectionLabel}>Autos</Text>
          <View style={styles.row}>
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Disponibles</Text>
              <Text style={styles.cardValue}>{stats.availableVehicles}</Text>
              <Text style={styles.cardHint}>Publicables o para ofrecer</Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Total cargados</Text>
              <Text style={styles.cardValue}>{stats.totalVehicles}</Text>
              <Text style={styles.cardHint}>Incluye archivados</Text>
            </Card>
          </View>

          <View style={styles.row}>
            <Card style={styles.cardFull}>
              <Text style={styles.cardLabel}>Uso de inventario</Text>
              <View style={styles.inlineStatRow}>
                <Text style={styles.inlineLabel}>Disponibles / Total</Text>
                <Text
                  style={[
                    styles.inlineValue,
                    inventoryUsage >= 70
                      ? styles.badgeOk
                      : inventoryUsage >= 40
                      ? styles.badgeWarn
                      : styles.badgeLow,
                  ]}
                >
                  {inventoryUsage}%
                </Text>
              </View>

              {/* barra simple */}
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min(inventoryUsage, 100)}%` },
                  ]}
                />
              </View>
            </Card>
          </View>

          <Spacer size={SPACING.xl} />

          {/* RESUMEN TEXTO */}
          <Text style={styles.summaryText}>
            Tenés{' '}
            <Text style={styles.summaryStrong}>
              {stats.activeSearches} búsqueda(s) activa(s)
            </Text>{' '}
            y{' '}
            <Text style={styles.summaryStrong}>
              {stats.availableVehicles} auto(s) disponible(s)
            </Text>{' '}
            cargados en el sistema.
          </Text>

          <Spacer size={SPACING.lg} />

          {/* BOTÓN WHATSAPP MASIVO */}
          <TouchableOpacity
            style={styles.massButton}
            onPress={() => navigation.navigate('BulkWhatsapp')}
          >
            <Text style={styles.massButtonText}>WhatsApp masivo</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingBox: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    fontSize: TYPO.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
  },
  cardFull: {
    flex: 1,
  },

  cardLabel: {
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },
  cardValue: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardHint: {
    marginTop: 4,
    fontSize: TYPO.tiny,
    color: COLORS.textSoft,
  },

  inlineStatRow: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSoft,
  },
  inlineLabel: {
    fontSize: TYPO.small,
    color: COLORS.textSoft,
  },
  inlineValue: {
    fontSize: TYPO.small,
    fontWeight: '700',
  },

  badgeOk: {
    color: COLORS.success,
  },
  badgeWarn: {
    color: COLORS.warning,
  },
  badgeLow: {
    color: COLORS.danger,
  },

  barBackground: {
    marginTop: SPACING.sm,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.subtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },

  summaryText: {
    fontSize: TYPO.body,
    color: COLORS.textSoft,
  },
  summaryStrong: {
    color: COLORS.text,
    fontWeight: '600',
  },

  massButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  massButtonText: {
    color: COLORS.textInverted,
    fontSize: TYPO.subtitle,
    fontWeight: '600',
    textAlign: 'center',
  },
})
