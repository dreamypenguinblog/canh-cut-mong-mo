import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBantBKN7oKfM_W96cUug7yEHyYOizrBtU',
  authDomain: 'canhcutmongmo-a0e23.firebaseapp.com',
  projectId: 'canhcutmongmo-a0e23',
  storageBucket: 'canhcutmongmo-a0e23.firebasestorage.app',
  messagingSenderId: '1041334225497',
  appId: '1:1041334225497:web:ca188036ca346067c03f48',
  measurementId: 'G-CH7C302C5T',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
