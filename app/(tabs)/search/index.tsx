import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const VIDEO_A = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const VIDEO_B = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

function generateItems(startIndex: number, count: number) {
  const items: Array<any> = [];
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const uri = idx % 2 === 0 ? VIDEO_A : VIDEO_B;
    items.push({
      id: `s${idx}`,
      title: `Search result ${idx}`,
      description: `Search result #${idx}`,
          uri,
          category: `s/${['RealEstate', 'Home', 'Auto', 'Food'][idx % 4]}`,
          likesCount: Math.floor(Math.random() * 100),
          commentsCount: Math.floor(Math.random() * 20),
          liked: false,
    });
  }
  return items;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const all = useMemo(() => generateItems(1, 80), []);

  const results = all.filter((it) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(it.title || '').toLowerCase().includes(q) || String(it.description || '').toLowerCase().includes(q) || String(it.category || '').toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search posts, categories"
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } } as any)}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.category}</Text>
          </TouchableOpacity>
        )}
        style={{ width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b', paddingTop: 40, alignItems: 'center' },
  title: { color: 'white', fontSize: 22, marginBottom: 12 },
  input: { width: '90%', backgroundColor: '#111', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#111', width: '100%' },
  rowTitle: { color: 'white', fontSize: 16 },
  rowSubtitle: { color: '#aaa', fontSize: 12 },
});
