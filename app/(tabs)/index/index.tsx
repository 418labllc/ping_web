import React, { useCallback, useRef, useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post } from '../../../types/post';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

const VIDEO_A = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const VIDEO_B = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

const CATEGORIES = ['s/RealEstate', 's/Home', 's/Auto', 's/Electronics', 's/Food'];

// Map a discoverer handle (like 'thesixtyone') to a list of creator ids used in items
const DISCOVER_MAP: Record<string, string[]> = {
    thesixtyone: ['agent_1', 'agent_5', 'agent_9'],
};

function generateItems(startIndex: number, count: number) {
    const items: Array<any> = [];
    for (let i = 0; i < count; i++) {
        const idx = startIndex + i;
        const useA = idx % 2 === 0;
        const uri = useA ? VIDEO_A : VIDEO_B;
        const category = CATEGORIES[idx % CATEGORIES.length];
        items.push({
            id: `p${idx}`,
            media: [uri],
            description: `Auto-generated post #${idx}`,
            likesCount: Math.floor(Math.random() * 100),
            commentsCount: Math.floor(Math.random() * 20),
            liked: false,
            creator: `agent_${idx % 10}`,
            category,
            uri,
        });
    }
    return items;
}

export default function FeedScreen() {
    
    const [items, _setItems] = useState<Array<any>>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    // wrapper that persists to AsyncStorage whenever items change
    const STORAGE_KEY = 'feed:items';

    const setItems = (updater: ((prev: any[]) => any[]) | any[]) => {
        _setItems((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            try {
                AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (e) {
                // ignore storage errors
            }
            return next;
        });
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw && mounted) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        _setItems(parsed);
                        return;
                    }
                }
            } catch (e) {
                // ignore
            }

            // no stored items, generate defaults and persist
            const initial = generateItems(1, 12);
            _setItems(initial);
            try {
                AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            } catch (e) {}
        })();
        return () => { mounted = false; };
    }, []);
    const [activeItem, setActiveItem] = useState<any | null>(null);
    // track likes on the item objects themselves (items[].liked) so counts update
    // reliably and re-rendering is straightforward
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const router = useRouter();
    const item = activeItem;

    const handleDiscoverBy = (who: string) => {
        setDiscoverBy(who);
    };


    return (
        <View style={styles.container}>
            <StatusBar hidden />
            {/* (moved) category badge + discover UI is rendered near the bottom (below) */}

            <TwoLayerFeed
                items={filterCategory ? items.filter((it) => it.category === filterCategory) : discoverBy ? items.filter((it) => DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false) : items}
                setItems={setItems}
                onProfilePress={(post) => router.push({ pathname: '/profile', params: { id: post.creator } })}
                onOpenComments={(post) => { /* wire to modal if you want */ }}
                onReload={() => {
                    if (loadingMore) return;
                    setLoadingMore(true);
                    setTimeout(() => {
                        setItems((prev) => [...prev, ...generateItems(prev.length + 1, 30)]);
                        setLoadingMore(false);
                    }, 600);
                }}
                onActiveChange={(post) => setActiveItem(post)}
                onToggleCategoryFilter={(category) => setFilterCategory(category)}
            />
            {(filterCategory || discoverBy) && (
                <View style={styles.filterPill}>
                    <TouchableOpacity onPress={() => { setFilterCategory(null); setDiscoverBy(null); }}>
                        <Text style={{ color: 'white' }}>Clear filter: {filterCategory ?? discoverBy}</Text>
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
                                router.push({ pathname: '/category/[slug]', params: { slug } });
                            }} style={styles.categoryBadgeTouchable}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setFilterCategory((prev) => (prev === item.category ? null : item.category))} style={styles.pinTouch}>
                                <Text style={[styles.pinText, filterCategory === item.category && styles.pinActive]}>📌</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.discoverContainer} pointerEvents="box-none">
                        <Text style={styles.discoverText}>Discovered by thesixtyone</Text>
                    </View>
                </View>
            ) : null}

            {loadingMore && (
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
    pinTouch: { marginLeft: 8, padding: 6 },
    pinText: { color: 'white', opacity: 0.8 },
    pinActive: { color: '#ffd700', opacity: 1 },
    discoverContainer: { position: 'absolute', left: 12, top: 74 },
    discoverText: { color: 'white', textDecorationLine: 'underline', fontSize: 12 },
    filterPill: { position: 'absolute', top: 80, left: 16, backgroundColor: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: 12 },
});
