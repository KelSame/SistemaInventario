import { useState } from "react";
import { auth, db } from "../Firebase/Config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RegisterAdmin() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );

            const uid = res.user.uid;

            await setDoc(doc(db, "users", uid), {
                nombre: form.nombre,
                apellido: form.apellido,
                dni: form.dni,
                email: form.email,
                role: "admin",
                estado: "activo",
                createdAt: new Date()
            });

            // Usamos un estilo de alerta más moderno si lo deseas, 
            // pero mantenemos el alert para no añadir dependencias.
            alert("¡Administrador creado con éxito!");
            navigate("/");
        } catch (err) {
            setError("Error al crear la cuenta. Intente con otro correo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4">
            {/* Decoración de fondo (Blur) */}
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

            <div className="bg-white w-full max-w-lg p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 z-10">
                
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
                        <span className="text-white text-2xl font-black">👑</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">
                        Nuevo Administrador
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 text-center">
                        Configura la cuenta principal del sistema
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nombre" name="nombre" placeholder="Ej. Carlos" onChange={handleChange} />
                        <Input label="Apellido" name="apellido" placeholder="Ej. Ocampo" onChange={handleChange} />
                    </div>

                    <Input label="DNI / Documento" name="dni" placeholder="Número de identidad" onChange={handleChange} />
                    
                    <Input label="Correo Electrónico" name="email" type="email" placeholder="admin@correo.com" onChange={handleChange} />
                    
                    <Input label="Contraseña" name="password" type="password" placeholder="••••••••" onChange={handleChange} />

                    <div className="pt-2">
                        <button 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "Registrando..." : "Crear Administrador"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold text-center animate-pulse">
                        {error}
                    </div>
                )}

                <button 
                    onClick={() => navigate("/")}
                    className="w-full mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                    ← Volver al inicio
                </button>
            </div>
        </div>
    );
}

// Componente de Input Reutilizable para mantener consistencia
function Input({ label, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {label}
            </label>
            <input
                {...props}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
            />
        </div>
    );
}