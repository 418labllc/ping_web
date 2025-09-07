// firebaseConfig.ts
import { Platform } from 'react-native';

let firebaseConfig;

if (Platform.OS === 'web') {
  firebaseConfig = require('./firebaseConfig.web');
} else {
  firebaseConfig = require('./firebaseConfig');
}

export const auth = firebaseConfig.auth;
