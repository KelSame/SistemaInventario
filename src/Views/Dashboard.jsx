import { useEffect, useState, useContext } from "react";
import { getVentas } from "../services/ventaService";
import { getProducts } from "../services/productService";
import { getUsers } from "../services/userService";
import { getProveedores } from "../services/proveedorService";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const { userRole, uid } = useContext(AuthContext);

    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [users, setUsers] = useState([]);
    const [proveedores, setProveedores] = useState([]);

    const [vista, setVista] = useState("dia");
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split("T")[0]);
    const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7));

    const [kpis, setKpis] = useState({
        totalVentas: 0,
        totalCompras: 0,
        ganancia: 0,
        ventasCount: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        calcularKPIs();
    }, [ventas, proveedores, vista, fechaFiltro, mesFiltro]);

    const loadData = async () => {
        try {
            const [v, p, u, prov] = await Promise.all([
                getVentas(),
                getProducts(),
                getUsers(),
                getProveedores()
            ]);
            setVentas(v);
            setProductos(p);
            setUsers(u);
            setProveedores(prov);
        } catch (err) {
            console.log(err.message);
        }
    };

    const convertirFecha = (fecha) => {
        if (!fecha) return null;
        // Manejo de Timestamps de Firebase o strings ISO
        const f = new Date(fecha?.seconds ? fecha.seconds * 1000 : fecha);
        return isNaN(f) ? null : f;
    };

    const calcularKPIs = () => {
        let ventasFiltradas = [];
        let comprasFiltradas = [];

        const matchDate = (f) => {
            const fechaObj = convertirFecha(f);
            if (!fechaObj) return false;
            const iso = fechaObj.toISOString();
            return vista === "dia" ? iso.startsWith(fechaFiltro) : iso.startsWith(mesFiltro);
        };

        ventasFiltradas = ventas.filter(v => matchDate(v.fecha));
        proveedores.forEach(p => {
            p.compras?.forEach(c => {
                if (matchDate(c.fecha)) comprasFiltradas.push(c);
            });
        });

        const totalVentas = ventasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);
        const totalCompras = comprasFiltradas.reduce((acc, c) => acc + (c.importeTotal || 0), 0);

        setKpis({
            totalVentas,
            totalCompras,
            ganancia: totalVentas - totalCompras,
            ventasCount: ventasFiltradas.length,
        });
    };

    const formatMoneda = (v) =>
        new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

    const stockBajo = productos.filter((p) => p.stock <= 5);

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen text-slate-800 font-sans">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="bg-indigo-600 text-white p-2 rounded-xl text-xl">📊</span>
                        Resumen Ejecutivo
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Panel de control administrativo</p>
                </div>

                {/* Switcher de Vista */}
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setVista("dia")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${vista === "dia" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Vista Diaria
                    </button>
                    <button
                        onClick={() => setVista("mes")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${vista === "mes" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Vista Mensual
                    </button>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="mb-8 flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Filtrar por:</span>
                <input
                    type={vista === "dia" ? "date" : "month"}
                    value={vista === "dia" ? fechaFiltro : mesFiltro}
                    onChange={(e) => vista === "dia" ? setFechaFiltro(e.target.value) : setMesFiltro(e.target.value)}
                    className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 p-2 rounded-xl font-bold text-slate-700 transition-all outline-none"
                />
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card title="Total Ventas" value={formatMoneda(kpis.totalVentas)} icon="💰" color="text-emerald-600" bg="bg-emerald-50" />
                <Card title="Total Compras" value={formatMoneda(kpis.totalCompras)} icon="🏭" color="text-orange-600" bg="bg-orange-50" />
                <Card title="Ganancia Real" value={formatMoneda(kpis.ganancia)} icon="📈" color="text-indigo-600" bg="bg-indigo-50" />
                <Card title="Tickets Generados" value={kpis.ventasCount} icon="🧾" color="text-slate-600" bg="bg-slate-100" />
            </div>

            {/* Sección Inferior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico Simple */}
                <Panel title="Comparativo Ventas vs Compras">
                    <div className="h-64 flex items-end justify-around gap-10 px-6 border-b border-slate-100 pb-6">
                        <Bar 
                            label="Ventas" 
                            value={kpis.totalVentas} 
                            max={Math.max(kpis.totalVentas, kpis.totalCompras)} 
                            color="bg-emerald-500" 
                        />
                        <Bar 
                            label="Compras" 
                            value={kpis.totalCompras} 
                            max={Math.max(kpis.totalVentas, kpis.totalCompras)} 
                            color="bg-orange-500" 
                        />
                    </div>
                </Panel>

                {/* Stock Alerta */}
                <Panel title="Control de Inventario Crítico">
                    <div className="space-y-3">
                        {stockBajo.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <span className="text-4xl mb-2">✅</span>
                                <p className="text-emerald-500 font-bold tracking-tight text-lg">Stock Saludable</p>
                                <p className="text-slate-400 text-sm italic">Todos los productos tienen existencias</p>
                            </div>
                        ) : (
                            stockBajo.map((p) => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl border border-rose-100 group hover:bg-rose-100 transition-colors">
                                    <span className="font-bold text-slate-700">{p.producto}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-rose-400 uppercase">Quedan</span>
                                        <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-sm font-black shadow-sm">
                                            {p.stock}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Panel>
            </div>
        </div>
    );
}

// Subcomponentes Internos
function Card({ title, value, icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center text-2xl mb-4`}>{icon}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">{title}</p>
            <h2 className={`text-2xl font-black ${color}`}>{value}</h2>
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black mb-8 text-slate-800 border-l-4 border-indigo-600 pl-4">{title}</h3>
            {children}
        </div>
    );
}

function Bar({ label, value, max, color }) {
    const heightPercentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-xs font-black text-slate-400 mb-2">{new Intl.NumberFormat().format(value)}</div>
            <div 
                className={`${color} w-full max-w-[80px] rounded-t-2xl transition-all duration-1000 shadow-inner`}
                style={{ height: `${heightPercentage}%`, minHeight: '8px' }}
            ></div>
            <p className="mt-4 text-sm font-bold text-slate-600 uppercase tracking-tighter">{label}</p>
        </div>
    );
}