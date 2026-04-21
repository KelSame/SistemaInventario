import {
    collection,
    getDocs,
    setDoc,
    updateDoc,
    doc,
    query,
    where
} from "firebase/firestore";
import { db } from "../Firebase/Config";

const userRef = collection(db, "users");

// LISTAR
export const getUsers = async () => {
    const snapshot = await getDocs(userRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};


export const checkAdminExists = async () => {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};


// 🔎 VALIDAR DNI DUPLICADO
export const checkDniExists = async (dni) => {
    const q = query(userRef, where("dni", "==", dni));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

// CREAR
export const createUserDoc = async (
    uid,
    email,
    role,
    nombre,
    apellido,
    dni
) => {
    await setDoc(doc(db, "users", uid), {
        uid,
        email,
        role,
        nombre,
        apellido,
        dni,
        estado: "activo",
        fecha: new Date()
    });
};

// CAMBIAR ESTADO
export const toggleUserStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    await updateDoc(doc(db, "users", id), {
        estado: nuevoEstado
    });
};
