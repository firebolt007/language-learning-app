// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOHQJDtysiof3g3cJCW5LZNocyMSGcKao",
  authDomain: "subtitles-app-82ae0.firebaseapp.com",
  projectId: "subtitles-app-82ae0",
  storageBucket: "subtitles-app-82ae0.firebasestorage.app",
  messagingSenderId: "854227854911",
  appId: "1:854227854911:web:580fca8196ea6f6ed1fa8a",
  measurementId: "G-B3E34LHKXN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app,'db-dic');
const analytics = getAnalytics(app);