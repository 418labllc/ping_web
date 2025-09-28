import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import type { Post } from '../../types/post';

type Props = {
    paused: boolean;
    post: Post & { uri?: string };
    uri?: string;
    tap?: any;
};

export default function SharedVideoPlayer({ paused, post, uri }: Props) {
    const source = uri || (post && post.media && post.media[0]);
    const videoRef = useRef<any>(null);

    useEffect(() => {
        const ref = videoRef.current;
        if (!ref) {
            return;
        }

        if (paused) {
            ref.pauseAsync().catch(() => undefined);
        } else {
            ref.playAsync().catch(() => undefined);
        }
    }, [paused]);

    const handlePlaybackStatus = (status: any) => {
        // Log playback status for debugging
        // eslint-disable-next-line no-console
        console.log('shared playback status', { id: post?.id, paused, status });
    };

    if (!source) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={{ color: 'white' }}>No media</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={{ uri: typeof source === 'string' ? source : String(source) }}
                style={styles.media}
                resizeMode={ResizeMode.COVER}
                shouldPlay={!paused}
                isLooping
                isMuted
                useNativeControls={Platform.OS === 'web'}
                onPlaybackStatusUpdate={handlePlaybackStatus}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    media: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
