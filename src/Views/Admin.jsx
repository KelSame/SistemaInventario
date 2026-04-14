import { useContext } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { AuthContext } from "../Context/AuthContext";

export default function AdminView() {
    const { userRole } = useContext(AuthContext);
    const location = useLocation(); // Para saber qué link marcar como activo

    // Función para aplicar estilos al link activo
    const linkStyle = (path) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
            isActive 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* SIDEBAR */}
            <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-2xl">
                {/* Logo Section */}
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">
                            O
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-tight">Inventario</h1>
                            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Ocampo</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* SECCIÓN ADMIN */}
                    {userRole === "admin" && (
                        <div>
                            <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                Administración
                            </p>
                            <div className="space-y-1">
                                <Link to="/admin/dashboard" className={linkStyle("/admin/dashboard")}>
                                    <span className="text-xl">📊</span>
                                    <span className="font-semibold text-sm">Panel General</span>
                                </Link>
                                <Link to="/admin/inventario-admin" className={linkStyle("/admin/inventario-admin")}>
                                    <span className="text-xl">📋</span>
                                    <span className="font-semibold text-sm">Verificación de Stock</span>
                                </Link>

                                <Link to="/admin/admin-ventas" className={linkStyle("/admin/admin-ventas")}>
                                    <span className="text-xl">📈</span>
                                    <span className="font-semibold text-sm">Ventas Empleados</span>
                                </Link>
                                <Link to="/admin/proveedores" className={linkStyle("/admin/proveedores")}>
                                    <span className="text-xl">🚚</span>
                                    <span className="font-semibold text-sm">Proveedores</span>
                                </Link>
                                <Link to="/admin/productos" className={linkStyle("/admin/productos")}>
                                    <span className="text-xl">📦</span>
                                    <span className="font-semibold text-sm">Productos</span>
                                </Link>
                                <Link to="/admin/usuarios" className={linkStyle("/admin/usuarios")}>
                                    <span className="text-xl">👤</span>
                                    <span className="font-semibold text-sm">Usuarios</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN OPERACIONES */}
                    {(userRole === "admin" || userRole === "empleado") && (
                        <div>
                            <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                Operaciones
                            </p>
                            <div className="space-y-1">
                                <Link to="/admin/ventas" className={linkStyle("/admin/ventas")}>
                                    <span className="text-xl">💰</span>
                                    <span className="font-semibold text-sm">Punto de Venta</span>
                                </Link>
                                <Link to="/admin/ventas-realizadas" className={linkStyle("/admin/ventas-realizadas")}>
                                    <span className="text-xl">📋</span>
                                    <span className="font-semibold text-sm">Historial Ventas</span>
                                </Link>
                                <Link to="/admin/perfil" className={linkStyle("/admin/perfil")}>
                                    <span className="text-xl">⚙️</span>
                                    <span className="font-semibold text-sm">Configuración</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer del Sidebar */}
                <div className="p-6 border-t border-slate-900">
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Rol Actual</p>
                        <p className="text-sm font-bold text-indigo-400 capitalize">{userRole}</p>
                    </div>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <Navbar />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}