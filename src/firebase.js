// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "rootlink-db476.firebaseapp.com",
    projectId: "rootlink-db476",
    storageBucket: "rootlink-db476.firebasestorage.app",
    messagingSenderId: "345561029644",
    appId: "1:345561029644:web:d5f4463eb96f33d0a46229",
    measurementId: "G-7QMGJ199LE"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);