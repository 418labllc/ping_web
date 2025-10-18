import React, { useRef, useCallback, useState, useEffect } from "react";
import {
    View,
    Text,
    Dimensions,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    Pressable,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PostSingle from "./post/PostSingle";
import PostSingleOverlay from "./post/PostSingleOverlay";

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");

type Props = {
    items: Array<any>;
    setItems?: (updater: (prev: any[]) => any[]) => void;
    onProfilePress?: (post: any) => void;
    onOpenComments?: (post: any) => void;
    onActiveChange?: (post: any | null) => void;
    onReload?: () => void;
    externalPaused?: boolean;
    activeId?: string;
    setActiveId?: (id: string | undefined) => void;
    showBackButton?: boolean;
    onBack?: () => void;
    categoryLabel?: string;
    // When this token changes, the list will reset to the top and suppress
    // viewability callbacks briefly. Useful when switching sort/filter modes.
    resetToken?: number;
    // Pull-to-refresh
    onRefresh?: () => void;
    refreshing?: boolean;
    // Optional message shown when items is empty
    emptyMessage?: string;
};

export default function VideoFeedFlashList({
    items,
    setItems,
    onProfilePress,
    onOpenComments,
    onActiveChange,
    onReload,
    externalPaused,
    activeId,
    setActiveId,
    showBackButton,
    onBack,
    categoryLabel,
    resetToken,
    onRefresh,
    refreshing,
    emptyMessage,
}: Props) {
    const flatListRef = useRef<FlashListRef<any>>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [listHeight, setListHeight] = useState<number>(SCREEN_H);
    const ITEM_H = Math.max(1, listHeight || SCREEN_H);
    const insets = useSafeAreaInsets();
    const isResettingRef = useRef(false);
    const lastEmittedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (typeof externalPaused === "boolean") {
            setPaused(externalPaused);
        }
    }, [externalPaused]);

    // Keep feed aligned with externally controlled activeId
    useEffect(() => {
        if (!activeId || items.length === 0) return;
        const idx = items.findIndex((i) => i.id === activeId);
        if (idx >= 0 && idx !== activeIndex) {
            const y = idx * ITEM_H;
            flatListRef.current?.scrollToOffset({ offset: y, animated: false });
            setActiveIndex(idx);
        }
    }, [activeId, items, ITEM_H]);

    // We rely on explicit snapping (onMomentumScrollEnd) and controlled resets
    // to determine the active index, to avoid thrashing during filter changes.

    // FlashList override signature: (layout, item, index, maxColumns)
    const overrideItemLayout = useCallback(
        (
            layout: { span?: number },
            _item: any,
            index: number,
            _maxColumns: number
        ) => {
            // FlashList uses estimated sizes; we still provide snapToInterval to enforce paging.
            // If using masonry, span can be set here; for full-screen, we leave it undefined.
        },
        []
    );

    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            const isActive = index === activeIndex;
            const handleUpdateLike = (d: number = 1) => {
                if (!setItems) return;
                setItems((prev) =>
                    prev.map((it) =>
                        it.id === item.id
                            ? {
                                ...it,
                                liked: true,
                                heartsCount: (it.heartsCount || 0) + d,
                            }
                            : it
                    )
                );
            };
            return (
                <View
                    style={{
                        height: ITEM_H,
                        width: SCREEN_W,
                        backgroundColor: "black",
                    }}
                >
                    <PostSingle
                        key={item.id}
                        post={item}
                        paused={!isActive || paused}
                        uri={item.uri}
                    />

                    <PostSingleOverlay
                        post={item}
                        user={{ displayName: "User" }}
                        currentLikeState={{
                            state: !!item.liked,
                            counter: item.heartsCount,
                        }}
                        commentsCount={item.commentsCount}
                        handleUpdateLike={handleUpdateLike}
                        handleProfleTouch={() => onProfilePress?.(item)}
                        onOpenComments={() => onOpenComments?.(item)}
                        showBackButton={showBackButton}
                        onBack={onBack}
                        categoryLabel={(item as any)?.category?.slug}
                    />
                </View>
            );
        },
        [activeIndex, paused, onProfilePress, onOpenComments, setItems, ITEM_H]
    );

    // 👇 Manual snapping for perfect TikTok-like paging
    const handleMomentumScrollEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (isResettingRef.current) return;
            const offsetY = e.nativeEvent.contentOffset.y;
            const newIndex = Math.round(offsetY / ITEM_H);

            // Always snap exactly to item height
            const snappedY = newIndex * ITEM_H;

            flatListRef.current?.scrollToOffset({
                offset: snappedY,
                animated: true,
            });

            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
                const id = items[newIndex]?.id as string | undefined;
                if (id && lastEmittedIdRef.current !== id) {
                    lastEmittedIdRef.current = id;
                    onActiveChange?.(items[newIndex]);
                    setActiveId?.(id);
                }
            }
        },
        [activeIndex, items, ITEM_H]
    );

    // Reset list to top on resetToken changes (e.g., sort/filter switch)
    useEffect(() => {
        if (typeof resetToken === 'number') {
            isResettingRef.current = true;
            // Scroll to top without animation
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            // Update active index/state to the first item if present
            if (items.length > 0) {
                setActiveIndex(0);
                const id = items[0]?.id as string | undefined;
                if (id) {
                    lastEmittedIdRef.current = id;
                    onActiveChange?.(items[0]);
                    setActiveId?.(id);
                }
            }
            // Allow viewability after a short delay
            const t = setTimeout(() => {
                isResettingRef.current = false;
            }, 200);
            return () => clearTimeout(t);
        }
    }, [resetToken]);

    // Also reset to top when the items source itself changes drastically,
    // which commonly happens on sort/filter switches for the first page.
    useEffect(() => {
        if (!items || items.length === 0) return;
        // If current active index points to a non-existent item, snap back to the top
        const current = items[activeIndex];
        if (!current) {
            isResettingRef.current = true;
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            setActiveIndex(0);
            const id = items[0]?.id as string | undefined;
            if (id) {
                lastEmittedIdRef.current = id;
                onActiveChange?.(items[0]);
                setActiveId?.(id);
            }
            setTimeout(() => {
                isResettingRef.current = false;
            }, 150);
        }
    }, [items]);

    return (
        <View style={{ flex: 1 }} onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
            <FlashList
                ref={flatListRef}
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ?? String(index)}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                overrideItemLayout={overrideItemLayout}
                decelerationRate={Platform.OS === "ios" ? 0.98 : 0.985}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onEndReached={onReload}
                onEndReachedThreshold={0.6}
                snapToInterval={ITEM_H}
                snapToAlignment="start"
                disableIntervalMomentum
                // Enable bounce on iOS so pull-to-refresh can engage at top
                bounces={Platform.OS === 'ios'}
                alwaysBounceVertical={Platform.OS === 'ios'}
                removeClippedSubviews
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                ListEmptyComponent={emptyMessage ? (
                    () => (
                        <View style={{ height: ITEM_H }}>
                            {/* Header pill like PostSingleOverlay */}
                            <View style={{ position: 'absolute', left: 8, top: 8 }} pointerEvents="box-none">
                                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                                    {showBackButton && (
                                        <Pressable onPress={onBack} style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 6, marginRight: 6 }} hitSlop={12}>
                                            <Ionicons name="chevron-back" size={20} color="white" />
                                        </Pressable>
                                    )}
                                    {categoryLabel ? (
                                        <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: '600' }}>{categoryLabel}</Text>
                                    ) : null}
                                </View>
                            </View>

                            {/* Centered empty message */}
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.45)',
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '700' }}>{emptyMessage}</Text>
                                </View>
                            </View>
                        </View>
                    )
                ) : undefined}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={!!refreshing}
                            onRefresh={onRefresh}
                            tintColor={Platform.OS === 'ios' ? '#fff' : undefined}
                            colors={Platform.OS === 'android' ? ['#ffffff'] : undefined}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}
