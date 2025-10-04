import React, { useState, useEffect, useMemo } from 'react';
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
// Infinite feed hook
import { useInfiniteFeed } from '../../../hooks/useInfiniteFeed';
import type { Post } from '../../../types/post';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

const { height, width } = Dimensions.get('window');

// Map a discoverer handle (like 'thesixtyone') to a list of creator ids used in items
const DISCOVER_MAP: Record<string, string[]> = { thesixtyone: ['agent_1', 'agent_5', 'agent_9'] };

export default function FeedScreen() {

    // Infinite feed query
    const { items: queryItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed();
    const items = queryItems; // rename for downstream logic
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    // track likes on the item objects themselves (items[].liked) so counts update
    // reliably and re-rendering is straightforward
    // Removed pin/category filter feature; keep simple list
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const router = useRouter();
    const item = activeItem;

    const handleDiscoverBy = (who: string) => {
        setDiscoverBy(who);
    };


    // derive filtered list first (stable reference for effect comparisons)
    const filteredItems = useMemo(() => {
        if (discoverBy) return items.filter((it) => DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false);
        return items;
    }, [items, discoverBy]);

    // when query loads first page set activeId if not set
    useEffect(() => {
        if (!activeId && filteredItems.length > 0) setActiveId(filteredItems[0].id);
    }, [filteredItems, activeId]);

    // keep activeId valid after filtering (if current activeId not present choose nearest by original order)
    useEffect(() => {
        if (activeId && !filteredItems.some((i) => i.id === activeId)) {
            if (filteredItems.length === 0) {
                setActiveId(undefined);
            } else {
                setActiveId(filteredItems[0].id);
            }
        }
    }, [filteredItems, activeId]);

    const [screenPaused, setScreenPaused] = useState<boolean>(false);
    // Play when this screen is focused; pause when unfocused/unmounted
    useFocusEffect(
        React.useCallback(() => {
            setScreenPaused(false);
            return () => setScreenPaused(true);
        }, [])
    );

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            {/* (moved) category badge + discover UI is rendered near the bottom (below) */}

            <TwoLayerFeed
                items={filteredItems}
                setItems={(updater) => {
                    if (typeof updater === 'function') updater(filteredItems);
                }}
                onProfilePress={(post) => router.push({ pathname: '/profile', params: { id: post.creator } })}
                onOpenComments={(post) => { }}
                onReload={() => { if (!isFetchingNextPage && hasNextPage) fetchNextPage(); }}
                onActiveChange={(post) => {
                    setActiveItem(post);
                    if (post && post.id !== activeId) setActiveId(post.id);
                    if (post) {
                        const idx = filteredItems.findIndex(i => i.id === post.id);
                        if (idx >= filteredItems.length - 3 && hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }
                }}
                activeId={activeId}
                setActiveId={setActiveId}
                externalPaused={screenPaused}
            />
            {discoverBy && (
                <View style={styles.filterPill}>
                    <TouchableOpacity onPress={() => { setDiscoverBy(null); }}>
                        <Text style={{ color: 'white' }}>Clear discover: {discoverBy}</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* overlays are provided per layer inside TwoLayerFeed */}

            {/* category badge + discover UI (top-left) */}
            {item ? (
                <View pointerEvents="box-none">
                    <View style={styles.categoryBadgeContainer} pointerEvents="box-none">
                        <View style={styles.categoryRow}>
                            <TouchableOpacity onPress={() => {
                                const slug = (item.category || '').replace(/^s\//, '').toLowerCase();
                                router.push({ pathname: '/category/[slug]', params: { slug, activeId: item.id } });
                            }} style={styles.categoryBadgeTouchable}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.discoverContainer} pointerEvents="box-none">
                        <Text style={styles.discoverText}>Discovered by thesixtyone</Text>
                    </View>
                </View>
            ) : null}

            {(isFetchingNextPage || isLoading) && (
                <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
                    <ActivityIndicator color="white" />
                </View>
            )}
            <View style={styles.topRightContainer}>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    categoryBadge: {
        position: 'absolute',
        left: 12,
        top: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: { color: 'white', fontWeight: '600' },
    topRightContainer: { position: 'absolute', right: 16, top: 40 },
    filterButton: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 8, borderRadius: 8 },
    filterText: { color: 'white' },
    categoryBadgeContainer: { position: 'absolute', left: 12, top: 24 },
    categoryBadgeTouchable: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    pinTouch: {},
    pinText: {},
    pinActive: {},
    discoverContainer: { position: 'absolute', left: 12, top: 74 },
    discoverText: { color: 'white', textDecorationLine: 'underline', fontSize: 12 },
    filterPill: { position: 'absolute', top: 80, left: 16, backgroundColor: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: 12 },
});
