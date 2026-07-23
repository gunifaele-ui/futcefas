import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC8IP3PD0spnQgIingEN3feDhWrWGkW0kA',
  authDomain: 'futcefas.firebaseapp.com',
  projectId: 'futcefas',
  storageBucket: 'futcefas.firebasestorage.app',
  messagingSenderId: '735495193650',
  appId: '1:735495193650:web:9328c92803c96db9f2682b',
  measurementId: 'G-Y8EGFE6M82',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
