import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Post } from '../../types/post';

export type PostSingleOverlayProps = {
  post?: Post;
  user?: { displayName?: string; photoURL?: string } | null;
  onProfilePress?: () => void;
  onLikePress?: () => void;
  likesCount?: number;
  commentsCount?: number;
};

export default function PostSingleOverlay({
  post,
  user,
  onProfilePress,
  onLikePress,
  likesCount = 0,
  commentsCount = 0,
}: PostSingleOverlayProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { bottom: (insets.bottom || 0) + 20 }]} pointerEvents="box-none">
      <View style={styles.left}>
        {/* <Text style={styles.name}>{user?.displayName ?? 'Unknown'}</Text> */}
        <Text style={styles.desc}>{post?.description ?? ''}</Text>
      </View>
      <View style={styles.right}>
        <Pressable onPress={onProfilePress} style={styles.action}>
          <Text style={styles.actionText}>Profile</Text>
        </Pressable>
        <Pressable onPress={onLikePress} style={styles.action}>
          <Text style={styles.actionText}>❤️ {likesCount}</Text>
        </Pressable>
        <View style={styles.action}>
          <Text style={styles.actionText}>💬 {commentsCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  left: { flex: 1 },
  right: { width: 120, alignItems: 'center' },
  name: { color: 'white', fontWeight: '700', fontSize: 16 },
  desc: { color: 'white', marginTop: 6 },
  action: { padding: 8, alignItems: 'center' },
  actionText: { color: 'white' },
});
