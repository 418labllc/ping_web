import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TwoLayerFeed from '../../../components/TwoLayerFeed';
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
            creator: `agent_${idx % 10}`,
            category: `s/${category}`,
            uri,
        });
    }
    return items;
}

export default function CategoryPage() {
    const { slug } = useLocalSearchParams();
    const router = useRouter();
    const [items, setItems] = useState(() => generateItems(1, 60));
    const [loadingMore, setLoadingMore] = useState(false);
    // likes are tracked on the item objects (items[].liked)
    // don't pre-set filterCategory from the slug (case may differ); allow slug-based inclusive filtering below
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const filtered = items.filter((it) => {
        if (filterCategory) return it.category === filterCategory;
        if (discoverBy) return DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false;
        return String(it.category).toLowerCase().includes(String(slug || '').toLowerCase());
    });

    return (
        <View style={styles.container}>
            <TwoLayerFeed
                items={filtered}
                setItems={setItems}
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
