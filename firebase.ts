// src/firebase.ts
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// PASTE YOUR CONFIG FROM FIREBASE CONsole HERE
const firebaseConfig = {

    apiKey: "AIzaSyA_qLCMZsN15swqo_RUyYD32P8Opr38Cw4",

    authDomain: "ecms-63af2.firebaseapp.com",

    projectId: "ecms-63af2",

    storageBucket: "ecms-63af2.firebasestorage.app",

    messagingSenderId: "650310623049",

    appId: "1:650310623049:web:57c0bf8bf5786371b0c498",

    measurementId: "G-T1ZX8XYQ5Z"

};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();