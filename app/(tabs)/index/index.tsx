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
import type { Post } from '../../../types/post';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

const { height, width } = Dimensions.get('window');

const DISCOVER_MAP: Record<string, string[]> = {
    thesixtyone: ['agent_1', 'agent_5', 'agent_9'],
};

export default function FeedScreen() {
    // Prefer assigning to a variable so we can access query status/error for debug
    const query = usePosts();
    const { items: queryItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = query;
    const dlog = (...args: any[]) => { if (__DEV__) console.log('[Feed]', ...args); };
    React.useEffect(() => { dlog('mounted'); return () => dlog('unmounted'); }, []);
    React.useEffect(() => { dlog('isLoading:', isLoading, 'isFetchingNextPage:', isFetchingNextPage, 'hasNextPage:', hasNextPage); }, [isLoading, isFetchingNextPage, hasNextPage]);
    const items = queryItems;
    React.useEffect(() => { dlog('items changed:', items.length); }, [items.length]);
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<'hot' | 'new' | 'top'>('hot');
    const [resetToken, setResetToken] = useState(0);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const lastOrderRef = useRef<{ key: string; arr: any[] } | null>(null);

    const handleDiscoverBy = (who: string) => setDiscoverBy(who);

    // --- Filtered list ---
    const filteredItems = useMemo(() => {
        if (discoverBy)
            return items.filter((it) => DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false);
        return items;
    }, [items, discoverBy]);

    const getCreatedTs = (it: any) => {
        const v = it?.createdAt ?? it?.created_at ?? it?.created ?? it?.ts ?? 0;
        const t = typeof v === 'number' ? v : new Date(v || 0).getTime();
        return Number.isFinite(t) ? t : 0;
    };

    // --- Sorted list with stable reference ---
    const sortedItems = useMemo(() => {
        const arr = [...filteredItems];
        if (sortMode === 'new') {
            arr.sort((a, b) => {
                const ad = getCreatedTs(a);
                const bd = getCreatedTs(b);
                if (bd !== ad) return bd - ad;
                return String(a.id ?? '').localeCompare(String(b.id ?? ''));
            });
        } else if (sortMode === 'top') {
            arr.sort((a, b) => {
                const ascore = (a.likesCount || 0) + (a.commentsCount || 0) * 0.5;
                const bscore = (b.likesCount || 0) + (b.commentsCount || 0) * 0.5;
                if (bscore !== ascore) return bscore - ascore;
                const ad = getCreatedTs(a);
                const bd = getCreatedTs(b);
                if (bd !== ad) return bd - ad;
                return String(a.id ?? '').localeCompare(String(b.id ?? ''));
            });
        } else {
            const now = Date.now();
            arr.sort((a, b) => {
                const ad = getCreatedTs(a);
                const bd = getCreatedTs(b);
                const aAgeH = Math.max(1, (now - ad) / 3600000);
                const bAgeH = Math.max(1, (now - bd) / 3600000);
                const ahot =
                    ((a.likesCount || 0) + (a.commentsCount || 0) * 0.6) / Math.pow(aAgeH + 2, 1.2);
                const bhot =
                    ((b.likesCount || 0) + (b.commentsCount || 0) * 0.6) / Math.pow(bAgeH + 2, 1.2);
                if (bhot !== ahot) return bhot - ahot;
                if (bd !== ad) return bd - ad;
                return String(a.id ?? '').localeCompare(String(b.id ?? ''));
            });
        }

        const key = arr.map((it) => String(it.id ?? '')).join('|');
        if (lastOrderRef.current?.key === key) return lastOrderRef.current.arr;
        lastOrderRef.current = { key, arr };
        return arr;
    }, [filteredItems, sortMode]);

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
                    dlog('onReload called');
                    if (!isFetchingNextPage && hasNextPage) {
                        dlog('fetchNextPage from onReload');
                        fetchNextPage();
                    } else {
                        dlog('skip fetch (isFetchingNextPage:', isFetchingNextPage, 'hasNextPage:', hasNextPage, ')');
                    }
                }}
                onActiveChange={(post) => {
                    setActiveItem(post);
                    if (post && post.id !== activeId) setActiveId(post.id);
                    if (post) {
                        const idx = sortedItems.findIndex((i) => i.id === post.id);
                        if (idx >= sortedItems.length - 3 && hasNextPage && !isFetchingNextPage) {
                            dlog('prefetch next page, idx:', idx, 'len:', sortedItems.length);
                            fetchNextPage();
                        }
                    }
                }}
                activeId={activeId}
                setActiveId={setActiveId}
                externalPaused={screenPaused}
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
    loading: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});
