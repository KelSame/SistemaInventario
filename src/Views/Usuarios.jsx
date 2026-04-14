import { useEffect, useState } from "react";
import { db, auth, firebaseConfig } from "../firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, setDoc, doc, query, where, getDoc } from "firebase/firestore";

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const userRef = collection(db, "users");

const getUsers = async () => {
    const snapshot = await getDocs(userRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const checkDniExists = async (dni) => {
    const q = query(userRef, where("dni", "==", dni));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

const createUserDoc = async (uid, email, role, nombre, apellido, dni) => {
    await setDoc(doc(db, "users", uid), {
        uid,
        email,
        role,
        nombre,
        apellido,
        dni,
        estado: "activo",
        fecha: new Date(),
    });
};

const toggleUserStatus = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    await setDoc(doc(db, "users", id), { estado: nuevoEstado }, { merge: true });
};

export default function Usuarios() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [dni, setDni] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("empleado");
    const [search, setSearch] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        const data = await getUsers();
        setUsers(data);
        setFilteredUsers(data);
    };

    useEffect(() => {
        const result = users.filter(user =>
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.nombre.toLowerCase().includes(search.toLowerCase()) ||
            user.dni.includes(search)
        );
        setFilteredUsers(result);
    }, [search, users]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setErrorMsg(""); setSuccessMsg("");
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return setErrorMsg("No hay sesión activa");
            const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
                return setErrorMsg("Solo un administrador puede crear usuarios");
            }
            if (!/^\d{8}$/.test(dni)) return setErrorMsg("El DNI debe tener 8 dígitos");
            const dniExists = await checkDniExists(dni);
            if (dniExists) return setErrorMsg("El DNI ya existe");

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            await createUserDoc(newUser.uid, email, role, nombre.trim(), apellido.trim(), dni);
            await loadUsers();

            setNombre(""); setApellido(""); setDni(""); setEmail(""); setPassword(""); setRole("empleado");
            setSuccessMsg("🚀 Usuario creado exitosamente");
        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    const handleToggleStatus = async (id, estadoActual) => {
        await toggleUserStatus(id, estadoActual);
        loadUsers();
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Equipo y Seguridad</h2>
                        <p className="text-slate-500 font-medium">Gestiona los accesos y roles de tu personal.</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por DNI, Nombre o Correo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-80 pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <span className="absolute left-4 top-3.5 opacity-30 text-xl">🔍</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* FORMULARIO DE REGISTRO */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 italic underline underline-offset-8">Registrar Nuevo Miembro</h3>
                            
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre</label>
                                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Juan" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Apellido</label>
                                        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Pérez" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Documento de Identidad (DNI)</label>
                                    <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="88888888" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="ejemplo@correo.com" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña de Acceso</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
                                </div>

                                <div className="space-y-1 pb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Rol en el Sistema</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                                        <option value="empleado">Empleado / Vendedor</option>
                                        {/*<option value="admin">Administrador General</option>*/ }

                                    </select>
                                </div>

                                {errorMsg && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">⚠️ {errorMsg}</div>}
                                {successMsg && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 italic">✓ {successMsg}</div>}

                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-tighter">
                                    Crear Cuenta de Usuario
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* LISTADO DE USUARIOS */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-white">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Registrado</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-8 py-4">Usuario</th>
                                            <th className="px-8 py-4">DNI / Rol</th>
                                            <th className="px-8 py-4 text-center">Estado</th>
                                            <th className="px-8 py-4 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900 text-sm uppercase leading-tight">{user.nombre} {user.apellido}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium lowercase italic">{user.email}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-bold text-slate-700 tracking-wider">ID: {user.dni}</div>
                                                    <div className={`text-[9px] font-black uppercase mt-1 inline-block px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {user.role}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.estado === "activo" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                                                        ● {user.estado}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id, user.estado)}
                                                            className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-sm ${user.estado === "activo" ? "bg-white text-rose-500 border border-rose-100 hover:bg-rose-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                                                            {user.estado === "activo" ? "SUSPENDER" : "REACTIVAR"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="p-20 text-center text-slate-300 font-medium italic">No se encontraron usuarios que coincidan con la búsqueda.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}