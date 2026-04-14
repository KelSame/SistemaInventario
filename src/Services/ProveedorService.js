import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "firebase/firestore";

const proveedoresRef = collection(db, "proveedores");

// Obtener todos los proveedores con sus compras
export const getProveedores = async () => {
    try {
        const data = await getDocs(proveedoresRef);
        const proveedores = await Promise.all(
            data.docs.map(async (docSnap) => {
                const comprasSnap = await getDocs(collection(docSnap.ref, "compras"));
                const compras = comprasSnap.docs.map(c => {
                    const dataCompra = c.data();
                    return {
                        id: c.id,
                        producto: dataCompra.producto || "",        // <-- nombre del producto
                        cantidad: dataCompra.cantidad || 0,
                        precioCompra: dataCompra.precioCompra || 0,
                        importeTotal: dataCompra.importeTotal || 0,
                        estado: dataCompra.estado || "pendiente",
                        fecha: dataCompra.fecha && dataCompra.fecha.toDate
                            ? dataCompra.fecha.toDate()
                            : new Date(dataCompra.fecha)
                    };
                });
                return {
                    id: docSnap.id,
                    ...docSnap.data(),  // nombre, empresa, telefono, direccion
                    compras
                };
            })
        );
        return proveedores;
    } catch (error) {
        throw new Error("Error al obtener proveedores: " + error.message);
    }
};

// Crear un nuevo proveedor
export const createProveedor = async (proveedor) => {
    try {
        const docRef = await addDoc(proveedoresRef, proveedor);
        return docRef.id;
    } catch (error) {
        throw new Error("Error al crear proveedor: " + error.message);
    }
};

// Actualizar datos del proveedor
export const updateProveedor = async (proveedorId, data) => {
    try {
        const proveedorRef = doc(db, "proveedores", proveedorId);
        await updateDoc(proveedorRef, data);
    } catch (error) {
        throw new Error("Error al actualizar proveedor: " + error.message);
    }
};

// Eliminar proveedor
export const deleteProveedor = async (id) => {
    try {
        const docRef = doc(db, "proveedores", id);
        await deleteDoc(docRef);
    } catch (error) {
        throw new Error("Error al eliminar proveedor: " + error.message);
    }
};

// Crear una compra dentro de un proveedor
export const createCompra = async (proveedorId, compra) => {
    try {
        const comprasRef = collection(db, "proveedores", proveedorId, "compras");
        await addDoc(comprasRef, {
            producto: compra.producto,           // <-- nombre del producto
            cantidad: Number(compra.cantidad),
            precioCompra: Number(compra.precioCompra),
            importeTotal: Number(compra.cantidad * compra.precioCompra),
            fecha: new Date(),
            estado: "pendiente"
        });
    } catch (error) {
        throw new Error("Error al crear compra: " + error.message);
    }
};

// Actualizar una compra
export const updateCompra = async (proveedorId, compraId, data) => {
    try {
        const compraRef = doc(db, "proveedores", proveedorId, "compras", compraId);
        await updateDoc(compraRef, data);
    } catch (error) {
        throw new Error("Error al actualizar compra: " + error.message);
    }
};

// Eliminar una compra
export const deleteCompra = async (proveedorId, compraId) => {
    try {
        const compraRef = doc(db, "proveedores", proveedorId, "compras", compraId);
        await deleteDoc(compraRef);
    } catch (error) {
        throw new Error("Error al eliminar compra: " + error.message);
    }
};

//Cambiar estado de compra a procesada
export const marcarCompraProcesada = async (proveedorId, compraId) => {
    const compraRef = doc(db, "proveedores", proveedorId, "compras", compraId);

    await updateDoc(compraRef, {
        estado: "procesada"
    });
};