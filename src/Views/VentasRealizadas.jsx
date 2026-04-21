import { useEffect, useState, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/Config";
import { AuthContext } from "../Context/AuthContext";

export default function VentasRealizadas() {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [fecha, setFecha] = useState("");
    const [totalDia, setTotalDia] = useState(0);

    const { userRole, uid } = useContext(AuthContext);

    useEffect(() => {
        cargarVentas();
    }, []);

    useEffect(() => {
        const total = ventasFiltradas.reduce(
            (acc, v) => acc + Number(v.total || 0),
            0
        );
        setTotalDia(total);
    }, [ventasFiltradas]);

    const cargarVentas = async () => {
        const snapshot = await getDocs(collection(db, "ventas"));
        let data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (userRole !== "admin") {
            data = data.filter(v => v.usuario?.uid === uid);
        }

        setVentas(data);
        setVentasFiltradas(data);
    };

    const filtrarPorFecha = (fechaSeleccionada) => {
        setFecha(fechaSeleccionada);
        if (!fechaSeleccionada) {
            setVentasFiltradas(ventas);
            return;
        }
        const filtradas = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha?.seconds * 1000)
                .toISOString()
                .split("T")[0];
            return fechaVenta === fechaSeleccionada;
        });
        setVentasFiltradas(filtradas);
    };

    const formatMoneda = (valor) =>
        new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
        }).format(valor || 0);

    return (
        <div className="p-4 md:p-10 bg-[#f4f7fe] min-h-screen font-sans text-slate-700">
            <div className="max-w-6xl mx-auto">
                
                {/* ENCABEZADO Y FILTRO */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                            Reporte de Ventas
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Consulta y audita las transacciones realizadas.</p>
                    </div>

                    <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Filtrar Jornada</span>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => filtrarPorFecha(e.target.value)}
                                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        {fecha && (
                            <button 
                                onClick={() => filtrarPorFecha("")}
                                className="mt-5 text-xs font-bold text-rose-500 hover:underline"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI CARD - TOTAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase opacity-80 tracking-widest">
                                {fecha ? `Ingresos del ${fecha}` : "Ingresos Totales"}
                            </p>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter">
                                {formatMoneda(totalDia)}
                            </h2>
                        </div>
                        {/* Decoración abstracta */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operaciones</p>
                        <h2 className="text-3xl font-black text-slate-800 mt-1">{ventasFiltradas.length} <span className="text-sm font-medium text-slate-400">Tickets</span></h2>
                    </div>
                </div>
                    {/*   OCULTAMOS POR EL MOMENTO NO ESTA AGREGADO EN EL DOCUMENTO DE REQUERIMIENTOS  
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado de Red</p>
                        <h2 className="text-sm font-black text-emerald-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Sincronizado con Cloud
                        </h2>
                    </div>
                    
                        */}

                {/* TABLA DE DETALLES */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Cliente</th>
                                    <th className="px-8 py-5">Producto</th>
                                    <th className="px-8 py-5 text-center">Cantidad</th>
                                    <th className="px-8 py-5 text-right">P. Unitario</th>
                                    <th className="px-8 py-5 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ventasFiltradas.map(v =>
                                    v.detalles.map((d, i) => {
                                        const precioUnitario = d.subtotal / d.cantidad;
                                        return (
                                            <tr key={v.id + i} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-slate-800 text-sm uppercase">{v.cliente || "Público General"}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tighter">ID: {v.id.substring(0,8).toUpperCase()}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="font-black text-slate-700 text-xs uppercase">{d.producto}</div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-black text-xs">
                                                        {d.cantidad}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-medium text-slate-500 text-sm">
                                                    {formatMoneda(precioUnitario)}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="font-black text-indigo-600 text-sm">
                                                        {formatMoneda(d.subtotal)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                {ventasFiltradas.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-slate-300 font-medium italic">
                                            No se encontraron registros para esta consulta.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                            
                {/* FOOTER INFORMATIVO  OCULTAMOS POR EL MOMENTO NO ESTA AGREGADO EN EL DOCUMENTO DE REQUERIMIENTOS  
                <div className="mt-8 flex justify-between items-center px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Generado por: {userRole} (UID: {uid?.substring(0,5)}...)
                    </p>
                    <button 
                        onClick={() => window.print()} 
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl text-xs font-black hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        🖨️ Imprimir Reporte
                    </button>
                </div>
                */}
            </div>
        </div>
    );
}