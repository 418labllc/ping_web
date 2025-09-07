import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCDTFEav2v-VO8BfxeGuFYVrPOmAUWQA4Y',
  authDomain: 'sub-backend-4adb0.firebaseapp.com',
  databaseURL: 'https://sub-backend-4adb0-default-rtdb.firebaseio.com',
  projectId: 'sub-backend-4adb0',
  storageBucket: 'sub-backend-4adb0.appspot.com',
  messagingSenderId: '881367369944',
  appId: '1:881367369944:web:5e62df59ba1303b7af6fad',
  measurementId: 'G-RK2FP3SJHK',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// TODO allow phone number signin etc
