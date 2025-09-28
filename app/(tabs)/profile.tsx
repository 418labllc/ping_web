import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEARTS_PER_DAY = 7;

function todayKey() {
  const d = new Date();
  return `hearts:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function ProfileScreen() {
  const [used, setUsed] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const key = todayKey();
        const v = await AsyncStorage.getItem(key);
        setUsed(v ? Number(v) : 0);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const heartsLeft = Math.max(0, HEARTS_PER_DAY - used);

  const useHeart = async () => {
    if (heartsLeft <= 0) {
      Alert.alert('No hearts left', 'You have used all 7 hearts for today.');
      return;
    }
    const newUsed = used + 1;
    const key = todayKey();
    await AsyncStorage.setItem(key, String(newUsed));
    setUsed(newUsed);
  };

  const resetToday = async () => {
    const key = todayKey();
    await AsyncStorage.removeItem(key);
    setUsed(0);
  };

  const logout = () => {
    Alert.alert('Logout', 'Simulated logout — clear local data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); setUsed(0); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Daily Hearts</Text>
        <Text style={styles.value}>{heartsLeft} / {HEARTS_PER_DAY}</Text>
        <Text style={styles.small}>Used today: {used}</Text>
        <TouchableOpacity style={styles.heartButton} onPress={useHeart}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Use Heart ❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetToday}>
          <Text style={{ color: '#333' }}>Reset today (dev)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={{ color: 'white' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 24, marginTop: 12, marginBottom: 12 },
  card: { width: '100%', backgroundColor: '#f6f6f6', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 32, fontWeight: '700', marginTop: 6 },
  small: { fontSize: 12, color: '#888', marginTop: 4 },
  heartButton: { marginTop: 12, backgroundColor: '#ff3366', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  resetButton: { marginTop: 8, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  logoutButton: { marginTop: 8, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
