
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfkomcCSxPnwaz1zBfZO0JAyRhIhjDrcM",
  authDomain: "basics-2b26d.firebaseapp.com",
  projectId: "basics-2b26d",
  storageBucket: "basics-2b26d.appspot.com",
  messagingSenderId: "581303995476",
  appId: "1:581303995476:web:3ecfe9011e4f5c1a2871c1",
  measurementId: "G-DQ2YVNPN9Z"
};


export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);

const analytics = getAnalytics(app);