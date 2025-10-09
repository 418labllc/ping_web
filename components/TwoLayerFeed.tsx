import React, { useRef, useCallback, useState, useEffect } from "react";
import {
    View,
    Dimensions,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";
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

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: any[] }) => {
            if (isResettingRef.current) return;
            if (!viewableItems?.length) return;
            const visible = viewableItems[0]?.index ?? 0;
            setActiveIndex(visible);
            const id = items[visible]?.id as string | undefined;
            if (id && lastEmittedIdRef.current !== id) {
                lastEmittedIdRef.current = id;
                onActiveChange?.(items[visible]);
                setActiveId?.(id);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80,
    }).current;

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
                                likesCount: (it.likesCount || 0) + d,
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
                            counter: item.likesCount,
                        }}
                        commentsCount={item.commentsCount}
                        handleUpdateLike={handleUpdateLike}
                        handleProfleTouch={() => onProfilePress?.(item)}
                        onOpenComments={() => onOpenComments?.(item)}
                        showBackButton={showBackButton}
                        onBack={onBack}
                        categoryLabel={
                            typeof (item as any)?.category === "string"
                                ? (item as any).category
                                : categoryLabel
                        }
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

    return (
        <View style={{ flex: 1 }} onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
            <FlashList
                ref={flatListRef}
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ?? String(index)}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                overrideItemLayout={overrideItemLayout}
                decelerationRate={Platform.OS === "ios" ? 0.98 : 0.985}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onEndReached={onReload}
                onEndReachedThreshold={0.6}
                snapToInterval={ITEM_H}
                snapToAlignment="start"
                disableIntervalMomentum
                bounces={false}
                removeClippedSubviews
                contentContainerStyle={{ paddingBottom: insets.bottom }}
            />
        </View>
    );
}
