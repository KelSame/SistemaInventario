import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Navbar() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Obtener iniciales para el avatar en caso de que no haya foto
    const iniciales = `${user?.nombre?.charAt(0) || ""}${user?.apellido?.charAt(0) || ""}`.toUpperCase();

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
            {/* Sección de Bienvenida */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Sesión Activa
                    </span>
                    <h2 className="text-slate-700 font-bold text-sm">
                        Hola, <span className="text-indigo-600">{user?.nombre} {user?.apellido}</span> 👋
                    </h2>
                </div>
            </div>

            {/* Acciones de Usuario */}
            <div className="flex items-center gap-6">
                {/* Badge de Estado (Opcional) */}
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase">En línea</span>
                </div>

                <div className="h-8 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-4">
                    {/* Avatar Estilizado */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-200 ring-2 ring-white">
                        {iniciales || "U"}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-4 py-2 rounded-xl border border-slate-200 hover:border-rose-200 transition-all duration-300 active:scale-95"
                    >
                        <span className="text-xs font-black uppercase tracking-tight">Salir</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 transition-transform group-hover:translate-x-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}