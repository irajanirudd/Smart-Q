import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0q5R4Q6nWyt0Nu7JvlbsH5zZT_Bx1kqA",
  authDomain: "smartq2-4a715.firebaseapp.com",
  projectId: "smartq2-4a715",
  storageBucket: "smartq2-4a715.firebasestorage.app",
  messagingSenderId: "720312692358",
  appId: "1:720312692358:web:1b9e567a0fe9edaee96b07"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);