import { useEffect, useState } from "react";
import { getVentas } from "../services/ventaService";
import { getUsers } from "../services/userService";

export default function AdminVentas() {
    const [ventas, setVentas] = useState([]);
    const [users, setUsers] = useState([]);
    const [fecha, setFecha] = useState("");
    const [dni, setDni] = useState("");
    const [resultado, setResultado] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const ventasData = await getVentas();
        const usersData = await getUsers();
        setVentas(ventasData);
        setUsers(usersData);
        setResultado(ventasData);
    };

    const formatMoneda = (valor) =>
        new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
        }).format(valor || 0);

    const filtrar = () => {
        let data = [...ventas];
        if (fecha) {
            data = data.filter(v => {
                const f = new Date(v.fecha.seconds * 1000).toISOString().split("T")[0];
                return f === fecha;
            });
        }
        if (dni) {
            const user = users.find(u => u.dni === dni);
            data = user ? data.filter(v => v.usuario?.uid === user.uid) : [];
        }
        setResultado(data);
    };

    const totalDia = resultado.reduce((acc, v) => acc + (v.total || 0), 0);
    const totalTransacciones = resultado.length;

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* ENCABEZADO Y RESUMEN */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">Panel de Ventas</h2>
                    <p className="text-slate-500">Monitoreo global de operaciones y rendimiento</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[150px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transacciones</p>
                        <p className="text-2xl font-black text-indigo-600">{totalTransacciones}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Acumulado</p>
                        <p className="text-2xl font-black text-emerald-600">{formatMoneda(totalDia)}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* FILTROS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-600 mb-1 ml-1">Fecha de Operación</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex-[2] w-full">
                        <label className="block text-sm font-semibold text-slate-600 mb-1 ml-1">DNI del Empleado</label>
                        <input
                            type="text"
                            placeholder="Ingrese documento para filtrar..."
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={filtrar}
                        className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Aplicar Filtros
                    </button>
                </div>

                {/* TABLA DE RESULTADOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empleado</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">DNI</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Producto</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Cant.</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {resultado.length > 0 ? (
                                    resultado.flatMap(v =>
                                        v.detalles.map((d, i) => {
                                            const user = users.find(u => u.uid === v.usuario?.uid);
                                            const fechaVenta = new Date(v.fecha.seconds * 1000).toLocaleDateString();

                                            return (
                                                <tr key={v.id + i} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="p-4 font-medium text-slate-700">
                                                        {user ? `${user.nombre} ${user.apellido}` : "Desconocido"}
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-sm">{user?.dni || "-"}</td>
                                                    <td className="p-4">
                                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-sm font-medium">
                                                            {d.producto}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center font-semibold text-slate-600">{d.cantidad}</td>
                                                    <td className="p-4 font-bold text-emerald-600">{formatMoneda(d.subtotal)}</td>
                                                    <td className="p-4 text-right text-slate-400 text-sm font-medium">{fechaVenta}</td>
                                                </tr>
                                            );
                                        })
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-slate-400 italic">
                                            No se encontraron registros con los filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}