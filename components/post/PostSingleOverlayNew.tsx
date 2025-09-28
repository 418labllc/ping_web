import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
// This overlay intentionally contains no hooks; actions like opening comments
// should be passed in via callback props from the consumer.
import ProfileImage from '../common/ProfileImage';
import type { Post } from '../../types/post';

export type PostSingleOverlayPropsNew = {
    post: Post;
    user: any;
    handleUpdateLike: () => void;
    handleProfleTouch: () => void;
    // currentLikeState: { state: boolean; counter: number }
    currentLikeState: { state: boolean; counter: number };
    commentsCount: number;
    onOpenComments?: (post: Post) => void;
};

const PostSingleOverlayNew = ({
    user,
    post,
    handleUpdateLike,
    currentLikeState,
    commentsCount,
    handleProfleTouch,
    onOpenComments,
}: PostSingleOverlayPropsNew) => {
    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.left}>
                <Text style={styles.name}>{user?.displayName}</Text>
                <Text style={styles.desc}>{post?.description}</Text>
            </View>
            <View style={styles.right}>
                <Pressable onPress={() => handleProfleTouch()} style={styles.iconWrap}>
                    <ProfileImage photoURL={user?.photoURL} />
                </Pressable>
                <Pressable onPress={() => handleUpdateLike()} style={[styles.iconWrap, { marginTop: 14 }]}>
                    <Ionicons
                        color="white"
                        size={40}
                        name={currentLikeState.state ? 'heart' : 'heart-outline'}
                    />
                    <Text style={styles.countText}>{currentLikeState.counter}</Text>
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
    );
};

const styles = StyleSheet.create({
    container: {
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
    left: { width: 160 },
    right: { alignItems: 'center' },
    name: { color: 'white', fontWeight: '700', fontSize: 16 },
    desc: { color: 'white', marginTop: 6 },
    iconWrap: { padding: 8, alignItems: 'center' },
    countText: { marginTop: 6, color: 'white', textAlign: 'center' },
});

export default PostSingleOverlayNew;
