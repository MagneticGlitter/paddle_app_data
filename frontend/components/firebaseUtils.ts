import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebaseConfig.json';

// Your web app's Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);


export { storage };
