import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PostSingle from '../../../components/post/PostSingle';
import PostSingleOverlay from '../../../components/post/PostSingleOverlay';
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
    const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
    // don't pre-set filterCategory from the slug (case may differ); allow slug-based inclusive filtering below
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [discoverBy, setDiscoverBy] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeItem, setActiveItem] = useState<any | null>(null);

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
            setActiveItem(viewableItems[0].item ?? null);
        }
    }).current;

    const filtered = items.filter((it) => {
        if (filterCategory) return it.category === filterCategory;
        if (discoverBy) return DISCOVER_MAP[discoverBy]?.includes(it.creator) ?? false;
        return String(it.category).toLowerCase().includes(String(slug || '').toLowerCase());
    });

    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
        const paused = index !== activeIndex;

        return (
            <View style={{ height, width }}>
                <PostSingle paused={paused} post={item} uri={item.uri} tap={undefined as any} />

                <View style={styles.categoryBadgeContainer} pointerEvents="box-none">
                    <View style={styles.categoryRow}>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: (item.category || '').replace(/^s\//, '').toLowerCase() } })} style={styles.categoryBadgeTouchable}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilterCategory((prev) => (prev === item.category ? null : item.category))} style={styles.pinTouch}>
                            <Text style={[styles.pinText, filterCategory === item.category && styles.pinActive]}>📌</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.discoverContainer} pointerEvents="box-none">
                    <TouchableOpacity onPress={() => setDiscoverBy('thesixtyone')}>
                        <Text style={styles.discoverText}>Discovered by thesixtyone</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, [activeIndex, router, filterCategory]);

    return (
        <View style={styles.container}>
            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={height}
                snapToAlignment="start"
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                onEndReached={() => {
                    if (loadingMore) return;
                    setLoadingMore(true);
                    setTimeout(() => {
                        setItems((prev) => [...prev, ...generateItems(prev.length + 1, 30)]);
                        setLoadingMore(false);
                    }, 600);
                }}
                onEndReachedThreshold={0.6}
            />

            {activeItem && (
                <PostSingleOverlay
                    post={activeItem}
                    likesCount={activeItem.likesCount + (likedMap[activeItem.id] ? 1 : 0)}
                    commentsCount={activeItem.commentsCount}
                    onLikePress={() => {
                        setLikedMap((prev) => {
                            const newMap = { ...prev };
                            if (newMap[activeItem.id]) {
                                delete newMap[activeItem.id];
                            } else {
                                newMap[activeItem.id] = true;
                            }
                            return newMap;
                        });
                    }}
                    onProfilePress={() => router.push({ pathname: '/profile', params: { id: activeItem.creator } })}
                />
            )}

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
