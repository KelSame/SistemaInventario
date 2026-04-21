import { useState, useContext, useEffect } from "react";
import { loginUser } from "../Services/AuthService";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../Firebase/Config";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        password: ""
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const [registerMode, setRegisterMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "admin"));
                const snap = await getDocs(q);
                setShowRegister(snap.empty);
            } catch (err) {
                setShowRegister(false);
            }
        };
        checkAdmin();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const data = await loginUser(form.email, form.password);
            setUser(data);
            if (data.role === "admin") navigate("/admin/dashboard");
            else if (data.role === "empleado") navigate("/admin/ventas");
        } catch (error) {
            if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                setErrorMsg("Contraseña incorrecta");
            } else if (error.code === "auth/user-not-found") {
                setErrorMsg("El usuario no existe");
            } else {
                setErrorMsg("Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const userData = {
                uid: res.user.uid,
                nombre: form.nombre,
                apellido: form.apellido,
                dni: form.dni,
                email: form.email,
                role: "admin",
                estado: "activo",
                fecha: new Date()
            };

            await setDoc(doc(db, "users", res.user.uid), userData);
            setUser({ uid: res.user.uid, email: form.email, role: "admin", estado: "activo" });
            navigate("/admin/dashboard");
        } catch (error) {
            setErrorMsg("Error al crear el administrador");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4">
            {/* Decoración de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

            <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 z-10 transition-all">
                
                {/* Logo / Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
                        <span className="text-white text-3xl font-black italic">O</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {registerMode ? "Configuración" : "Bienvenido"}
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 text-center">
                        {registerMode 
                            ? "Crea la cuenta maestra para el Inventario Ocampo" 
                            : "Ingresa tus credenciales para continuar"}
                    </p>
                </div>

                <form onSubmit={registerMode ? handleCreateAdmin : handleLogin} className="space-y-5">
                    
                    {registerMode && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej. Juan" />
                                <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej. Pérez" />
                            </div>
                            <Input label="DNI" name="dni" value={form.dni} onChange={handleChange} placeholder="Número de documento" />
                        </div>
                    )}

                    <Input 
                        label="Correo Electrónico" 
                        name="email" 
                        type="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        placeholder="tu@correo.com" 
                    />

                    <Input 
                        label="Contraseña" 
                        name="password" 
                        type="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        placeholder="••••••••" 
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg ${
                            registerMode
                                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200 text-white"
                                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200 text-white"
                        } disabled:opacity-50 active:scale-[0.98]`}
                    >
                        {loading ? "Procesando..." : registerMode ? "Finalizar Registro" : "Iniciar Sesión"}
                    </button>

                    {showRegister && !registerMode && (
                        <button
                            type="button"
                            onClick={() => setRegisterMode(true)}
                            className="w-full text-emerald-600 font-bold text-xs uppercase tracking-tighter hover:underline"
                        >
                            ¿No hay administrador? Regístrate aquí
                        </button>
                    )}

                    {errorMsg && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold text-center animate-bounce">
                            ⚠️ {errorMsg}
                        </div>
                    )}
                </form>

                <footer className="mt-10 text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        © 2026 Inventario Ocampo • 
                    </p>
                </footer>
            </div>
        </div>
    );
}

// Subcomponente de Input Estilizado
function Input({ label, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {label}
            </label>
            <input
                {...props}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                required
            />
        </div>
    );
}