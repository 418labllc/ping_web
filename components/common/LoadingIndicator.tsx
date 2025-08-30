import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
  size?: number | 'small' | 'large';
  color?: string;
  style?: object;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 'small', color = '#4092c6', style }) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 20,
    minWidth: 20,
  },
});

export default LoadingIndicator;
