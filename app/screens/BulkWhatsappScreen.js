// app/screens/BulkWhatsappScreen.js
import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Linking,
} from 'react-native'
import { supabase } from '../lib/supabase'
import {
    COLORS,
    SPACING,
    RADIUS,
    TYPO,
} from '../../components/theme'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import FilterBar from '../../components/ui/FilterBar'
import Spacer from '../../components/ui/Spacer'

export default function BulkWhatsappScreen() {
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [searches, setSearches] = useState([])
    const [statusFilter, setStatusFilter] = useState('activa') // 'activa' | 'todas' | 'contactado' | 'cerrada' | 'descartada'

    const [template, setTemplate] = useState(
        'Hola {{nombre}}, soy de la agencia. Tengo novedades de autos que se ajustan a lo que estás buscando{{busqueda}}. ¿Te interesa que te cuente?'
    )

    const loadSearches = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('search_requests')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.log('Error loading searches for bulk WhatsApp', error)
                setSearches([])
            } else {
                setSearches(data || [])
            }
        } catch (err) {
            console.log('Unexpected error loading searches for bulk WhatsApp', err)
            setSearches([])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadSearches()
    }, [])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await loadSearches()
        setRefreshing(false)
    }, [])

    const buildMessage = (s) => {
        const nombre = s.client_name || ''
        const busquedaRaw = [s.brand, s.model].filter(Boolean).join(' ')
        const busqueda = busquedaRaw ? ` (${busquedaRaw})` : ''

        return template
            .replace(/{{nombre}}/gi, nombre)
            .replace(/{{busqueda}}/gi, busqueda)
    }

    const handleSendWhatsApp = (s) => {
        if (!s.client_phone) return
        const msg = buildMessage(s)
        const phone = s.client_phone.replace(/[^0-9]/g, '')
        if (!phone) return

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
        Linking.openURL(url)
    }

    const statusItems = [
        { key: 'activa', label: 'Activas', state: 'activa' },
        { key: 'contactado', label: 'Contactado', state: 'contactado' },
        { key: 'cerrada', label: 'Cerradas', state: 'cerrada' },
        { key: 'descartada', label: 'Descartadas', state: 'descartada' },
        { key: 'todas', label: 'Todas', state: 'todas' },
    ].map((st) => ({
        key: st.key,
        label: st.label,
        active: statusFilter === st.state,
        size: 'sm',
        onPress: () => setStatusFilter(st.state),
    }))

    const filtered = searches.filter((s) => {
        const hasPhone = !!(s.client_phone && s.client_phone.trim())
        if (!hasPhone) return false

        const status = s.status || 'activa'
        if (statusFilter === 'todas') return true
        return status === statusFilter
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

        const messagePreview = buildMessage(item)

        return (
            <View style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1, marginRight: SPACING.sm }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.client_name || 'Sin nombre'}
                        </Text>
                        <Text style={styles.itemPhone}>
                            {item.client_phone || 'Sin teléfono'}
                        </Text>
                    </View>
                    <View style={[styles.statusPill, styles[`status_${status}`]]}>
                        <Text style={styles.statusPillText}>{statusLabel}</Text>
                    </View>
                </View>

                <Text style={styles.itemSearch}>
                    Busca:{' '}
                    <Text style={styles.itemSearchStrong}>
                        {item.brand || '-'} {item.model || ''}
                    </Text>
                </Text>

                <Text style={styles.itemPreview} numberOfLines={2}>
                    {messagePreview}
                </Text>

                <View style={styles.itemFooterRow}>
                    <Text style={styles.itemMeta}>
                        Alta: {new Date(item.created_at).toLocaleDateString('es-AR')}
                    </Text>
                    <TouchableOpacity
                        style={styles.whatsappButton}
                        onPress={() => handleSendWhatsApp(item)}
                    >
                        <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyboardShouldPersistTaps="handled"
        >
            <SectionTitle
                title="WhatsApp masivo"
                subtitle="Usá una plantilla y enviá mensaje cliente por cliente"
            />

            <Card>
                <Text style={styles.blockTitle}>Plantilla de mensaje</Text>
                <TextInput
                    style={styles.templateInput}
                    multiline
                    value={template}
                    onChangeText={setTemplate}
                    placeholder="Escribí el mensaje base..."
                    placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.helperStrong}>{"{{nombre}}"}</Text>
                <Text style={styles.helperStrong}>{"{{busqueda}}"}</Text>

            </Card>

            <Spacer size={SPACING.lg} />

            <Card>
                <Text style={styles.blockTitle}>Segmento de clientes</Text>
                <FilterBar items={statusItems} horizontal />
                <Spacer size={SPACING.sm} />
                <Text style={styles.resultText}>
                    Mostrando{' '}
                    <Text style={styles.resultStrong}>{filtered.length}</Text> clientes
                    con teléfono.
                </Text>
            </Card>

            <Spacer size={SPACING.lg} />

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : filtered.length === 0 ? (
                <Text style={styles.emptyText}>
                    No hay clientes en este segmento con teléfono cargado.
                </Text>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                />
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

    blockTitle: {
        fontSize: TYPO.subtitle,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    templateInput: {
        minHeight: 90,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        backgroundColor: COLORS.inputBackground,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        fontSize: TYPO.body,
        color: COLORS.text,
        textAlignVertical: 'top',
    },
    helperText: {
        marginTop: SPACING.xs,
        fontSize: TYPO.tiny,
        color: COLORS.textMuted,
    },
    helperStrong: {
        color: COLORS.textSoft,
        fontWeight: '600',
    },

    resultText: {
        fontSize: TYPO.small,
        color: COLORS.textSoft,
    },
    resultStrong: {
        color: COLORS.text,
        fontWeight: '600',
    },

    listContent: {
        paddingBottom: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.lg,
        fontSize: TYPO.body,
        color: COLORS.textMuted,
        textAlign: 'center',
    },

    itemCard: {
        backgroundColor: COLORS.cardAlt,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    itemHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    itemTitle: {
        fontSize: TYPO.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    itemPhone: {
        fontSize: TYPO.small,
        color: COLORS.textSoft,
        marginTop: 2,
    },
    statusPill: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.pill,
        marginLeft: SPACING.sm,
    },
    statusPillText: {
        fontSize: TYPO.tiny,
        fontWeight: '600',
        color: COLORS.textInverted,
    },
    status_activa: {
        backgroundColor: COLORS.statusActive,
    },
    status_contactado: {
        backgroundColor: COLORS.statusContacted,
    },
    status_cerrada: {
        backgroundColor: COLORS.statusClosed,
    },
    status_descartada: {
        backgroundColor: COLORS.statusDiscarded,
    },

    itemSearch: {
        fontSize: TYPO.small,
        color: COLORS.textSoft,
        marginTop: 2,
    },
    itemSearchStrong: {
        color: COLORS.text,
    },
    itemPreview: {
        fontSize: TYPO.small,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },

    itemFooterRow: {
        marginTop: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemMeta: {
        fontSize: TYPO.tiny,
        color: COLORS.textMuted,
    },
    whatsappButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.success,
    },
    whatsappButtonText: {
        fontSize: TYPO.small,
        fontWeight: '600',
        color: COLORS.textInverted,
    },
})
