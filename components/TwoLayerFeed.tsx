import React, { useMemo, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import PostSingle from './post/PostSingle';
import PostSingleOverlay from './post/PostSingleOverlayNew';

export type PlayIndexObject = { a: number; b: number };

type Props = {
    items: Array<any>;
    setItems?: (updater: (prev: any[]) => any[]) => void;
    initialA?: number;
    initialB?: number;
    onProfilePress?: (post: any) => void;
    onOpenComments?: (post: any) => void;
    onReload?: () => void;
    onActiveChange?: (post: any | null) => void;
    onToggleCategoryFilter?: (category: string) => void;
    // onDiscoverBy removed — discover labels are not clickable
};

export default function TwoLayerFeed({ items, setItems, initialA = 0, initialB = 1, onProfilePress, onOpenComments, onReload, onActiveChange, onToggleCategoryFilter }: Props) {
    const [playA, setPlayA] = useState<boolean>(true);
    const [paused, setPaused] = useState<boolean>(false);
    const [playIndexObject, setplayIndexObject] = useState<PlayIndexObject>({ a: initialA, b: initialB });
    const router = useRouter();

    // inform parent about active item (use a as base active index)
    useEffect(() => {
        if (onActiveChange) {
            const active = items[playIndexObject.a] ?? null;
            onActiveChange(active);
        }
    }, [playIndexObject.a, playIndexObject.b, items, onActiveChange]);

    const tap = Gesture.Tap().onStart(() => {
        runOnJS(setPaused)(p => !p);
    });

    const offseta = useSharedValue(0);
    const offsetb = useSharedValue(0);
    const aZindex = useSharedValue(10);
    const bZindex = useSharedValue(0);

    const updateB = (number: number) => {
        setplayIndexObject((prevState) => ({ ...prevState, b: prevState.a + number }));
    };
    const updateA = (number: number) => {
        setplayIndexObject((prevState) => ({ ...prevState, a: prevState.b + number }));
    };
    const updateReload = (number: number) => {
        if (onReload) runOnJS(onReload)();
    };

    const pan = useMemo(
        () =>
            Gesture.Pan()
                .onEnd((e) => {
                    const direction = Math.sign(e.translationY) === 1 ? 'Up' : 'Down';

                    if (Math.abs(e.translationY) > 400) {
                        runOnJS(setPaused)(false);
                        if (aZindex.value > 0) {
                            // A on top
                            if (direction === 'Up' && playIndexObject.a <= 0) {
                                return;
                            }
                            aZindex.value = 0;
                            bZindex.value = 10;
                            offseta.value = 0;
                            runOnJS(setPlayA)(false);
                        } else {
                            // B on top
                            if (direction === 'Up' && playIndexObject.b <= 0) {
                                return;
                            }

                            if (direction === 'Down' && playIndexObject.b >= items.length - 1) {
                                return;
                            }
                            aZindex.value = 10;
                            bZindex.value = 0;
                            offsetb.value = 0;
                            runOnJS(setPlayA)(true);
                        }
                    } else {
                        offseta.value = 0;
                        offsetb.value = 0;
                    }
                })
                .onChange((e) => {
                    ('worklet');
                    const direction = Math.sign(e.translationY) === 1 ? 'Up' : 'Down';

                    if (aZindex.value > 0) {
                        if (direction === 'Up' && playIndexObject.a > 0) {
                            runOnJS(updateB)(-1);
                        } else {
                            runOnJS(updateB)(1);
                        }

                        if ((playIndexObject.a > 0 && direction === 'Up') || (playIndexObject.a >= 0 && direction === 'Down' && playIndexObject.a < items.length - 1 && playIndexObject.a <= items.length - 1 && direction === 'Down')) {
                            offseta.value = e.changeY + offseta.value;
                        } else {
                            runOnJS(updateReload)(1);
                        }
                    } else {
                        if (direction === 'Up' && playIndexObject.b > 0) {
                            runOnJS(updateA)(-1);
                        } else {
                            runOnJS(updateA)(1);
                        }
                        if ((playIndexObject.b < items.length - 1 && direction === 'Down') || (playIndexObject.b <= items.length - 1 && direction === 'Up')) {
                            offsetb.value = e.changeY + offsetb.value;
                        } else {
                            runOnJS(updateReload)(1);
                        }
                    }
                }),
        [playIndexObject, aZindex, bZindex, items.length]
    );

    const animatedStylesa = useAnimatedStyle(() => ({ transform: [{ translateY: offseta.value }], zIndex: aZindex.value, height: '100%' }));
    const animatedStylesb = useAnimatedStyle(() => ({ transform: [{ translateY: offsetb.value }], zIndex: bZindex.value, height: '100%' }));

    // helpers to update like on parent items array
    const toggleLikeAt = (index: number, delta = 1) => {
        const post = items[index];
        if (!post) return;
        if (setItems) {
            setItems((prev) => prev.map((it) => (it.id === post.id ? { ...it, liked: true, likesCount: Math.max(0, (it.likesCount || 0) + delta) } : it)));
        }
    };

    return (
        <GestureDetector gesture={pan}>
            <GestureDetector gesture={tap}>
                <View style={{ flex: 1, backgroundColor: 'black', height: '100%' }}>
                    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, animatedStylesa]}>
                        <View style={{ flex: 1 }}>
                            {/* per-post top-left badge */}
                            {items[playIndexObject.a] && (
                                <View style={{ position: 'absolute', left: 12, top: 24, zIndex: 60 }} pointerEvents="box-none">
                                    <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Link href={{ pathname: '/category/[slug]', params: { slug: (items[playIndexObject.a].category || '').replace(/^s\//, '').toLowerCase() } }} style={{ textDecorationLine: 'none' }}>
                                                <Text style={{ color: 'white', fontWeight: '600' }}>{items[playIndexObject.a].category}</Text>
                                            </Link>

                                            <TouchableOpacity onPress={() => onToggleCategoryFilter?.(items[playIndexObject.a].category)} style={{ marginLeft: 8, padding: 6 }}>
                                                <Text style={{ color: 'white', opacity: 0.8 }}>📌</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{ color: 'white', textDecorationLine: 'underline', fontSize: 12, marginTop: 4 }}>Discovered by thesixtyone</Text>
                                    </View>
                                </View>
                            )}
                            <PostSingle post={items[playIndexObject.a]} paused={paused || !playA} uri={items[playIndexObject.a]?.uri} tap={tap as any} />

                            {items[playIndexObject.a] && (
                                <PostSingleOverlay
                                    post={items[playIndexObject.a]}
                                    user={{ displayName: 'User', photoURL: undefined }}
                                    currentLikeState={{ state: !!items[playIndexObject.a].liked, counter: items[playIndexObject.a].likesCount }}
                                    commentsCount={items[playIndexObject.a].commentsCount}
                                    handleUpdateLike={(delta = 1) => toggleLikeAt(playIndexObject.a, delta)}
                                    handleProfleTouch={() => onProfilePress?.(items[playIndexObject.a])}
                                    onOpenComments={() => onOpenComments?.(items[playIndexObject.a])}
                                />
                            )}
                        </View>
                    </Animated.View>

                    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, animatedStylesb]}>
                        <View style={{ flex: 1 }}>
                            {/* per-post top-left badge */}
                            {items[playIndexObject.b] && (
                                <View style={{ position: 'absolute', left: 12, top: 24, zIndex: 60 }} pointerEvents="box-none">
                                    <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Link href={{ pathname: '/category/[slug]', params: { slug: (items[playIndexObject.b].category || '').replace(/^s\//, '').toLowerCase() } }} style={{ textDecorationLine: 'none' }}>
                                                <Text style={{ color: 'white', fontWeight: '600' }}>{items[playIndexObject.b].category}</Text>
                                            </Link>

                                            <TouchableOpacity onPress={() => onToggleCategoryFilter?.(items[playIndexObject.b].category)} style={{ marginLeft: 8, padding: 6 }}>
                                                <Text style={{ color: 'white', opacity: 0.8 }}>📌</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>discovered by user123</Text>
                                    </View>
                                </View>
                            )}
                            <PostSingle post={items[playIndexObject.b]} paused={paused || playA} uri={items[playIndexObject.b]?.uri} tap={tap as any} />

                            {items[playIndexObject.b] && (
                                <PostSingleOverlay
                                    post={items[playIndexObject.b]}
                                    user={{ displayName: 'User', photoURL: undefined }}
                                    currentLikeState={{ state: !!items[playIndexObject.b].liked, counter: items[playIndexObject.b].likesCount }}
                                    commentsCount={items[playIndexObject.b].commentsCount}
                                    handleUpdateLike={(delta = 1) => toggleLikeAt(playIndexObject.b, delta)}
                                    handleProfleTouch={() => onProfilePress?.(items[playIndexObject.b])}
                                    onOpenComments={() => onOpenComments?.(items[playIndexObject.b])}
                                />
                            )}
                        </View>
                    </Animated.View>
                </View>
            </GestureDetector>
        </GestureDetector>
    );
}
