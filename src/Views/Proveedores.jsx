import { useEffect, useState } from "react";
import {
    getProveedores,
    createProveedor,
    createCompra,
    deleteCompra,
    updateCompra,
    updateProveedor
} from "../Services/proveedorService";
import { getProducts } from "../services/productService";
import Select from "react-select";

export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    
    // Estados de control de interfaz
    const [esNuevoProveedor, setEsNuevoProveedor] = useState(false);
    const [esNuevoProducto, setEsNuevoProducto] = useState(false);
    const [editCompra, setEditCompra] = useState(null); // Para el Modal de Edición
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [form, setForm] = useState({
        nombre: "",
        empresa: "",
        telefono: "",
        direccion: "",
        producto: "",
        productoId: null,
        cantidad: "",
        precioCompra: ""
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        loadProveedores();
        loadProductos();
    }, []);

    const loadProveedores = async () => {
        try {
            const data = await getProveedores();
            setProveedores(data);
        } catch (err) { setError(err.message); }
    };

    const loadProductos = async () => {
        const data = await getProducts();
        setProductos(data);
    };

    // --- OPCIONES PARA SELECTS ---
    const optionsEmpresas = proveedores.map(p => ({
        value: p.id,
        label: p.empresa,
        data: p
    }));

    const optionsProductos = productos
        .filter(p => p.stock <= 5)
        .map(p => ({
            value: p.id,
            label: `${p.producto} (Stock: ${p.stock})`,
            nombreReal: p.producto
        }));

    // --- HANDLERS SELECCIÓN ---
    const handleSelectProveedorExistente = (selected) => {
        if (selected) {
            const p = selected.data;
            setForm({ ...form, empresa: p.empresa, nombre: p.nombre, telefono: p.telefono, direccion: p.direccion });
            setEsNuevoProveedor(false);
        }
    };

    const handleSelectProductoExistente = (selected) => {
        if (selected) {
            setForm({ ...form, producto: selected.nombreReal, productoId: selected.value });
            setEsNuevoProducto(false);
        }
    };

    const importeTotal = (cantidad, precio) =>
        cantidad && precio ? Number(cantidad) * Number(precio) : 0;

    const formatMoneda = (valor) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor || 0);

    // --- GUARDAR NUEVO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(""); setError("");

        try {
            let proveedorId;
            const existe = proveedores.find(p => p.empresa.toUpperCase() === form.empresa.toUpperCase());
            
            if (esNuevoProveedor && !existe) {
                proveedorId = await createProveedor({
                    nombre: form.nombre.toUpperCase(),
                    empresa: form.empresa.toUpperCase(),
                    telefono: form.telefono,
                    direccion: form.direccion.toUpperCase()
                });
            } else {
                proveedorId = existe ? existe.id : null;
                if (!proveedorId) throw new Error("Seleccione un proveedor o marque como nuevo (+)");
            }

            await createCompra(proveedorId, {
                producto: form.producto.toUpperCase(),
                productoId: form.productoId,
                estado: "pendiente",
                cantidad: Number(form.cantidad),
                precioCompra: Number(form.precioCompra),
                importeTotal: importeTotal(form.cantidad, form.precioCompra),
                fecha: new Date()
            });

            setMensaje("¡Compra registrada correctamente!");
            setForm({ nombre: "", empresa: "", telefono: "", direccion: "", producto: "", productoId: null, cantidad: "", precioCompra: "" });
            setEsNuevoProveedor(false); setEsNuevoProducto(false);
            loadProveedores();
        } catch (err) { setError(err.message); }
    };

    // --- ELIMINAR ---
    const handleDelete = async () => {
        try {
            await deleteCompra(deleteTarget.proveedorId, deleteTarget.compraId);
            setDeleteTarget(null);
            loadProveedores();
            setMensaje("Registro eliminado.");
        } catch (err) { setError(err.message); }
    };

    // --- EDITAR (ABRIR MODAL) ---
    const openEditModal = (proveedor, compra) => {
        setEditCompra({
            proveedorId: proveedor.id,
            compraId: compra.id,
            nombre: proveedor.nombre,
            empresa: proveedor.empresa,
            telefono: proveedor.telefono,
            direccion: proveedor.direccion,
            producto: compra.producto,
            cantidad: compra.cantidad,
            precioCompra: compra.precioCompra
        });
    };

    const handleSaveEdit = async () => {
        try {
            await updateProveedor(editCompra.proveedorId, {
                nombre: editCompra.nombre.toUpperCase(),
                empresa: editCompra.empresa.toUpperCase(),
                telefono: editCompra.telefono,
                direccion: editCompra.direccion.toUpperCase()
            });
            await updateCompra(editCompra.proveedorId, editCompra.compraId, {
                producto: editCompra.producto.toUpperCase(),
                cantidad: Number(editCompra.cantidad),
                precioCompra: Number(editCompra.precioCompra),
                importeTotal: Number(editCompra.cantidad) * Number(editCompra.precioCompra)
            });
            setEditCompra(null);
            setMensaje("Registro actualizado con éxito.");
            loadProveedores();
        } catch (err) { setError(err.message); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
            <h2 className="text-3xl font-black mb-8 text-gray-800">Panel de Compras a Proveedores</h2>

            {mensaje && <div className="mb-4 p-4 bg-green-600 text-white rounded-2xl shadow-lg">✅ {mensaje}</div>}
            {error && <div className="mb-4 p-4 bg-red-600 text-white rounded-2xl shadow-lg">⚠️ {error}</div>}

            {/* FORMULARIO DE REGISTRO */}
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 mb-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 font-mono uppercase tracking-tighter">1. Empresa</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {!esNuevoProveedor ? (
                                        <Select options={optionsEmpresas} onChange={handleSelectProveedorExistente} placeholder="Seleccionar empresa existente..." />
                                    ) : (
                                        <input type="text" placeholder="NOMBRE DE LA NUEVA EMPRESA" value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value.toUpperCase()})} className="w-full p-2 border-2 border-blue-500 rounded-lg outline-none" required />
                                    )}
                                </div>
                                <button type="button" onClick={() => { setEsNuevoProveedor(!esNuevoProveedor); setForm({...form, empresa: "", nombre: "", telefono: "", direccion: ""}); }} className={`px-5 py-2 rounded-lg font-bold ${esNuevoProveedor ? 'bg-red-500' : 'bg-blue-600'} text-white transition-transform active:scale-90`}>
                                    {esNuevoProveedor ? "✕" : "+"}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contacto</label>
                            <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})} className="w-full p-2 border rounded-lg" required readOnly={!esNuevoProveedor} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="p-2 border rounded-lg" readOnly={!esNuevoProveedor} />
                        <input type="text" placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value.toUpperCase()})} className="p-2 border rounded-lg" readOnly={!esNuevoProveedor} />
                    </div>

                    <hr />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 font-mono uppercase tracking-tighter">2. Producto</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {!esNuevoProducto ? (
                                        <Select options={optionsProductos} onChange={handleSelectProductoExistente} placeholder="Stock bajo..." />
                                    ) : (
                                        <input type="text" placeholder="NOMBRE NUEVO PRODUCTO" value={form.producto} onChange={e => setForm({...form, producto: e.target.value.toUpperCase(), productoId: null})} className="w-full p-2 border-2 border-orange-500 rounded-lg outline-none" required />
                                    )}
                                </div>
                                <button type="button" onClick={() => { setEsNuevoProducto(!esNuevoProducto); setForm({...form, producto: "", productoId: null}); }} className={`px-5 py-2 rounded-lg font-bold ${esNuevoProducto ? 'bg-red-500' : 'bg-orange-500'} text-white transition-transform active:scale-90`}>
                                    {esNuevoProducto ? "✕" : "+"}
                                </button>
                            </div>
                        </div>
                        <input type="number" placeholder="Cantidad" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="p-2 border rounded-lg" required />
                        <input type="number" placeholder="Precio Compra" value={form.precioCompra} onChange={e => setForm({...form, precioCompra: e.target.value})} className="p-2 border rounded-lg" required />
                    </div>

                    <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-inner">
                        <span className="text-xl font-bold">TOTAL: <span className="text-yellow-400">{formatMoneda(importeTotal(form.cantidad, form.precioCompra))}</span></span>
                        <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-black tracking-widest transition-all">REGISTRAR COMPRA</button>
                    </div>
                </form>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-600">Historial de Adquisiciones</h3>
                    <input type="text" placeholder="🔍 Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)} className="p-2 border rounded-xl w-64 outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                        <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Proveedor</th>
                            <th className="p-4 text-center">Cant.</th>
                            <th className="p-4 text-right">Unitario</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {proveedores.filter(p => JSON.stringify(p).toLowerCase().includes(filtro.toLowerCase())).map(p =>
                            p.compras?.map(c => (
                                <tr key={c.id} className="hover:bg-blue-50/40">
                                    <td className="p-4 font-bold">{c.producto}</td>
                                    <td className="p-4 text-sm text-gray-600"><b>{p.empresa}</b><br/>{p.nombre}</td>
                                    <td className="p-4 text-center font-mono">{c.cantidad}</td>
                                    <td className="p-4 text-right text-gray-500">{formatMoneda(c.precioCompra)}</td>
                                    <td className="p-4 text-right font-black text-blue-700">{formatMoneda(c.importeTotal)}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-4 text-xl">
                                            <button onClick={() => openEditModal(p, c)} title="Editar" className="hover:scale-125 transition-transform">✏️</button>
                                            <button onClick={() => setDeleteTarget({proveedorId: p.id, compraId: c.id})} title="Eliminar" className="hover:scale-125 transition-transform">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE EDICIÓN */}
            {editCompra && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-800">Editar Registro</h3>
                            <button onClick={() => setEditCompra(null)} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-400">EMPRESA</label>
                                <input type="text" value={editCompra.empresa} onChange={e => setEditCompra({...editCompra, empresa: e.target.value.toUpperCase()})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400">CONTACTO</label>
                                <input type="text" value={editCompra.nombre} onChange={e => setEditCompra({...editCompra, nombre: e.target.value.toUpperCase()})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400">TELÉFONO</label>
                                <input type="text" value={editCompra.telefono} onChange={e => setEditCompra({...editCompra, telefono: e.target.value})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-400">PRODUCTO</label>
                                <input type="text" value={editCompra.producto} onChange={e => setEditCompra({...editCompra, producto: e.target.value.toUpperCase()})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400">CANTIDAD</label>
                                <input type="number" value={editCompra.cantidad} onChange={e => setEditCompra({...editCompra, cantidad: e.target.value})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500 text-center" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400">PRECIO UNIT.</label>
                                <input type="number" value={editCompra.precioCompra} onChange={e => setEditCompra({...editCompra, precioCompra: e.target.value})} className="w-full p-2 border-b-2 outline-none focus:border-blue-500 text-right" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSaveEdit} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 shadow-lg transition-all">GUARDAR CAMBIOS</button>
                            <button onClick={() => setEditCompra(null)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE ELIMINACIÓN */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-6xl mb-4">🗑️</div>
                        <h3 className="text-xl font-bold mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 mb-6">Este registro de compra se eliminará permanentemente.</p>
                        <div className="flex gap-4">
                            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg">ELIMINAR</button>
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}