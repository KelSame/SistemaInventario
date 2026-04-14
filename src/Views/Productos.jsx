import { useEffect, useState } from "react";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from "../services/productService";
import { 
    getProveedores, 
    marcarCompraProcesada, 
    updateCompra 
} from "../Services/ProveedorService";
import Select from "react-select";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");

  const [form, setForm] = useState({
    proveedor: "",
    proveedorId: "",
    producto: "",
    compraId: "",
    precioCompra: "",
    precioVenta: "",
    stock: "",
    productoId: null
  });

  const [editingId, setEditingId] = useState(null);
  const [productosProveedor, setProductosProveedor] = useState([]);

  useEffect(() => {
    loadProducts();
    loadProveedores();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProductos(data);
    } catch (err) { setError(err.message); }
  };

  const loadProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (err) { setError(err.message); }
  };

  const formatMoneda = (v) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

  const gananciaUnitario = () => {
    const v = Number(form.precioVenta) || 0;
    const c = Number(form.precioCompra) || 0;
    return v - c;
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ proveedor: "", proveedorId: "", producto: "", compraId: "", precioCompra: "", precioVenta: "", stock: "", productoId: null });
    setProductosProveedor([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(""); setError("");

    if (!editingId && (!form.proveedorId || !form.compraId)) {
      setError("Seleccione proveedor y compra para un nuevo ingreso.");
      return;
    }

    try {
      // --- LÓGICA DE UNIFICACIÓN DE STOCK (SOLUCIÓN) ---
      // Buscamos si el producto ya existe en el inventario por su nombre
      const productoExistente = productos.find(
        p => p.producto.trim().toUpperCase() === form.producto.trim().toUpperCase()
      );

      const nuevoStock = Number(form.stock);
      const precioC = Number(form.precioCompra);
      const nuevoImporteTotal = nuevoStock * precioC

      const dataLimpia = {
        proveedorId: form.proveedorId || "",
        proveedor: form.proveedor || "",
        producto: form.producto.toUpperCase(),
        productoId: form.productoId || null,
        compraId: form.compraId || "",
        precioCompra: precioC,
        precioVenta: Number(form.precioVenta) || 0,
        stock: productoExistente && !editingId
              ? Number(productoExistente.stock) + nuevoStock 
              : nuevoStock
      };

      if (editingId) {
        // MODO EDICIÓN
        await updateProduct(editingId, dataLimpia);
        setMensaje("Producto actualizado correctamente.");
      } else {
        // MODO REGISTRO NUEVO
        
        // 1. Actualizar la compra en el módulo del proveedor
        await updateCompra(form.proveedorId, form.compraId, { 
          cantidad: nuevoStock,
          producto: form.producto.toUpperCase(),
          importeTotal: nuevoImporteTotal 
        });

        // 2. Lógica de guardado inteligente en inventario
        if (productoExistente) {
          // Si el producto existe, usamos updateProduct para sumar el stock en el registro actual
          await updateProduct(productoExistente.id, dataLimpia);
          setMensaje(`Stock unificado: Se agregaron unidades a ${form.producto}.`);
        } else {
          // Si es un producto que no estaba en inventario, se crea por primera vez
          await createProduct(dataLimpia);
          setMensaje("Ingreso exitoso: Inventario y Proveedor actualizados.");
        }

        // 3. Pasar la compra a procesado
        await marcarCompraProcesada(form.proveedorId, form.compraId);
      }

      handleCancelEdit();
      await loadProducts();
      await loadProveedores();
    } catch (err) { 
        console.error(err);
        setError("Error al procesar: " + err.message); 
    }
  };

  const handleDelete = async (p) => {
    const confirmar = window.confirm(`¿Eliminar "${p.producto}"? El registro en proveedores volverá a estar PENDIENTE.`);
    if (!confirmar) return;

    try {
      if (p.proveedorId && p.compraId) {
        await updateCompra(p.proveedorId, p.compraId, { estado: "pendiente" });
      }
      
      await deleteProduct(p.id);
      setMensaje("Producto eliminado del inventario y compra revertida a pendiente.");
      await loadProducts();
      await loadProveedores();
    } catch (err) { setError("Error al eliminar: " + err.message); }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      compraId: p.compraId || "existente"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen text-gray-800 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Registro de productos</h2>
          <p className="text-gray-500 font-medium">Automatización de ingresos y control de precios.</p>
        </div>
      </div>

      {mensaje && <div className="mb-6 p-4 bg-green-600 text-white rounded-2xl shadow-lg font-bold animate-pulse">✅ {mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl shadow-lg font-bold">⚠️ {error}</div>}

      {/* FORMULARIO AUTOMATIZADO */}
      <div className={`bg-white p-8 rounded-[2.5rem] shadow-xl border-2 transition-all ${editingId ? 'border-yellow-400 shadow-yellow-50' : 'border-transparent'} mb-10`}>
        <h3 className="text-xs font-black uppercase text-gray-400 mb-6 flex items-center justify-between tracking-widest">
            <span>{editingId ? "✏️ Editando Producto" : "📦 Registro de Mercadería"}</span>
            {editingId && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px]">Edición habilitada</span>}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className={`md:col-span-2 ${editingId ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-tighter">1. Seleccionar Proveedor</label>
            <Select
              placeholder="Buscar proveedor..."
              options={proveedores.map(p => ({ value: p.id, label: p.empresa }))}
              onChange={(sel) => {
                const prov = proveedores.find(p => String(p.id) === String(sel?.value));
                setForm({ ...form, proveedorId: sel?.value, proveedor: prov?.empresa || "", compraId: "" });
                setProductosProveedor(prov?.compras?.filter(c => c.estado?.trim().toLowerCase() === "pendiente") || []);
              }}
              value={proveedores.map(p => ({ value: p.id, label: p.empresa })).find(o => o.value === form.proveedorId) || null}
            />
          </div>

          <div className={`md:col-span-2 ${editingId ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-tighter">2. Producto en Factura</label>
            <Select
              placeholder="Pendientes de procesar..."
              options={productosProveedor.map(c => ({ value: c.id, label: `${c.producto} (${c.cantidad} uds)` }))}
              onChange={(sel) => {
                const c = productosProveedor.find(x => String(x.id) === String(sel?.value));
                if (c) setForm({ 
                    ...form, 
                    producto: c.producto || "", 
                    compraId: c.id || "", 
                    precioCompra: c.precioCompra || 0, 
                    stock: c.cantidad || 0, 
                    productoId: c.productoId || null 
                });
              }}
              value={productosProveedor.map(c => ({ value: c.id, label: c.producto })).find(o => o.value === form.compraId) || null}
            />
          </div>

          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
            <label className="block text-[9px] font-black text-gray-400 uppercase">Costo de Compra</label>
            <span className="text-xl font-black text-gray-700">{formatMoneda(form.precioCompra)}</span>
          </div>

          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
            <label className="block text-[9px] font-black text-gray-400 uppercase italic">Stock que ingresa (Editable)</label>
            <input 
                type="number"
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                className="w-full bg-transparent font-black text-gray-700 text-xl outline-none"
            />
          </div>

          <div className="flex flex-col bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
            <label className="block text-xs font-bold mb-1 text-blue-600 uppercase">Precio de Venta</label>
            <input 
                type="number" 
                step="0.01" 
                value={form.precioVenta} 
                onChange={e => setForm({...form, precioVenta: e.target.value})} 
                className="w-full bg-transparent outline-none font-black text-blue-700 text-2xl" 
                placeholder="0.00" 
                required
            />
            <div className="mt-1 pt-1 border-t border-blue-100 flex justify-between items-center font-bold">
                <span className="text-[9px] text-blue-400 uppercase tracking-tighter">Margen:</span>
                <span className={`text-xs ${gananciaUnitario() > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatMoneda(gananciaUnitario())}
                </span>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <button type="submit" className={`flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editingId ? "GUARDAR CAMBIOS" : "INGRESAR STOCK"}
            </button>
            {editingId && <button onClick={handleCancelEdit} type="button" className="p-4 bg-gray-200 rounded-2xl">✕</button>}
          </div>
        </form>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-black text-gray-400 text-xs tracking-[0.3em] uppercase">Stock Disponible en Vitrina</h3>
            <input type="text" placeholder="Filtrar por nombre..." className="p-3 px-6 bg-white border border-gray-200 rounded-2xl text-sm outline-none w-full md:w-80 shadow-inner" onChange={e => setFiltro(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">
                <th className="p-6">Producto / Proveedor</th>
                <th className="p-6 text-center">Stock Físico</th>
                <th className="p-6 text-right">Inversión / Venta</th>
                <th className="p-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productos.filter(p => p.producto.toLowerCase().includes(filtro.toLowerCase())).map(p => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-all group">
                  <td className="p-6">
                    <div className="font-black text-gray-900 text-lg uppercase leading-tight">{p.producto}</div>
                    <div className="text-[10px] font-bold text-blue-500 mt-1">{p.proveedor}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-2 rounded-2xl font-mono font-black text-sm border ${p.stock <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Costo: {formatMoneda(p.precioCompra)}</div>
                    <div className="font-black text-gray-900 text-lg">{formatMoneda(p.precioVenta)}</div>
                    <div className="text-[9px] font-black text-emerald-500 italic">Ganancia: {formatMoneda(p.precioVenta - p.precioCompra)}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p)} className="p-2 bg-yellow-100 text-yellow-700 rounded-xl hover:scale-110 transition-transform shadow-sm">✏️</button>
                      <button onClick={() => handleDelete(p)} className="p-2 bg-red-100 text-red-700 rounded-xl hover:scale-110 transition-transform shadow-sm">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}