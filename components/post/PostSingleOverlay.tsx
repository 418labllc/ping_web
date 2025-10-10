import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform, Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import ProfileImage from '../common/ProfileImage';
import type { Post } from '../../types/post';

export type PostSingleOverlayPropsNew = {
  post: Post;
  user: any;
  handleUpdateLike: (delta?: number) => void;
  handleProfleTouch: () => void;
  currentLikeState: { state: boolean; counter: number };
  commentsCount: number;
  onOpenComments?: (post: Post) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  categoryLabel?: string;
};

export default function PostSingleOverlayNewAndroid({ user, post, handleUpdateLike, currentLikeState, commentsCount, handleProfleTouch, onOpenComments, showBackButton, onBack, categoryLabel }: PostSingleOverlayPropsNew) {
  //   const insets = useSafeAreaInsets();
  //   const topPad = Math.max(insets.top, 16);
  // Offset overlay content above the Android bottom tab bar or device inset (not both)
  const [processing, setProcessing] = useState(false);
  const [following, setFollowing] = useState<boolean>(false);

  const todayKey = () => {
    const d = new Date();
    return `hearts:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const onHeartPress = async () => {
    const heartsKey = todayKey();
    if (processing) return;
    setProcessing(true);
    try {
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
      handleUpdateLike?.(1);
      Toast.show({ type: 'success', text1: `Heart used (${newUsed}/${MAX})` });
    } catch (e) {
      handleUpdateLike?.(1);
      Toast.show({ type: 'info', text1: 'Liked' });
      setProcessing(false);
      return;
    }
    setProcessing(false);
  };

  const buildShareUrl = () => `https://www.getsubapp.com/p/${post?.id ?? ''}`;
  const onSharePress = async () => {
    try {
      const url = buildShareUrl();
      await Share.share({ title: 'Check out this video', message: `Check out this video on Sub! ${url}`, url });
    } catch (e: any) {
      const msg = String(e?.message || e || '');
      if (!msg.toLowerCase().includes('user did not share')) {
        Toast.show({ type: 'error', text1: 'Unable to share right now' });
      }
    }
  };

  const onFollowPress = () => {
    const next = !following;
    setFollowing(next);
    Toast.show({ type: next ? 'success' : 'info', text1: next ? `Following ${user?.displayName || 'creator'}` : `Unfollowed ${user?.displayName || 'creator'}` });
  };

  // Drawer removed per request

  return (
    <View style={[styles.container]} pointerEvents="box-none">
      <View style={[styles.backRow, {}]} pointerEvents="box-none">
        <View style={styles.headerPill}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/sub.png')}
              style={{ width: 30, height: 14, marginRight: 1, opacity: 0.95 }}
              resizeMode="contain"
            />
            {showBackButton && (
              <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
                <Ionicons name="chevron-back" size={20} color="white" />
              </Pressable>
            )}
            {categoryLabel ? (
              <Link
                href={{ pathname: "/s/[slug]", params: { slug: categoryLabel } }}
                style={{ textDecorationLine: 'none' }}
              >
                <Text style={styles.linkText}>{categoryLabel}</Text>
              </Link>
            ) : null}
          </View>
          <Text style={styles.discoverText}>Discovered by thesixtyone</Text>
        </View>
      </View>
      <View style={[styles.bottomRow, {}]} pointerEvents="box-none">
        <View style={styles.left}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.name}>{user?.displayName}</Text>
            <Pressable onPress={onFollowPress} style={[styles.followPill, following && styles.followingPill]} hitSlop={6}>
              <Text style={[styles.followText, following && styles.followingText]}>{following ? 'Following' : 'Follow'}</Text>
            </Pressable>
          </View>
          <Text numberOfLines={2} style={styles.desc}>{post?.description}</Text>
        </View>
        <View style={styles.right}>
          <Pressable onPress={() => handleProfleTouch()} style={styles.iconWrap}>
            <ProfileImage photoURL={user?.photoURL} />
          </Pressable>
          <Pressable onPress={onHeartPress} style={[styles.iconWrap, { marginTop: 14 }]}>
            <Ionicons color="white" size={40} name={currentLikeState.state ? 'heart' : 'heart-outline'} />
            <Text style={styles.countText}>{currentLikeState.counter}</Text>
          </Pressable>
          <Pressable onPress={onSharePress} style={[styles.iconWrap]}>
            <Ionicons color="white" size={40} name={'share-social-outline'} />
          </Pressable>
          <Pressable style={styles.iconWrap} onPress={() => { if (onOpenComments) onOpenComments(post); }}>
            <Ionicons color="white" size={40} name={'chatbox-ellipses-sharp'} />
            <Text style={styles.countText}>{commentsCount}</Text>
          </Pressable>
        </View>
      </View>
      {/* Drawer removed */}
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    ...(Platform.OS === 'ios' ? { zIndex: 100 as const } : { elevation: 100 as const })
  },
  backRow: {
    position: 'absolute', left: 8, top: 8, flexDirection: 'row', alignItems: 'center',
    ...(Platform.OS === 'ios' ? { zIndex: 120 as const } : { elevation: 120 as const }),
  },
  headerPill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, ...(Platform.OS === 'ios' ? { zIndex: 121 as const } : { elevation: 121 as const }) },
  backButton: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 6, marginRight: 6, ...(Platform.OS === 'ios' ? { zIndex: 121 as const } : { elevation: 121 as const }) },
  catPill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, ...(Platform.OS === 'ios' ? { zIndex: 121 as const } : { elevation: 121 as const }) },
  catPillText: { color: 'white', fontWeight: '700', fontSize: 14 },
  linkText: { color: 'white', textDecorationLine: 'underline', fontWeight: '600' },
  discoverText: { color: 'white', fontSize: 12, marginTop: 4 },
  bottomRow: {
    position: 'absolute', left: 12, right: 12, bottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingLeft: 12, paddingRight: 10,
    ...(Platform.OS === 'ios' ? { zIndex: 110 as const } : { elevation: 110 as const }),
  },
  left: { width: 160 },
  right: { alignItems: 'center', ...(Platform.OS === 'ios' ? { zIndex: 115 as const } : { elevation: 115 as const }) },
  name: { color: 'white', fontWeight: '700', fontSize: 16 },
  desc: { color: 'white', marginTop: 6 },
  followPill: { marginLeft: 6, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  followingPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  followText: { color: '#000', fontWeight: '700', fontSize: 12 },
  followingText: { color: '#fff' },
  iconWrap: { padding: 8, alignItems: 'center', ...(Platform.OS === 'ios' ? { zIndex: 116 as const } : { elevation: 116 as const }) },
  countText: { marginTop: 6, color: 'white', textAlign: 'center' },
  // drawer styles removed
});
