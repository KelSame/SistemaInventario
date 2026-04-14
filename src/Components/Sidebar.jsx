import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
    const { userRole } = useContext(AuthContext);
    const location = useLocation();

    const linkStyle = (path) =>
        `block px-4 py-3 rounded-lg transition font-medium ${
            location.pathname === path
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700 text-gray-300"
        }`;

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen shadow-2xl flex flex-col">

            {/* HEADER */}
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold tracking-wide">
                    Inventario Ocampo
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                    Panel Empresarial
                </p>
            </div>

            {/* MENU */}
            <nav className="flex-1 p-6 space-y-2">

                <Link to="/admin/dashboard" className={linkStyle("/admin/dashboard")}>
                    Resumen
                </Link>

                <Link to="/admin/productos" className={linkStyle("/admin/productos")}>
                    Productos
                </Link>

                <Link to="/admin/ventas" className={linkStyle("/admin/ventas")}>
                    Registrar Venta
                </Link>

                <Link to="/admin/ventas-realizadas" className={linkStyle("/admin/ventas-realizadas")}>
                    Ventas Realizadas
                </Link>

                <Link to="/admin/admin-ventas" className={linkStyle("/admin/admin-ventas")}>
                    Ventas por Empleado
                </Link>

                <Link to="/admin/proveedores" className={linkStyle("/admin/proveedores")}>
                    Proveedores
                </Link>

                

                {userRole === "admin" && (
                    <Link to="/admin/usuarios" className={linkStyle("/admin/usuarios")}>
                        Usuarios
                    </Link>
                )}

            </nav>

            {/* FOOTER */}
            <div className="p-6 border-t border-gray-700 text-sm text-gray-400">
                Sistema Ocampo - Gestión de Inventarios & Ventas
            </div>
        </div>
    );
}
