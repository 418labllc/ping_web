import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import PostSingle from '../../components/post/PostSingle';
import PostSingleOverlay from '../../components/post/PostSingleOverlayNew';

export type PlayIndexObject = { a: number; b: number };

const VIDEO_A = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const VIDEO_B = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

function makeFakeFeed(count = 20) {
    return Array.from({ length: count }).map((_, i) => ({
        id: `f${i}`,
        media: [i % 2 === 0 ? VIDEO_A : VIDEO_B],
        description: `Fake feed post ${i}`,
        likesCount: Math.floor(Math.random() * 100),
        commentsCount: Math.floor(Math.random() * 20),
        creator: `agent_${i % 10}`,
        uri: i % 2 === 0 ? VIDEO_A : VIDEO_B,
    }));
}

export default function TwoVideoFeed() {
    const [feedList, setfeedList] = useState<Array<any>>(() => makeFakeFeed(30));
    const [playA, setPlayA] = useState<boolean>(true);
    const [reload, setReload] = useState<number>(0);
    const [paused, setPaused] = useState<boolean>(false);
    const [playIndexObject, setplayIndexObject] = useState<PlayIndexObject>({ a: 0, b: 1 });

    useEffect(() => {
        // placeholder if you'd like to fetch real feed
        return () => { };
    }, [reload]);

    const tap = Gesture.Tap().onStart(() => {
        runOnJS(setPaused)(p => !p);
    });

    const offseta = useSharedValue(0);
    const offsetb = useSharedValue(0);
    const aZindex = useSharedValue(10);
    const bZindex = useSharedValue(0);

    const updateB = (number: number) => {
        setplayIndexObject((prevState) => ({ ...prevState, b: prevState.a + number }));
    };
    const updateA = (number: number) => {
        setplayIndexObject((prevState) => ({ ...prevState, a: prevState.b + number }));
    };
    const updateReload = (number: number) => setReload((prev) => prev + number);

    const pan = useMemo(
        () =>
            Gesture.Pan()
                .onStart(() => {
                    // noop
                })
                .onEnd((e) => {
                    const direction = Math.sign(e.translationY) === 1 ? 'Up' : 'Down';

                    if (Math.abs(e.translationY) > 400) {
                        runOnJS(setPaused)(false);
                        if (aZindex.value > 0) {
                            // A on top
                            if (direction === 'Up' && playIndexObject.a <= 0) {
                                return;
                            }
                            aZindex.value = 0;
                            bZindex.value = 10;
                            offseta.value = 0;
                            runOnJS(setPlayA)(false);
                        } else {
                            // B on top
                            if (direction === 'Up' && playIndexObject.b <= 0) {
                                return;
                            }

                            if (direction === 'Down' && playIndexObject.b >= feedList.length - 1) {
                                return;
                            }
                            aZindex.value = 10;
                            bZindex.value = 0;
                            offsetb.value = 0;
                            runOnJS(setPlayA)(true);
                        }
                    } else {
                        offseta.value = 0;
                        offsetb.value = 0;
                    }
                })
                .onChange((e) => {
                    ('worklet');
                    const direction = Math.sign(e.translationY) === 1 ? 'Up' : 'Down';

                    if (aZindex.value > 0) {
                        if (direction === 'Up' && playIndexObject.a > 0) {
                            runOnJS(updateB)(-1);
                        } else {
                            runOnJS(updateB)(1);
                        }

                        if ((playIndexObject.a > 0 && direction === 'Up') || (playIndexObject.a >= 0 && direction === 'Down' && playIndexObject.a < feedList.length - 1 && playIndexObject.a <= feedList.length - 1 && direction === 'Down')) {
                            offseta.value = e.changeY + offseta.value;
                        } else {
                            runOnJS(updateReload)(1);
                        }
                    } else {
                        if (direction === 'Up' && playIndexObject.b > 0) {
                            runOnJS(updateA)(-1);
                        } else {
                            runOnJS(updateA)(1);
                        }
                        if ((playIndexObject.b < feedList.length - 1 && direction === 'Down') || (playIndexObject.b <= feedList.length - 1 && direction === 'Up')) {
                            offsetb.value = e.changeY + offsetb.value;
                        } else {
                            runOnJS(updateReload)(1);
                        }
                    }
                }),
        [playIndexObject, aZindex, bZindex, feedList.length]
    );

    const animatedStylesa = useAnimatedStyle(() => ({ transform: [{ translateY: offseta.value }], zIndex: aZindex.value, height: '100%' }));
    const animatedStylesb = useAnimatedStyle(() => ({ transform: [{ translateY: offsetb.value }], zIndex: bZindex.value, height: '100%' }));

    return (
        <GestureDetector gesture={pan}>
            <GestureDetector gesture={tap}>
                <View style={{ flex: 1, backgroundColor: 'black', height: '100%' }}>
                    <Animated.View
                        style={[
                            { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
                            animatedStylesa,
                        ]}
                    >
                        <View style={{ flex: 1 }}>
                            <PostSingle
                                post={feedList[playIndexObject.a]}
                                paused={paused || !playA}
                                uri={feedList[playIndexObject.a]?.uri}
                                tap={tap as any}
                            />

                            {/* overlay tied to video A */}
                            {feedList[playIndexObject.a] && (
                                <PostSingleOverlay
                                    post={feedList[playIndexObject.a]}
                                    user={{ displayName: 'Demo User', photoURL: undefined }}
                                    currentLikeState={{ state: !!feedList[playIndexObject.a].liked, counter: feedList[playIndexObject.a].likesCount }}
                                    commentsCount={feedList[playIndexObject.a].commentsCount}
                                    handleUpdateLike={() => {
                                        const id = feedList[playIndexObject.a].id;
                                        setfeedList((prev) => prev.map((it) => (it.id === id ? { ...it, liked: !it.liked, likesCount: Math.max(0, it.likesCount + (it.liked ? -1 : 1)) } : it)));
                                    }}
                                    handleProfleTouch={() => { /* noop for demo */ }}
                                    onOpenComments={() => { /* noop for demo */ }}
                                />
                            )}
                        </View>
                    </Animated.View>
                    <Animated.View
                        style={[
                            { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
                            animatedStylesb,
                        ]}
                    >
                        <View style={{ flex: 1 }}>
                            <PostSingle
                                post={feedList[playIndexObject.b]}
                                paused={paused || playA}
                                uri={feedList[playIndexObject.b]?.uri}
                                tap={tap as any}
                            />

                            {/* overlay tied to video B */}
                            {feedList[playIndexObject.b] && (
                                <PostSingleOverlay
                                    post={feedList[playIndexObject.b]}
                                    user={{ displayName: 'Demo User', photoURL: undefined }}
                                    currentLikeState={{ state: !!feedList[playIndexObject.b].liked, counter: feedList[playIndexObject.b].likesCount }}
                                    commentsCount={feedList[playIndexObject.b].commentsCount}
                                    handleUpdateLike={() => {
                                        const id = feedList[playIndexObject.b].id;
                                        setfeedList((prev) => prev.map((it) => (it.id === id ? { ...it, liked: !it.liked, likesCount: Math.max(0, it.likesCount + (it.liked ? -1 : 1)) } : it)));
                                    }}
                                    handleProfleTouch={() => { /* noop for demo */ }}
                                    onOpenComments={() => { /* noop for demo */ }}
                                />
                            )}
                        </View>
                    </Animated.View>
                </View>
            </GestureDetector>
        </GestureDetector>
    );
}
