// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq_uQtKbAHhD2yFJkTLrgpvJhxROG5QLI",
  authDomain: "ping-875ca.firebaseapp.com",
  projectId: "ping-875ca",
  storageBucket: "ping-875ca.firebasestorage.app",
  messagingSenderId: "504741663298",
  appId: "1:504741663298:web:5251a8aec0113d60d9d3db",
  measurementId: "G-RLH3Y9W3RK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize and export auth for web
const auth = getAuth(app);
export { auth };
