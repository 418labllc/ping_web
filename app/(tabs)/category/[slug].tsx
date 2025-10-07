import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TwoLayerFeed from '../../../components/TwoLayerFeed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post } from '../../../types/post';

const { height, width } = Dimensions.get('window');

const VIDEO_A = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const VIDEO_B = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

const CATEGORIES = ['RealEstate', 'Home', 'Auto', 'Electronics', 'Food'];

// Map a discoverer handle to creators (re-using index logic)
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
            id: `c${idx}`,
            media: [uri],
            description: `Category post #${idx}`,
            likesCount: Math.floor(Math.random() * 100),
            commentsCount: Math.floor(Math.random() * 20),
            liked: false,
            creator: `agent_${idx % 10}`,
            category: `s/${category}`,
            uri,
        });
    }
    return items;
}

export default function CategoryPage() {
    const { slug, activeId: incomingActiveId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [items, _setItems] = useState<Array<any>>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const STORAGE_KEY = 'feed:items';

    // persist wrapper so updates (likes/hearts) are saved and shared with main feed
    const setItems = (updater: ((prev: any[]) => any[]) | any[]) => {
        _setItems((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            try { AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { }
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

            const initial = generateItems(1, 60);
            _setItems(initial);
            try { AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch (e) { }
        })();
        return () => { mounted = false; };
    }, []);
    // likes are tracked on the item objects (items[].liked)
    // don't pre-set filterCategory from the slug (case may differ); allow slug-based inclusive filtering below
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const filtered = items.filter((it) => {
        if (filterCategory) return it.category === filterCategory;
        if (discoverBy) return DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false;
        return String(it.category).toLowerCase().includes(String(slug || '').toLowerCase());
    });

    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    // Initialize activeId from navigation param when items arrive
    useEffect(() => {
        if (!activeId && incomingActiveId && filtered.some(f => f.id === incomingActiveId)) {
            setActiveId(String(incomingActiveId));
        } else if (!activeId && filtered.length > 0) {
            setActiveId(filtered[0].id);
        }
    }, [incomingActiveId, filtered, activeId]);

    const [screenPaused, setScreenPaused] = useState<boolean>(false);
    useFocusEffect(
        React.useCallback(() => {
            setScreenPaused(false);
            return () => setScreenPaused(true);
        }, [])
    );

    return (
        <View style={styles.container}>
            <TwoLayerFeed
                items={filtered}
                setItems={setItems}
                activeId={activeId}
                setActiveId={setActiveId}
                onProfilePress={(post) => router.push({ pathname: '/profile', params: { id: post.creator } })}
                onOpenComments={(post) => { /* noop */ }}
                onReload={() => {
                    if (loadingMore) return;
                    setLoadingMore(true);
                    setTimeout(() => {
                        setItems((prev) => [...prev, ...generateItems(prev.length + 1, 30)]);
                        setLoadingMore(false);
                    }, 600);
                }}
                externalPaused={screenPaused}
                showBackButton
                onBack={() => {
                    router.replace({ pathname: '/' } as any);
                }}
                categoryLabel={String(slug)}
            />

            {loadingMore && (
                <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
                    <ActivityIndicator color="white" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    // Back button now lives in the per-post overlay
    catLabelWrap: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    catLabelText: { color: 'white', fontWeight: '700', fontSize: 14 },
    header: { color: 'white', fontSize: 18, padding: 12 },
    categoryBadgeContainer: { position: 'absolute', left: 12, top: 24 },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    categoryBadgeTouchable: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    categoryText: { color: 'white', fontWeight: '600' },
    pinTouch: { marginLeft: 8, padding: 6 },
    pinText: { color: 'white', opacity: 0.8 },
    pinActive: { color: '#ffd700', opacity: 1 },
    discoverContainer: { position: 'absolute', left: 12, top: 74 },
    discoverText: { color: 'white', textDecorationLine: 'underline', fontSize: 12 },
});
