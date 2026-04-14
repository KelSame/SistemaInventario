import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,   
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  increment 
} from "firebase/firestore";

const ventasRef = collection(db, "ventas");


// Generar número de venta automático
export const generarNumeroVenta = async () => {
  const snapshot = await getDocs(ventasRef);
  const numero = snapshot.size + 1;
  return `V-${numero.toString().padStart(4, "0")}`;
};


// Crear venta
export const createVenta = async (ventaData) => {
  try {
    const numeroVenta = await generarNumeroVenta();

    await addDoc(ventasRef, {
      numeroVenta,
      fecha: new Date(),

      empresa: {
        razonSocial: "AUTO PARTES OCAMPO S.R.L.",
        ruc: "20609832101",
        direccion: "Av. Iquitos Nro. 110 Int. 123, Lima"
      },

      ...ventaData
    });

    // Descontar stock automáticamente
    for (const item of ventaData.detalles) {
      const productoDoc = doc(db, "productos", item.productoId);

      await updateDoc(productoDoc, {
        stock: increment(-item.cantidad)
      });
    }

  } catch (error) {
    throw new Error("Error al registrar venta: " + error.message);
  }
};


// Obtener ventas ordenadas por fecha
export const getVentas = async () => {
  try {
    const q = query(ventasRef, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    throw new Error("Error al obtener ventas: " + error.message);
  }
};


export const deleteVenta = async (id) => {
  try {
    const ventaDoc = doc(db, "ventas", id);
    const snapshot = await getDoc(ventaDoc);
    const venta = snapshot.data();

    // 🔹 Devolver stock
    for (const item of venta.detalles) {
      const productoRef = doc(db, "productos", item.productoId);

      await updateDoc(productoRef, {
        stock: increment(item.cantidad)
      });
    }

    await deleteDoc(ventaDoc);

  } catch (error) {

     // 🔥 CONTROLAR PERMISOS
    if (error.code === "permission-denied") {
      throw new Error("Solo el administrador puede eliminar ventas.");
    }

    throw new Error("Error al eliminar venta: " + error.message);
  }
};  

// Editar venta (cliente, total, etc.)
export const updateVenta = async (id, data) => {
  try {
    await updateDoc(doc(db, "ventas", id), data);
  } catch (error) {
    throw new Error("Error al actualizar venta: " + error.message);
  }
};

export const getVentasByUser = async (uid) => {
  const q = query(
    collection(db, "ventas"),
    where("usuario.uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
