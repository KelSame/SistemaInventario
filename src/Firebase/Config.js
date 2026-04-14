import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyDg_Xz6BqOm3Gh86BBvOpInJG9YNPjaHfg",
    authDomain: "inventario-ocampo.firebaseapp.com",
    projectId: "inventario-ocampo",
    storageBucket: "inventario-ocampo.firebasestorage.app",
    messagingSenderId: "336940659178",
    appId: "1:336940659178:web:156f492313f4910a350293"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);