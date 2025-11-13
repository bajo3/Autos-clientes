// app/screens/SearchListScreen.js
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { COLORS, SPACING, TYPO } from '../../components/theme'
import Badge from '../../components/ui/Badge'
import FilterBar from '../../components/ui/FilterBar'
import ListItem from '../../components/ui/ListItem'
import SectionTitle from '../../components/ui/SectionTitle'
import Spacer from '../../components/ui/Spacer'
import { supabase } from '../lib/supabase'

export default function SearchListScreen({ navigation }) {
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [filterStatus, setFilterStatus] = useState('activa') // 'activa' | 'todas'
  const [matchFilter, setMatchFilter] = useState('todos') // 'todos' | 'con' | 'sin'
  const [sortMode, setSortMode] = useState('agenda') // 'agenda' | 'nuevo' | 'viejo'
  const [viewMode, setViewMode] = useState('list') // 'list' | 'compact' | 'ultra' | 'grid'

  // ---------- CARGA DE DATOS ----------
  const loadSearches = async () => {
    setLoading(true)

    try {
      const [searchRes, vehicleRes, interactionsRes] = await Promise.all([
        supabase
          .from('search_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('vehicles')
          .select('brand, model, year, price, archived')
          .eq('archived', false),
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

      const isSameDay = (dateStr) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        return (
          d.getFullYear() === todayY &&
          d.getMonth() === todayM &&
          d.getDate() === todayD
        )
      }

      const enhanced = searchesData.map((s) => {
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

  // ---------- PRIORIDAD / URGENCIA ----------
  const getPriority = (s) => {
    const now = new Date()
    const reminder = s.reminder_at ? new Date(s.reminder_at) : null
    const lastInt = s.lastInteractionAt ? new Date(s.lastInteractionAt) : null

    if (reminder && reminder <= now) return 0 // HOY / vencido
    if (reminder && reminder > now) return 1 // futuro
    if (lastInt) return 2 // tuvo movimiento
    return 3 // nada
  }

  const getPriorityInfo = (s) => {
    const p = getPriority(s)
    if (s.reminder_at) {
      if (s.hasReminderToday) {
        return { priority: p, label: 'HOY', icon: '⏰' }
      }
      return { priority: p, label: 'Próx.', icon: '📅' }
    }
    if (s.lastInteractionAt) {
      return { priority: p, label: 'Seguimiento', icon: '💬' }
    }
    return { priority: p, label: 'Baja', icon: '⬇️' }
  }

  // ---------- FILTROS / ORDEN ----------
  let filtered =
    filterStatus === 'todas'
      ? searches
      : searches.filter((s) => (s.status || 'activa') === 'activa')

  filtered = filtered.filter((s) => {
    if (matchFilter === 'con') return !!s.has_match
    if (matchFilter === 'sin') return !s.has_match
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'nuevo') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortMode === 'viejo') {
      return new Date(a.created_at) - new Date(b.created_at)
    }

    const pa = getPriority(a)
    const pb = getPriority(b)
    if (pa !== pb) return pa - pb

    if (a.reminder_at && b.reminder_at) {
      return new Date(a.reminder_at) - new Date(b.reminder_at)
    }

    if (a.lastInteractionAt && b.lastInteractionAt) {
      return new Date(a.lastInteractionAt) - new Date(b.lastInteractionAt)
    }

    return new Date(b.created_at) - new Date(a.created_at)
  })

  // ---------- RENDER ITEM (3 MODOS) ----------
  const buildBaseInfo = (item) => {
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
    const priorityInfo = getPriorityInfo(item)

    const subtitle = `${item.brand || 'Marca ?'} ${item.model || ''}`.trim()
    const alta = new Date(item.created_at).toLocaleDateString('es-AR')

    const parts = []

    if (hasMatch) {
      parts.push(`🚗 ${matchCount}`)
    } else {
      parts.push('🚗 0')
    }

    if (priorityInfo) {
      parts.push(`${priorityInfo.icon} ${priorityInfo.label}`)
    }

    parts.push(`📅 ${alta}`)

    const meta = parts.join('   ')

    return { status, statusLabel, hasMatch, matchCount, priorityInfo, subtitle, alta, meta }
  }

  const renderStandardItem = (item, compact = false) => {
    const { status, statusLabel, meta, subtitle } = buildBaseInfo(item)

    const badge = (
      <Badge
        label={statusLabel}
        status={status}
        tone="outline"
        style={{ marginBottom: 4 }}
      />
    )

    return (
      <ListItem
        title={item.client_name}
        subtitle={subtitle}
        meta={meta}
        badge={badge}
        compact={compact}
        onPress={() => navigation.navigate('SearchDetail', { search: item })}
      />
    )
  }

  const renderUltraItem = (item) => {
    const { statusLabel, meta, subtitle, priorityInfo } = buildBaseInfo(item)

    return (
      <View style={styles.ultraItemContainer}>
        <View style={styles.ultraLeft}>
          <Text style={styles.ultraTitle} numberOfLines={1}>
            {item.client_name} · {subtitle}
          </Text>
          <Text style={styles.ultraMeta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <View style={styles.ultraRight}>
          <Text style={styles.ultraUrgency}>
            {priorityInfo.icon} {statusLabel}
          </Text>
        </View>
      </View>
    )
  }

  const renderGridItem = (item) => {
    const { status, statusLabel, meta, subtitle, priorityInfo } = buildBaseInfo(
      item
    )

    return (
      <View style={styles.gridCard}>
        <View style={styles.gridHeaderRow}>
          <Text style={styles.gridTitle} numberOfLines={1}>
            {item.client_name}
          </Text>
          <Text style={styles.gridStatus}>
            {priorityInfo.icon} {statusLabel}
          </Text>
        </View>
        <Text style={styles.gridSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.gridMeta} numberOfLines={2}>
          {meta}
        </Text>
        <View style={styles.gridFooter}>
          <Text style={styles.gridFooterText}>Ver</Text>
          <Text style={styles.gridFooterStatus}>{status}</Text>
        </View>
      </View>
    )
  }

  const renderItem = ({ item }) => {
    if (viewMode === 'ultra') {
      return renderUltraItem(item)
    }
    if (viewMode === 'grid') {
      return (
        <View style={styles.gridWrapper}>
          {renderGridItem(item)}
        </View>
      )
    }
    if (viewMode === 'compact') {
      return renderStandardItem(item, true)
    }
    return renderStandardItem(item, false)
  }

  // ---------- FILTROS / VIEW MODES ----------
  const statusFilters = [
    { key: 'activa', label: 'Activas', state: 'activa' },
    { key: 'todas', label: 'Todas', state: 'todas' },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    active: filterStatus === f.state,
    size: 'sm',
    onPress: () => setFilterStatus(f.state),
  }))

  const matchFilters = [
    { key: 'con', label: 'Con match', state: 'con' },
    { key: 'sin', label: 'Sin match', state: 'sin' },
    { key: 'todos', label: 'Match: todos', state: 'todos' },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    active: matchFilter === f.state,
    size: 'sm',
    onPress: () => setMatchFilter(f.state),
  }))

  const sortFilters = [
    { key: 'agenda', label: 'Agenda', state: 'agenda' },
    { key: 'nuevo', label: 'Más nuevos', state: 'nuevo' },
    { key: 'viejo', label: 'Más viejos', state: 'viejo' },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    active: sortMode === f.state,
    size: 'sm',
    onPress: () => setSortMode(f.state),
  }))

  const viewFilters = [
    { key: 'list', label: 'Lista', state: 'list' },
    { key: 'compact', label: 'Compacto', state: 'compact' },
    { key: 'ultra', label: 'Ultra', state: 'ultra' },
    { key: 'grid', label: 'Grid', state: 'grid' },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    active: viewMode === f.state,
    size: 'sm',
    onPress: () => setViewMode(f.state),
  }))

  const allFilters = [
    ...statusFilters,
    ...matchFilters,
    ...sortFilters,
    ...viewFilters,
  ]

  const numColumns = viewMode === 'grid' ? 2 : 1

  // ---------- UI ----------
  return (
    <View style={styles.container}>
      {/* título */}
      <View style={styles.headerBlock}>
        <SectionTitle
          title="Búsquedas"
          subtitle="Agenda ordenada por recordatorios y actividad"
        />
      </View>

      {/* menú principal en fila */}
      <View style={styles.actionsRow}>
        <View style={{ flex: 1, marginRight: SPACING.xs }}>
          <Button
            title="Dash"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Dashboard')}
          />
        </View>
        <View style={{ flex: 1, marginHorizontal: SPACING.xs }}>
          <Button
            title="Autos"
            color={COLORS.success}
            onPress={() => navigation.navigate('VehicleList')}
          />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.xs }}>
          <Button
            title="+ Nueva"
            color={COLORS.secondary}
            onPress={() => navigation.navigate('NewSearch')}
          />
        </View>
      </View>

      {/* barra única de filtros */}
      <FilterBar items={allFilters} horizontal />
      <Spacer size={SPACING.sm} />

      {loading && sorted.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          key={numColumns} // fuerza re-render al cambiar entre lista / grid
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: SPACING.xxl }}
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

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  headerBlock: {
    marginBottom: SPACING.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    fontSize: TYPO.small,
    color: COLORS.textMuted,
  },

  // ultra-compacto
  ultraItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderMuted || '#1f2733',
  },
  ultraLeft: {
    flex: 1,
  },
  ultraRight: {
    marginLeft: SPACING.sm,
    alignItems: 'flex-end',
  },
  ultraTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  ultraMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ultraUrgency: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // grid
  gridWrapper: {
    flex: 1,
    padding: SPACING.xs,
  },
  gridCard: {
    flex: 1,
    borderRadius: 10,
    padding: SPACING.sm,
    backgroundColor: COLORS.card || '#050816',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border || '#121826',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  gridStatus: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  gridSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  gridMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridFooterText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  gridFooterStatus: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
})
