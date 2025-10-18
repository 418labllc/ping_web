import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import TwoLayerFeed from '../../../components/TwoLayerFeed';
import { usePosts } from '../../../hooks/usePosts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

const { height, width } = Dimensions.get('window');

const DISCOVER_MAP: Record<string, string[]> = {
    thesixtyone: ['agent_1', 'agent_5', 'agent_9'],
};

export default function FeedScreen() {
    // Compute server-side filter for posts (createdAfter) based on TOP range
    const [sortMode, setSortMode] = useState<'hot' | 'new' | 'top'>('hot');
    const [topRange, setTopRange] = useState<'15d' | '30d' | '3m' | 'all'>('all');
    const postsFilter = useMemo(() => {
        const f: any = {};
        if (sortMode === 'hot') {
            f.sort = 'HOTNESS';
            f.hotnessMin = 0.000001; // strictly greater than 0
        } else if (sortMode === 'new') {
            f.sort = 'NEWEST';
        } else {
            // top
            f.sort = 'MOST_HEARTS';
            if (topRange !== 'all') {
                const now = Date.now();
                let ms = 0;
                if (topRange === '15d') ms = 15 * 24 * 60 * 60 * 1000;
                if (topRange === '30d') ms = 30 * 24 * 60 * 60 * 1000;
                if (topRange === '3m') ms = 90 * 24 * 60 * 60 * 1000;
                if (ms) f.createdAfter = new Date(now - ms).toISOString();
            }
        }
        return f;
    }, [sortMode, topRange]);
    // Prefer assigning to a variable so we can access query status/error for debug
    const query = usePosts({ filter: postsFilter });
    const { items: queryItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = query;
    const items = queryItems;
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    // sortMode and topRange moved above to build postsFilter
    const [topDropdownOpen, setTopDropdownOpen] = useState(false);
    const [resetToken, setResetToken] = useState(0);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // Removed cached array optimization to ensure fresh data applies immediately on filter switches

    const handleDiscoverBy = (who: string) => setDiscoverBy(who);


    // Rely on queryKey (filter) changes to refetch; no manual refetch on sort change

    // --- Sorted list with stable reference ---
    const sortedItems = useMemo(() => items, [items]);

    // --- Active Item Tracking ---
    useEffect(() => {
        if (!activeId && sortedItems.length > 0) setActiveId(sortedItems[0].id);
    }, [sortedItems, activeId]);

    useEffect(() => {
        if (activeId && !sortedItems.some((i) => i.id === activeId)) {
            if (sortedItems.length === 0) setActiveId(undefined);
            else setActiveId(sortedItems[0].id);
        }
    }, [sortedItems, activeId]);

    const [screenPaused, setScreenPaused] = useState<boolean>(false);
    useFocusEffect(
        React.useCallback(() => {
            setScreenPaused(false);
            return () => setScreenPaused(true);
        }, [])
    );

    // Close dropdown when leaving 'top' mode
    useEffect(() => {
        if (sortMode !== 'top' && topDropdownOpen) setTopDropdownOpen(false);
    }, [sortMode, topDropdownOpen]);

    // --- Render ---
    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <TwoLayerFeed
                items={sortedItems}
                resetToken={resetToken}
                // 🧠 Prevent feedback loop by not calling setItems in render
                setItems={() => { }}
                onProfilePress={(post) =>
                    router.push({ pathname: '/profile', params: { id: post.creator } })
                }
                onOpenComments={() => { }}
                onReload={() => {
                    if (!isFetchingNextPage && hasNextPage) {
                        fetchNextPage();
                    } else {
                    }
                }}
                onActiveChange={(post) => {
                    setActiveItem(post);
                    if (post && post.id !== activeId) setActiveId(post.id);
                    if (post) {
                        const idx = sortedItems.findIndex((i) => i.id === post.id);
                        if (idx >= sortedItems.length - 3 && hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }
                }}
                activeId={activeId}
                setActiveId={setActiveId}
                externalPaused={screenPaused}
                refreshing={!!(query.isFetching && !isFetchingNextPage)}
                onRefresh={() => {
                    query.refetch();
                }}
                emptyMessage={
                    sortMode === 'hot' && query.isFetched && !isLoading && sortedItems.length === 0
                        ? 'No hot videos right now'
                        : undefined
                }
            />

            {discoverBy && (
                <View style={styles.filterPill}>
                    <TouchableOpacity onPress={() => setDiscoverBy(null)}>
                        <Text style={{ color: 'white' }}>Clear discover: {discoverBy}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(isFetchingNextPage || isLoading) && (
                <View style={styles.loading}>
                    <ActivityIndicator color="white" />
                </View>
            )}

            <View
                style={[styles.topRightContainer, { top: Math.max(12, insets.top + 8) }]}
                pointerEvents="box-none"
            >
                <View style={styles.segmentWrap}>
                    {(['hot', 'new', 'top'] as const).map((m) => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => {
                                if (sortMode !== m) {
                                    setSortMode(m);
                                    setResetToken((t) => t + 1); // resets scroll only once
                                }
                            }}
                            style={[styles.segmentBtn, sortMode === m && styles.segmentBtnActive]}
                        >
                            <Text style={[styles.segmentText, sortMode === m && styles.segmentTextActive]}>
                                {m.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {sortMode === 'top' && (
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setTopDropdownOpen((v) => !v)}
                        >
                            <Text style={styles.dropdownButtonText}>
                                Top: {topRange === '15d' ? '15 Days' : topRange === '30d' ? '30 Days' : topRange === '3m' ? '3 Months' : 'All Time'} ▾
                            </Text>
                        </TouchableOpacity>
                        {topDropdownOpen && (
                            <View style={styles.dropdownMenu}>
                                {([
                                    { key: '15d', label: '15 Days' },
                                    { key: '30d', label: '30 Days' },
                                    { key: '3m', label: '3 Months' },
                                    { key: 'all', label: 'All Time' },
                                ] as const).map((opt) => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        onPress={() => {
                                            if (topRange !== opt.key) {
                                                setTopRange(opt.key);
                                                setResetToken((t) => t + 1);
                                            }
                                            setTopDropdownOpen(false);
                                        }}
                                        style={[styles.dropdownItem, topRange === opt.key && styles.dropdownItemActive]}
                                    >
                                        <Text style={[styles.dropdownItemText, topRange === opt.key && styles.dropdownItemTextActive]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    topRightContainer: { position: 'absolute', right: 16, top: 40 },
    filterPill: {
        position: 'absolute',
        top: 80,
        left: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 8,
        borderRadius: 12,
    },
    segmentWrap: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 16,
    },
    segmentBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginHorizontal: 2,
    },
    segmentBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
    segmentText: { color: 'white', fontWeight: '600', fontSize: 12 },
    segmentTextActive: { color: 'white' },
    rangeWrap: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: 4,
        borderRadius: 12,
        marginTop: 6,
    },
    rangeBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginHorizontal: 2,
        backgroundColor: 'transparent',
    },
    rangeBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
    rangeText: { color: 'white', fontSize: 11, fontWeight: '600' },
    rangeTextActive: { color: 'white' },
    dropdownContainer: { marginTop: 6, alignSelf: 'flex-end' },
    dropdownButton: {
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    dropdownButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
    dropdownMenu: {
        marginTop: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        overflow: 'hidden',
        minWidth: 160,
    },
    dropdownItem: { paddingHorizontal: 10, paddingVertical: 8 },
    dropdownItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
    dropdownItemText: { color: 'white', fontSize: 12, fontWeight: '600' },
    dropdownItemTextActive: { color: 'white' },
    loading: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});
