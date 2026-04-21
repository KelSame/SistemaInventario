import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../Firebase/Config";
import { doc, getDoc } from "firebase/firestore";

export const loginUser = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);

    const uid = res.user.uid;

    // Buscar usuario en Firestore
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("user-not-registered");
    }

    const data = userSnap.data();

    // Verificar estado
    if (data.estado !== "activo") {
        throw new Error("user-disabled");
    }

    return {
        uid,
        email: res.user.email,
        role: data.role,
        estado: data.estado
    };
};
