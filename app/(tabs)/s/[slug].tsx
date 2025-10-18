import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TwoLayerFeed from '../../../components/TwoLayerFeed';
import { usePosts } from '../../../hooks/usePosts';

export default function CategoryPage() {
    const { slug, activeId: incomingActiveId } = useLocalSearchParams();
    const slugStr = String(slug || '').toLowerCase();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Sort controls and Top range dropdown state
    const [sortMode, setSortMode] = useState<'hot' | 'new' | 'top'>('hot');
    const [topRange, setTopRange] = useState<'15d' | '30d' | '3m' | 'all'>('all');
    const [topDropdownOpen, setTopDropdownOpen] = useState(false);
    const [resetToken, setResetToken] = useState(0);

    // Server-side filter: only createdAfter for Top ranges (category is filtered client-side)
    const postsFilter = useMemo(() => {
        const f: any = {};
        if (sortMode === 'hot') {
            f.sort = 'HOTNESS';
            f.hotnessMin = 0.000001; // strictly greater than 0
        } else if (sortMode === 'new') {
            f.sort = 'NEWEST';
        } else {
            f.sort = 'MOST_HEARTS';
            if (topRange !== 'all') {
                let ms = 0;
                if (topRange === '15d') ms = 15 * 24 * 60 * 60 * 1000;
                if (topRange === '30d') ms = 30 * 24 * 60 * 60 * 1000;
                if (topRange === '3m') ms = 90 * 24 * 60 * 60 * 1000;
                if (ms) f.createdAfter = new Date(Date.now() - ms).toISOString();
            }
        }
        return f;
    }, [sortMode, topRange]);

    // Fetch posts with optional filter to trigger API calls when filters change
    const query = usePosts({ filter: postsFilter, queryKeyExtra: slugStr });
    const { items: queryItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = query;

    // Filter posts by category slug client-side (server doesn't accept categorySlug yet)
    const filteredItems = useMemo(() => {
        return (queryItems || []).filter((it: any) => {
            const slugVal = it?.category?.slug ? String(it.category.slug).toLowerCase() : '';
            return slugVal === slugStr || slugVal === `s/${slugStr}`;
        });
    }, [queryItems, slugStr]);

    // Sort like index (default: hot)
    // Remove cached array optimization to avoid stale lists after filter changes

    const sortedItems = useMemo(() => filteredItems, [filteredItems]);

    // Active item tracking (respect incomingActiveId if valid)
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (!activeId && incomingActiveId && sortedItems.some((f) => f.id === incomingActiveId)) {
            setActiveId(String(incomingActiveId));
        } else if (!activeId && sortedItems.length > 0) {
            setActiveId(sortedItems[0].id);
        }
    }, [incomingActiveId, sortedItems, activeId]);

    // Pause/resume on focus
    const [screenPaused, setScreenPaused] = useState<boolean>(false);
    useFocusEffect(
        React.useCallback(() => {
            setScreenPaused(false);
            return () => setScreenPaused(true);
        }, [])
    );

    useEffect(() => {
        if (sortMode !== 'top' && topDropdownOpen) setTopDropdownOpen(false);
    }, [sortMode, topDropdownOpen]);

    // Hot has no threshold fallback; it always uses hotnessMin=0.0

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <TwoLayerFeed
                items={sortedItems}
                // Category page doesn't mutate items itself
                setItems={() => { }}
                onProfilePress={(post) => router.push({ pathname: '/profile', params: { id: post.creator } })}
                onOpenComments={() => { }}
                onReload={() => {
                    if (!isFetchingNextPage && hasNextPage) {
                        fetchNextPage();
                    }
                }}
                onActiveChange={(post) => {
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
                resetToken={resetToken}
                showBackButton
                onBack={() => {
                    router.replace({ pathname: '/' } as any);
                }}
                categoryLabel={String(slugStr)}
                emptyMessage={
                    sortMode === 'hot' && query.isFetched && !isLoading && sortedItems.length === 0
                        ? `No hot videos in ${slugStr} right now`
                        : undefined
                }
            />

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
                                    setResetToken((t) => t + 1);
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

// Note: Hot always uses hotnessMin=0.0 (no fallback needed)
