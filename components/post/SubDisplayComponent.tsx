import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Sub } from '../../types/post';

export default function SubDisplayComponent({ sub }: { sub?: Sub }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{sub?.title ?? 'Subtitle'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 6 },
    text: { color: 'white' },
});
