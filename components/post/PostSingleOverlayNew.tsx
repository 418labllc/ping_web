import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
// This overlay intentionally contains no hooks; actions like opening comments
// should be passed in via callback props from the consumer.
import ProfileImage from '../common/ProfileImage';
import type { Post } from '../../types/post';

export type PostSingleOverlayPropsNew = {
    post: Post;
    user: any;
    // handler accepts an optional delta (number of hearts to add)
    handleUpdateLike: (delta?: number) => void;
    handleProfleTouch: () => void;
    // currentLikeState: { state: boolean; counter: number }
    currentLikeState: { state: boolean; counter: number };
    commentsCount: number;
    onOpenComments?: (post: Post) => void;
    // Back button (category screen)
    showBackButton?: boolean;
    onBack?: () => void;
    categoryLabel?: string;
};

const PostSingleOverlayNew = ({
    user,
    post,
    handleUpdateLike,
    currentLikeState,
    commentsCount,
    handleProfleTouch,
    onOpenComments,
    showBackButton,
    onBack,
    categoryLabel,
}: PostSingleOverlayPropsNew) => {

    const todayKey = () => {
        const d = new Date();
        return `hearts:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const [processing, setProcessing] = useState(false);

    const onHeartPress = async () => {
        // Always add a heart (no unlike). Each heart consumes from daily allowance.
        const heartsKey = todayKey();
        if (processing) return;
        setProcessing(true);
        try {

            // // prevent multiple hearts on same post today
            // const already = await AsyncStorage.getItem(postKey);
            // if (already) {
            //     Toast.show({ type: 'info', text1: 'You already hearted this post today' });
            //     setProcessing(false);
            //     return;
            // }

            const raw = await AsyncStorage.getItem(heartsKey);
            const used = raw ? Number(raw) : 0;
            const MAX = 7;
            if (used >= MAX) {
                Toast.show({ type: 'error', text1: 'No hearts left for today' });
                setProcessing(false);
                return;
            }

            const newUsed = used + 1;
            await AsyncStorage.setItem(heartsKey, String(newUsed));
            // additive: inform parent to increment likes by 1
            handleUpdateLike?.(1);
            Toast.show({ type: 'success', text1: `Heart used (${newUsed}/${MAX})` });
        } catch (e) {
            // fallback: still toggle like
            handleUpdateLike?.(1);
            Toast.show({ type: 'info', text1: 'Liked' });
            setProcessing(false);
            return;
        }
        setProcessing(false);
    };

    const buildShareUrl = () => {
        // Assumes a canonical share URL scheme. Adjust path as needed.
        return `https://www.getsubapp.com/p/${post?.id ?? ''}`;
    };

    const onSharePress = async () => {
        try {
            const url = buildShareUrl();
            await Share.share({
                title: 'Check out this video',
                message: `Check out this video on Sub! ${url}`,
                url,
            });
        } catch (e: any) {
            // User cancel or error — keep quiet unless it's a real error
            const msg = String(e?.message || e || '');
            if (!msg.toLowerCase().includes('user did not share')) {
                Toast.show({ type: 'error', text1: 'Unable to share right now' });
            }
        }
    };
    return (
        <View style={styles.container} pointerEvents="box-none">
            {showBackButton && (
                <View style={styles.backRow} pointerEvents="box-none">
                    <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    {categoryLabel ? (
                        <View style={styles.catPill}>
                            <Text style={styles.catPillText}>{categoryLabel.toUpperCase()}</Text>
                        </View>
                    ) : null}
                </View>
            )}
            <View style={styles.bottomRow} pointerEvents="box-none">
                <View style={styles.left}>
                    <Text style={styles.name}>{user?.displayName}</Text>
                    <Text style={styles.desc}>{post?.description}</Text>
                </View>
                <View style={styles.right}>
                    <Pressable onPress={() => handleProfleTouch()} style={styles.iconWrap}>
                        <ProfileImage photoURL={user?.photoURL} />
                    </Pressable>
                    <Pressable onPress={onHeartPress} style={[styles.iconWrap, { marginTop: 14 }]}>
                        <Ionicons
                            color="white"
                            size={40}
                            name={currentLikeState.state ? 'heart' : 'heart-outline'}
                        />
                        <Text style={styles.countText}>{currentLikeState.counter}</Text>
                    </Pressable>
                    <Pressable onPress={onSharePress} style={[styles.iconWrap,]}>
                        <Ionicons color="white" size={40} name={'share-social-outline'} />
                    </Pressable>
                    <Pressable
                        style={styles.iconWrap}
                        onPress={() => {
                            if (onOpenComments) onOpenComments(post);
                        }}
                    >
                        <Ionicons color="white" size={40} name={'chatbox-ellipses-sharp'} />
                        <Text style={styles.countText}>{commentsCount}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    bottomRow: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 10,
    },
    backRow: {
        position: 'absolute',
        left: 8,
        top: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
        padding: 6,
        marginRight: 6,
    },
    catPill: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    catPillText: { color: 'white', fontWeight: '700', fontSize: 14 },
    left: { width: 160 },
    right: { alignItems: 'center' },
    name: { color: 'white', fontWeight: '700', fontSize: 16 },
    desc: { color: 'white', marginTop: 6 },
    iconWrap: { padding: 8, alignItems: 'center' },
    countText: { marginTop: 6, color: 'white', textAlign: 'center' },
});

export default PostSingleOverlayNew;
