import { useEffect, useState } from "react";
import { getVentas } from "../Services/VentaService";

    export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);

    useEffect(() => {
        loadVentas();
    }, []);

    const loadVentas = async () => {
        const data = await getVentas();
        setVentas(data);
    };

    const formatMoneda = (valor) =>
        new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
        }).format(valor || 0);

    return (
        <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Historial de Ventas</h2>

        <table className="w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
            <tr>
                <th className="p-3">N° Venta</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
            </tr>
            </thead>

            <tbody>
            {ventas.map(v => (
                <tr key={v.id} className="border-t">
                <td className="p-3">{v.numeroVenta}</td>
                <td className="p-3">
                    {new Date(v.fecha.seconds * 1000).toLocaleString()}
                </td>
                <td className="p-3">{v.usuario?.email}</td>
                <td className="p-3">{v.cliente}</td>
                <td className="p-3 font-bold text-green-600">
                    {formatMoneda(v.total)}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
    }
