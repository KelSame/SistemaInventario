import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = cargando

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: docSnap.data().role,
            estado: docSnap.data().estado,
            nombre: docSnap.data().nombre,
            apellido: docSnap.data().apellido
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const userRole = user?.role;
  const uid = user?.uid;

  return (
    <AuthContext.Provider value={{ user, setUser, userRole, uid }}>
      {user === undefined ? (
        <div className="p-8 text-center">Cargando sistema...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
