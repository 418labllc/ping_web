import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

interface RoundBadgeProps {
  number: number;
  containerStyle?: StyleProp<ViewStyle>;
}

const RoundBadge: React.FC<RoundBadgeProps> = ({ number, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.text}>{number}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: 'red', // Change the background color as needed
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RoundBadge;
