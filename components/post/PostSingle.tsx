import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Platform, Pressable } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { ResizeMode, Video } from 'expo-av';
import type { Post } from '../../types/post';

type Props = {
    paused: boolean;
    post?: Post & { uri?: string } | null;
    uri?: string;
    tap?: any;
    onTogglePause?: () => void;
};

export default function PostSingle({ paused, post, uri, tap, onTogglePause }: Props) {
    const source = uri || post?.media?.[0];
    const videoRef = useRef<any | null>(null);

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

    const [positionMs, setPositionMs] = useState<number>(0);
    const [durationMs, setDurationMs] = useState<number>(0);

    const handlePlaybackStatus = (status: any) => {
        // update position and duration when available
        if (!status) return;
        // status.positionMillis and status.durationMillis may be present
        if (typeof status.positionMillis === 'number') setPositionMs(status.positionMillis);
        if (typeof status.durationMillis === 'number') setDurationMs(status.durationMillis);
    };

    const formatMs = (ms: number) => {
        if (!ms || ms <= 0) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <GestureDetector gesture={tap as any}>
                <View style={{ flex: 1 }}>
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
                    {/* transparent pressable overlay as a fallback to toggle pause/play */}
                    <Pressable onPress={() => onTogglePause?.()} style={StyleSheet.absoluteFill} />
                </View>
            </GestureDetector>
            {/* status pill: show elapsed / total */}
            <View style={styles.statusPillContainer} pointerEvents="none">
                <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{`${formatMs(positionMs)} / ${formatMs(durationMs)}`}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    media: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    statusPillContainer: { position: 'absolute', right: 12, top: 12, zIndex: 200 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)' },
    statusPlaying: { backgroundColor: 'rgba(0,0,0,0.4)' },
    statusPaused: { backgroundColor: 'rgba(0,0,0,0.7)' },
    statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
    centerOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 150 },
    centerBox: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    centerText: { color: 'white', fontSize: 22, fontWeight: '700' },
});
