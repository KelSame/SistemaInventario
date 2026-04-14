import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function InventarioAdmin() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventario = async () => {
        try {
            const data = await getProducts();
            setProductos(data);
        } catch (err) {
            console.error("Error al cargar inventario:", err);
        } finally {
            setLoading(false);
        }
        };
        fetchInventario();
    }, []);

    const formatMoneda = (v) =>
        new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

    const productosFiltrados = productos.filter((p) =>
        p.producto?.toLowerCase().includes(filtro.toLowerCase())
    );

    // Cálculos rápidos para el Admin
    const inversionTotal = productos.reduce((acc, p) => acc + (Number(p.precioCompra) * Number(p.stock)), 0);
    const stockBajo = productos.filter(p => p.stock <= 5).length;

    if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Cargando Almacén...</div>;

    return (
        <div className="space-y-6">
        {/* HEADER DINÁMICO */}
        <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Control de Stock Real</h2>
            <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest">Reporte consolidado de inventario</p>
            </div>
            
            <div className="flex gap-4">
                <div className="text-right border-r border-slate-800 pr-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Valorización</p>
                    <p className="text-xl font-black text-emerald-400">{formatMoneda(inversionTotal)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Alertas</p>
                    <p className="text-xl font-black text-orange-400">{stockBajo} Críticos</p>
                </div>
            </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative group">
            <input 
            type="text" 
            placeholder="Buscar producto por nombre..." 
            className="w-full p-5 pl-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
            onChange={e => setFiltro(e.target.value)}
            />
            <span className="absolute left-6 top-5 text-xl opacity-30">🔍</span>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Información del Producto</th>
                <th className="p-6 text-center">Existencias</th>
                <th className="p-6 text-right">Precio Venta</th>
                <th className="p-6 text-right">Valor en Stock</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {productosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                    <div className="font-black text-slate-800 uppercase text-lg">{p.producto}</div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase">{p.proveedor}</div>
                    </td>
                    <td className="p-6 text-center">
                    <span className={`px-4 py-2 rounded-xl font-mono font-black text-sm border ${
                        p.stock <= 5 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                        {p.stock}
                    </span>
                    </td>
                    <td className="p-6 text-right font-black text-slate-900">
                    {formatMoneda(p.precioVenta)}
                    </td>
                    <td className="p-6 text-right font-black text-emerald-600 bg-emerald-50/30">
                    {formatMoneda(p.precioCompra * p.stock)}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {productosFiltrados.length === 0 && (
            <div className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.2em]">
                No se encontraron coincidencias
            </div>
            )}
        </div>
        </div>
    );
}