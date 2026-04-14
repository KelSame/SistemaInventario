import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ userRole, allowedRoles, children }) {

    if (userRole === undefined) {
        return <div>Cargando...</div>;
    }

    if (!allowedRoles.includes(userRole)) {
         // 🔹 Si es empleado lo mandamos a ventas
        if (userRole === "empleado") {
        return <Navigate to="/admin/ventas" replace />;
        }

        // 🔹 Si es admin lo mandamos al dashboard
        if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
        }

        // 🔹 Si no tiene rol válido, login
        return <Navigate to="/" replace />;
    }

    return children;
}
