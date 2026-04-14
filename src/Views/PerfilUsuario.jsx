import { useEffect, useState } from "react";
import { 
    getAuth, 
    verifyBeforeUpdateEmail, 
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
// Nota: Si usas lucide-react o Heroicons, puedes importar iconos. Aquí usaré emojis para mantenerlo simple.

export default function PerfilUsuario() {
    const auth = getAuth();
    const user = auth.currentUser;

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [dni, setDni] = useState("");
    const [nuevoEmail, setNuevoEmail] = useState(user?.email || "");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");

    useEffect(() => {
        if (user) {
            cargarDatos();
        }
    }, [user]);

    const cargarDatos = async () => {
        try {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setNombre(data.nombre || "");
                setApellido(data.apellido || "");
                setDni(data.dni || "");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleActualizarPerfil = async (e) => {
        e.preventDefault();
        try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, { nombre, apellido, dni });
            mostrarFeedback("Datos personales actualizados correctamente", "success");
        } catch (error) {
            mostrarFeedback("Error al actualizar datos", "error");
        }
    };

    const handleActualizarEmail = async (e) => {
        e.preventDefault();
        if (!nuevoEmail) return mostrarFeedback("Ingrese un email válido", "error");
        try {
            await verifyBeforeUpdateEmail(user, nuevoEmail);
            mostrarFeedback("Se envió un correo para verificar el nuevo email", "success");
        } catch (error) {
            mostrarFeedback("❌ Error: " + error.message, "error");
        }
    };

    const handleActualizarPassword = async (e) => {
        e.preventDefault();
        if (!passwordActual || !nuevaPassword) return mostrarFeedback("Complete los campos de contraseña", "error");
        if (nuevaPassword.length < 6) return mostrarFeedback("Mínimo 6 caracteres", "error");

        try {
            const credential = EmailAuthProvider.credential(user.email, passwordActual);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, nuevaPassword);
            mostrarFeedback("✅ Contraseña actualizada correctamente", "success");
            setPasswordActual("");
            setNuevaPassword("");
        } catch (error) {
            mostrarFeedback("❌ Error: " + error.message, "error");
        }
    };

    const mostrarFeedback = (msg, tipo) => {
        setMensaje(msg);
        setTipoMensaje(tipo);
        setTimeout(() => setMensaje(""), 5000); // Limpia el mensaje tras 5s
    };

    const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-700";
    const labelClass = "block text-sm font-medium text-gray-600 mb-1 ml-1";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mi Perfil</h2>
                    <p className="text-gray-500 mt-2 text-lg">Gestiona tu identidad y seguridad de la cuenta</p>
                </div>

                {/* Notificación */}
                {mensaje && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center shadow-sm border animate-in fade-in slide-in-from-top-2 ${
                        tipoMensaje === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                        <span className="mr-3">{tipoMensaje === "success" ? "✅" : "⚠️"}</span>
                        <p className="text-sm font-medium">{mensaje}</p>
                    </div>
                )}

                <div className="space-y-8">
                    {/* SECCIÓN: DATOS PERSONALES */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">👤</div>
                            <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                        </div>
                        <form onSubmit={handleActualizarPerfil} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Nombre</label>
                                    <input type="text" placeholder="Ej. Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Apellido</label>
                                    <input type="text" placeholder="Ej. Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>DNI / Identificación</label>
                                <input type="text" placeholder="Número de documento" value={dni} onChange={(e) => setDni(e.target.value)} className={inputClass} />
                            </div>
                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-100">
                                Actualizar Datos
                            </button>
                        </form>
                    </section>

                    {/* SECCIÓN: EMAIL */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">📧</div>
                            <h3 className="text-xl font-bold text-gray-800">Correo Electrónico</h3>
                        </div>
                        <form onSubmit={handleActualizarEmail} className="space-y-4">
                            <div>
                                <label className={labelClass}>Email actual o nuevo</label>
                                <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} className={inputClass} />
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-100">
                                Vincular Nuevo Email
                            </button>
                        </form>
                    </section>

                    {/* SECCIÓN: PASSWORD */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="bg-emerald-100 p-2 rounded-lg mr-3">🔐</div>
                            <h3 className="text-xl font-bold text-gray-800">Seguridad</h3>
                        </div>
                        <form onSubmit={handleActualizarPassword} className="space-y-4">
                            <div>
                                <label className={labelClass}>Contraseña Actual</label>
                                <input type="password" placeholder="••••••••" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Nueva Contraseña</label>
                                <input type="password" placeholder="Mínimo 6 caracteres" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} className={inputClass} />
                            </div>
                            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-100">
                                Cambiar Contraseña
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}