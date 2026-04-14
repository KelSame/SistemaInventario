import { useEffect, useState, useContext } from "react";
import {
  createVenta,
  getVentas,
  deleteVenta,
  updateVenta,
  getVentasByUser
} from "../services/ventaService";
import { AuthContext } from "../Context/AuthContext";
import { getProducts } from "../Services/ProductService";
import Select from "react-select";

export default function Ventas() {
  const { user, loading } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cliente, setCliente] = useState("");
  const [editVenta, setEditVenta] = useState(null);
  
  // NUEVO: Estado para el mensaje de éxito en la interfaz
  const [mensajeExito, setMensajeExito] = useState("");

  const empresa = {
    razonSocial: "AUTO PARTES OCAMPO S.R.L.",
    ruc: "20609832101",
    direccion: "Av. Iquitos Nro. 110 Int. 123, Lima"
  };

  useEffect(() => {
    if (user) {
      loadProductos();
      loadVentas();
    }
  }, [user]);

  const loadProductos = async () => {
    const data = await getProducts();
    setProductos(data);
  };

  const loadVentas = async () => {
    if (!user) return;
    const data = user.role === "admin" ? await getVentas() : await getVentasByUser(user.uid);
    setVentas(data);
  };

  const productoSeleccionado = productos.find(p => p.id === productoId);
  const total = productoSeleccionado ? cantidad * productoSeleccionado.precioVenta : 0;

  const formatMoneda = (valor) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(valor || 0);

  const registrarVenta = async () => {
    if (!productoSeleccionado) return alert("Seleccione producto");
    if (cantidad <= 0 || cantidad > productoSeleccionado.stock) return alert("Cantidad no válida o stock insuficiente");

    // NUEVO: Confirmación antes de registrar
    const confirmar = window.confirm(
      `¿Confirmar venta?\n\nProducto: ${productoSeleccionado.producto}\nCantidad: ${cantidad}\nTotal: ${formatMoneda(total)}`
    );

    if (!confirmar) return;

    try {
      const ventaData = {
        cliente: cliente || "Público General",
        usuario: { uid: user?.uid || "sin-usuario", email: user?.email || "desconocido" },
        total,
        detalles: [{
          productoId: productoSeleccionado.id,
          producto: productoSeleccionado.producto,
          cantidad,
          subtotal: total,
        }]
      };

      await createVenta(ventaData);
      
      // NUEVO: Mostrar mensaje de éxito en la interfaz
      setMensajeExito(`✅ ¡Venta de ${productoSeleccionado.producto} registrada con éxito!`);
      
      // Limpiar campos
      setProductoId("");
      setCantidad(1);
      setCliente("");
      
      // Recargar datos
      await loadVentas();
      await loadProductos();

      // Ocultar mensaje después de 4 segundos
      setTimeout(() => setMensajeExito(""), 4000);

    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <div className="p-10 text-center font-bold text-red-500">No autenticado</div>;

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-slate-700 font-sans">
      
      {/* HEADER / EMPRESA */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{empresa.razonSocial}</h1>
          <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">RUC: {empresa.ruc}</span>
            <span className="text-slate-400 text-xs flex items-center">📍 {empresa.direccion}</span>
          </div>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-2xl text-center min-w-[150px]">
            <p className="text-[10px] uppercase font-bold opacity-60">Operador</p>
            <p className="text-sm font-medium">{user.email}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL DE REGISTRO */}
        <section className="lg:col-span-1">
          {/* NUEVO: Alerta de éxito dentro de la interfaz */}
          {mensajeExito && (
            <div className="mb-4 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 font-bold text-sm animate-fade-in flex items-center gap-2">
              <span>{mensajeExito}</span>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 italic uppercase">
              <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
              Nueva Venta
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nombre del Cliente</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Buscar Producto</label>
                <Select
                  placeholder="Seleccionar..."
                  options={productos.map(p => ({
                    value: p.id,
                    label: `${p.producto}`,
                    sub: `Stock: ${p.stock} | ${formatMoneda(p.precioVenta)}`
                  }))}
                  formatOptionLabel={({label, sub}) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 uppercase text-xs">{label}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{sub}</span>
                    </div>
                  )}
                  value={productos.filter(p => p.id === productoId).map(p => ({ value: p.id, label: p.producto })) || null}
                  onChange={(selected) => setProductoId(selected?.value || "")}
                  styles={{
                    control: (base) => ({ ...base, borderRadius: '1rem', padding: '0.4rem', border: 'none', backgroundColor: '#f8fafc' }),
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl flex flex-col justify-center items-center border border-blue-100">
                    <p className="text-[9px] font-black text-blue-400 uppercase">Total a Cobrar</p>
                    <p className="text-xl font-black text-blue-700 leading-none mt-1">{formatMoneda(total)}</p>
                </div>
              </div>

              <button
                onClick={registrarVenta}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase tracking-tighter"
              >
                Completar Transacción
              </button>
            </div>
          </div>
        </section>

        {/* HISTORIAL DE VENTAS */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic underline decoration-blue-500 decoration-4 underline-offset-8">
                    Historial Reciente
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{ventas.length} VENTAS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">N° Doc</th>
                    <th className="px-6 py-4">Detalle / Cliente</th>
                    <th className="px-6 py-4 text-center">Cant.</th>
                    <th className="px-6 py-4 text-right">Monto Total</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ventas.map(v =>
                    v.detalles.map((d, i) => (
                      <tr key={v.id + i} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                            <span className="font-mono font-bold text-slate-400 text-xs">#{String(v.numeroVenta || 0).padStart(5, '0')}</span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="font-black text-slate-800 text-sm uppercase">{d.producto}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                {editVenta?.id === v.id ? (
                                    <input
                                        value={editVenta.cliente}
                                        onChange={(e) => setEditVenta({ ...editVenta, cliente: e.target.value })}
                                        className="border-b-2 border-blue-400 outline-none bg-blue-50 px-1"
                                    />
                                ) : (
                                    <>👤 {v.cliente}</>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold text-xs">{d.cantidad}</span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-emerald-600">
                            {formatMoneda(d.subtotal)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editVenta?.id === v.id ? (
                              <>
                                <button onClick={async () => {
                                    await updateVenta(v.id, { cliente: editVenta.cliente });
                                    setEditVenta(null);
                                    loadVentas();
                                }} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">💾</button>
                                <button onClick={() => setEditVenta(null)} className="p-2 bg-slate-100 text-slate-400 rounded-xl">❌</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditVenta(v)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors">✏️</button>
                                <button onClick={async () => {
                                    if (!confirm("¿Desea anular esta venta?")) return;
                                    await deleteVenta(v.id);
                                    loadVentas();
                                    loadProductos();
                                }} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">🗑️</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {ventas.length === 0 && (
                    <tr>
                        <td colSpan="5" className="p-20 text-center text-slate-300 font-medium italic">No se registran operaciones hoy.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}