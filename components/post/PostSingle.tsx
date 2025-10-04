import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Video from 'react-native-video';
import type { Post } from '../../types/post';

type Props = {
    paused: boolean;
    post?: Post & { uri?: string } | null;
    uri?: string;
    tap?: any;
    onTogglePause?: () => void;
};
function PostSingleComponent({ paused, post, uri, onTogglePause }: Props) {
    const source = uri || post?.media?.[0];
    // Stable memoized source object so react-native-video doesn't treat identical URI as a new source on re-render.
    const videoSource = useMemo(() => (source ? { uri: typeof source === 'string' ? source : String(source) } : undefined), [source]);
    const videoRef = useRef<any>(null);

    // react-native-video doesn't expose imperative pauseAsync/playAsync in the same way;
    // we control via the `paused` prop directly, so no effect needed.

    const [positionMs, setPositionMs] = useState<number>(0);
    const [durationMs, setDurationMs] = useState<number>(0);
    const lastIdRef = useRef<string | undefined>(undefined);
    const lastPosRef = useRef<number>(0);
    const restorePendingRef = useRef<boolean>(false);
    const [loaded, setLoaded] = useState(false);

    const handleProgress = (progress: { currentTime: number; playableDuration: number; seekableDuration: number }) => {
        const curMs = progress.currentTime * 1000;
        setPositionMs(curMs);
        lastPosRef.current = curMs; // cache latest position for potential restoration
        if (progress.seekableDuration) setDurationMs(progress.seekableDuration * 1000);
    };
    const handleLoadStart = () => {
        const sameId = post?.id && post.id === lastIdRef.current;
        restorePendingRef.current = !!sameId;
        if (!sameId) setLoaded(false);
    };
    const handleLoad = (meta: { duration: number }) => {
        if (meta?.duration) setDurationMs(meta.duration * 1000);
        if (restorePendingRef.current && videoRef.current && lastPosRef.current > 500) {
            const target = lastPosRef.current / 1000;
            setTimeout(() => {
                try { videoRef.current?.seek(target); } catch { }
                restorePendingRef.current = false;
                setLoaded(true);
            }, 40);
        } else {
            setLoaded(true);
        }
    };

    // Track current id
    useEffect(() => {
        if (post?.id) {
            lastIdRef.current = post.id;
        }
    }, [post?.id]);

    const formatMs = (ms: number) => {
        if (!ms || ms <= 0) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                {videoSource && (
                    <Video
                        ref={videoRef}
                        source={videoSource}
                        style={styles.media}
                        resizeMode="cover"
                        repeat
                        muted
                        paused={paused}
                        onProgress={handleProgress}
                        onLoadStart={handleLoadStart}
                        onLoad={handleLoad}
                        ignoreSilentSwitch="obey"
                    />
                )}
                {/* Removed tap-to-pause so overlay taps don't inadvertently pause */}
            </View>
            <View style={styles.statusPillContainer} pointerEvents="none">
                <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{`${formatMs(positionMs)} / ${formatMs(durationMs)}`}</Text>
                </View>
            </View>
        </View>
    );
}

// Custom comparator: skip re-render if identity of video (id/source) & paused and handlers unchanged.
const PostSingle = React.memo(
    PostSingleComponent,
    (prev, next) => {
        if ((prev.post?.id || prev.uri) !== (next.post?.id || next.uri)) return false;
        const prevSrc = prev.uri || prev.post?.media?.[0];
        const nextSrc = next.uri || next.post?.media?.[0];
        if (prevSrc !== nextSrc) return false;
        if (prev.paused !== next.paused) return false;
        if (prev.onTogglePause !== next.onTogglePause) return false;
        return true;
    }
);

export default PostSingle;

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
    mediaWrapper: { flex: 1 }
});
