import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  increment
} from "firebase/firestore";

const productosRef = collection(db, "productos");


// ============================
// CREAR O ACTUALIZAR PRODUCTO
// ============================
export const createProduct = async (product) => {
  try {

    // 🔎 Buscar si ya existe ese producto con ese proveedor
    const q = query(
      productosRef,
      where("producto", "==", product.producto),
      where("proveedorId", "==", product.proveedorId)
    );

    const snapshot = await getDocs(q);

    // 🔥 SI YA EXISTE → SUMAR STOCK
    if (!snapshot.empty) {

      const docExistente = snapshot.docs[0];
      const productoRef = doc(db, "productos", docExistente.id);

      await updateDoc(productoRef, {
        stock: increment(Number(product.stock)),
        precioCompra: product.precioCompra,
        precioVenta: product.precioVenta,
        fechaIngreso: new Date()
      });

      return;
    }

    // 🔥 SI NO EXISTE → CREAR NUEVO
    await addDoc(productosRef, {
      ...product,
      fechaIngreso: new Date()
    });

  } catch (error) {
    throw new Error(error.message);
  }
};


// ============================
// OBTENER PRODUCTOS
// ============================
export const getProducts = async () => {
  const data = await getDocs(productosRef);
  return data.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


// ============================
export const updateProduct = async (id, product) => {
  const productDoc = doc(db, "productos", id);
  await updateDoc(productDoc, product);
};


// ============================
export const deleteProduct = async (id) => {
  const productDoc = doc(db, "productos", id);
  await deleteDoc(productDoc);
};