import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import PostSingle from './post/PostSingle';
import PostSingleOverlay from './post/PostSingleOverlayNew';
import { Ionicons } from '@expo/vector-icons';

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
    /** Optional externally controlled active id (stabilizes across filtering) */
    activeId?: string;
    /** Setter for controlled active id (used on swipe) */
    setActiveId?: (id: string) => void;
    /** When true, pause all videos; when false, ensure playing. Used for screen focus/unfocus. */
    externalPaused?: boolean;
    /** Overlay back button controls (used on category screen) */
    showBackButton?: boolean;
    onBack?: () => void;
    categoryLabel?: string;
    // onDiscoverBy removed — discover labels are not clickable
};

export default function TwoLayerFeed({ items, setItems, initialA = 0, initialB = 1, onProfilePress, onOpenComments, onReload, onActiveChange, activeId, setActiveId, externalPaused, showBackButton, onBack, categoryLabel }: Props) {
    const [playA, setPlayA] = useState<boolean>(true);
    const [paused, setPaused] = useState<boolean>(false);
    const lastToggleRef = React.useRef<number>(0);
    const TOGGLE_DEBOUNCE_MS = 300; // milliseconds
    const togglePaused = useCallback(() => {
        const now = Date.now();
        if (now - lastToggleRef.current < TOGGLE_DEBOUNCE_MS) return;
        lastToggleRef.current = now;
        setPaused((p) => !p);
    }, []);
    const [playIndexObject, setplayIndexObject] = useState<PlayIndexObject>({ a: initialA, b: initialB });
    // Shared values for transforms & layering
    const offseta = useSharedValue(0);
    const offsetb = useSharedValue(0);
    const aZindex = useSharedValue(10);
    const bZindex = useSharedValue(0);
    const activeIsA = useSharedValue(1); // 1 = A active, 0 = B active

    // Removed effect-based z-index sync to avoid one-frame mismatch flash.

    const animatedStylesa = useAnimatedStyle(() => ({ transform: [{ translateY: offseta.value }], zIndex: aZindex.value, height: '100%' }));
    const animatedStylesb = useAnimatedStyle(() => ({ transform: [{ translateY: offsetb.value }], zIndex: bZindex.value, height: '100%' }));

    // Removed global tap-to-pause to prevent overlay taps from pausing video; rely on PostSingle's pressable over video only.

    // Sync internal paused with external control (screen focus/unfocus)
    useEffect(() => {
        if (typeof externalPaused === 'boolean') {
            setPaused(externalPaused);
        }
    }, [externalPaused]);

    // shiftActive implements the final commit (flip) after release
    const shiftActive = useCallback((delta: number) => {
        const currentIdx = playA ? playIndexObject.a : playIndexObject.b;
        const nextIdx = Math.min(Math.max(currentIdx + delta, 0), items.length - 1);
        if (nextIdx === currentIdx) return;
        if (setActiveId) {
            const nextItem = items[nextIdx];
            if (nextItem) setActiveId(nextItem.id);
        }
        // Load next into hidden layer first
        setplayIndexObject(prev => playA ? { a: prev.a, b: nextIdx } : { a: nextIdx, b: prev.b });
        // Synchronously update layer stacking before React paints next frame
        if (playA) {
            // B will become active
            aZindex.value = 0; bZindex.value = 10; activeIsA.value = 0;
        } else {
            aZindex.value = 10; bZindex.value = 0; activeIsA.value = 1;
        }
        setPlayA(p => !p);
    }, [playA, playIndexObject.a, playIndexObject.b, items, setActiveId, aZindex, bZindex, activeIsA]);

    // JS function to update hidden layer index (called via runOnJS from worklet)
    const updateHiddenIndex = useCallback((candidateIdx: number, wasAActive: number) => {
        setplayIndexObject((prev) => wasAActive === 1 ? { a: prev.a, b: candidateIdx } : { a: candidateIdx, b: prev.b });
    }, []);

    // Track last reported active id to avoid loops
    const lastReportedId = useRef<string | undefined>(undefined);
    // Persist last non-null items per layer to avoid transient unmount blank frames
    const lastItemARef = useRef<any>(null);
    const lastItemBRef = useRef<any>(null);
    if (items[playIndexObject.a]) lastItemARef.current = items[playIndexObject.a];
    if (items[playIndexObject.b]) lastItemBRef.current = items[playIndexObject.b];
    const postA = items[playIndexObject.a] || lastItemARef.current;
    const postB = items[playIndexObject.b] || lastItemBRef.current;

    // Report active item to parent (only when actual visible post id changes).
    useEffect(() => {
        const activeIdx = playA ? playIndexObject.a : playIndexObject.b;
        const active = items[activeIdx] ?? null;
        const id = active?.id;
        if (id === lastReportedId.current) return;
        lastReportedId.current = id;
        if (!activeId || activeId === id) {
            onActiveChange?.(active);
        }
    }, [playA, playIndexObject.a, playIndexObject.b, items, activeId, onActiveChange]);

    // Keep active layer stable when list or filter changes: realign the index of the active id without flipping layers.
    useEffect(() => {
        if (!activeId) return;
        const newIdx = items.findIndex(it => it.id === activeId);
        if (newIdx === -1) return;
        setplayIndexObject(prev => {
            const activeLayerIdx = playA ? prev.a : prev.b;
            const inactiveLayerIdx = playA ? prev.b : prev.a;
            if (activeLayerIdx === newIdx) return prev;
            let neighbor = newIdx + 1 < items.length ? newIdx + 1 : newIdx - 1;
            if (neighbor < 0) neighbor = newIdx;
            return playA
                ? { a: newIdx, b: neighbor === newIdx ? inactiveLayerIdx : neighbor }
                : { a: neighbor === newIdx ? inactiveLayerIdx : neighbor, b: newIdx };
        });
        // Leave z-index values as-is to avoid a one-frame overlay flicker.
    }, [activeId, items, playA]);

    // predictive preload during gesture
    const pan = useMemo(
        () =>
            Gesture.Pan()
                .onChange((event) => {
                    'worklet';
                    if (activeIsA.value === 1) offseta.value = event.translationY; else offsetb.value = event.translationY;
                    const deltaY = event.translationY;
                    if (Math.abs(deltaY) < 40) return;
                    const isSwipeUp = deltaY > 0; // drag downward => previous
                    const currentIdx = activeIsA.value === 1 ? playIndexObject.a : playIndexObject.b;
                    const candidateIdx = currentIdx + (isSwipeUp ? -1 : 1);
                    if (candidateIdx < 0 || candidateIdx >= items.length) return;
                    if (activeIsA.value === 1 && playIndexObject.b === candidateIdx) return;
                    if (activeIsA.value === 0 && playIndexObject.a === candidateIdx) return;
                    runOnJS(updateHiddenIndex)(candidateIdx, activeIsA.value);
                })
                .onEnd((event) => {
                    'worklet';
                    const distance = Math.abs(event.translationY);
                    if (distance > 400) {
                        const direction = Math.sign(event.translationY) === 1 ? -1 : 1;
                        runOnJS(setPaused)(false);
                        runOnJS(shiftActive)(direction);
                    }
                    offseta.value = 0; offsetb.value = 0;
                }),
        [playIndexObject.a, playIndexObject.b, items.length, updateHiddenIndex, shiftActive, activeIsA]
    );
    const toggleLikeAt = (index: number, delta = 1) => {
        const post = items[index];
        if (!post) return;
        if (setItems) {
            setItems((prev) => prev.map((it) => (it.id === post.id ? { ...it, liked: true, likesCount: Math.max(0, (it.likesCount || 0) + delta) } : it)));
        }
    };

    const OverlayMemo = useMemo(() => React.memo(PostSingleOverlay, (p, n) => p.post?.id === n.post?.id && p.currentLikeState.counter === n.currentLikeState.counter), []);

    return (
        <GestureDetector gesture={pan}>
            <View style={{ flex: 1, backgroundColor: 'black', height: '100%' }}>
                <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, animatedStylesa]}>
                    <View style={{ flex: 1 }}>
                        {/* per-post top-left badge */}
                        {items[playIndexObject.a] && (
                            <View style={{ position: 'absolute', left: 12, top: 24, zIndex: 60 }} pointerEvents="box-none">
                                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {showBackButton && (
                                            <Pressable onPress={onBack} style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 6, marginRight: 6 }} hitSlop={12}>
                                                <Ionicons name="chevron-back" size={20} color="white" />
                                            </Pressable>
                                        )}
                                        <Link href={{ pathname: '/category/[slug]', params: { slug: (items[playIndexObject.a].category || '').replace(/^s\//, '').toLowerCase() } }} style={{ textDecorationLine: 'none' }}>
                                            <Text style={{ color: 'white', fontWeight: '600' }}>{items[playIndexObject.a].category}</Text>
                                        </Link>

                                        {/* pin removed */}
                                    </View>
                                    <Text style={{ color: 'white', textDecorationLine: 'underline', fontSize: 12, marginTop: 4 }}>Discovered by thesixtyone</Text>
                                </View>
                            </View>
                        )}
                        <PostSingle post={postA} paused={paused || !playA} uri={postA?.uri} onTogglePause={togglePaused} />

                        {postA && (
                            <OverlayMemo
                                post={postA}
                                user={{ displayName: 'User', photoURL: undefined }}
                                currentLikeState={{ state: !!postA.liked, counter: postA.likesCount }}
                                commentsCount={postA.commentsCount}
                                handleUpdateLike={(delta = 1) => toggleLikeAt(playIndexObject.a, delta)}
                                handleProfleTouch={() => onProfilePress?.(postA)}
                                onOpenComments={() => onOpenComments?.(postA)}
                                showBackButton={false}
                                onBack={onBack}
                                categoryLabel={categoryLabel}
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
                                        {showBackButton && (
                                            <Pressable onPress={onBack} style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 6, marginRight: 6 }} hitSlop={12}>
                                                <Ionicons name="chevron-back" size={20} color="white" />
                                            </Pressable>
                                        )}
                                        <Link href={{ pathname: '/category/[slug]', params: { slug: (items[playIndexObject.b].category || '').replace(/^s\//, '').toLowerCase() } }} style={{ textDecorationLine: 'none' }}>
                                            <Text style={{ color: 'white', fontWeight: '600' }}>{items[playIndexObject.b].category}</Text>
                                        </Link>

                                        {/* pin removed */}
                                    </View>
                                    <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>discovered by user123</Text>
                                </View>
                            </View>
                        )}
                        <PostSingle post={postB} paused={paused || playA} uri={postB?.uri} onTogglePause={togglePaused} />

                        {postB && (
                            <OverlayMemo
                                post={postB}
                                user={{ displayName: 'User', photoURL: undefined }}
                                currentLikeState={{ state: !!postB.liked, counter: postB.likesCount }}
                                commentsCount={postB.commentsCount}
                                handleUpdateLike={(delta = 1) => toggleLikeAt(playIndexObject.b, delta)}
                                handleProfleTouch={() => onProfilePress?.(postB)}
                                onOpenComments={() => onOpenComments?.(postB)}
                                showBackButton={false}
                                onBack={onBack}
                                categoryLabel={categoryLabel}
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </GestureDetector>
    );
}
