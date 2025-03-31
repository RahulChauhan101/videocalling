const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Your web app's Firebase configuration
// TODO: Replace with your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyABT0iguVK1q8d1w0xhhGhMlcvaF_lcCj0",
  authDomain: "videocall-new-e83b7.firebaseapp.com",
  projectId: "videocall-new-e83b7",
  storageBucket: "videocall-new-e83b7.firebasestorage.app",
  messagingSenderId: "1017414295139",
  appId: "1:1017414295139:web:90bc10d9b52dbc14372256",
  measurementId: "G-CNGD026Y7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
