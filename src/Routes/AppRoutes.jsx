import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

import Login from "../Views/Login";
import Admin from "../Views/Admin";
import Dashboard from "../Views/Dashboard";
import Productos from "../Views/Productos";
import Ventas from "../Views/Ventas";
import Proveedores from "../Views/Proveedores";
import Usuarios from "../Views/Usuarios";
import VentasRealizadas from "../Views/VentasRealizadas";
import AdminVentas from "../Views/AdminVentas";
import ProtectedRoute from "./ProtectedRoute";
import PerfilUsuario from "../Views/PerfilUsuario";
import InventarioAdmin from "../Views/InventarioAdmin";


export default function AppRoutes() {
  const { userRole } = useContext(AuthContext);

  return (
    <BrowserRouter basename="/SistemaInventario">
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<Admin />}>

          <Route
            path="dashboard"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="productos"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <Productos />
              </ProtectedRoute>
            }
          />

          <Route
            path="proveedores"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <Proveedores />
              </ProtectedRoute>
            }
          />

          <Route
            path="usuarios"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin-ventas"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <AdminVentas />
              </ProtectedRoute>
            }
          />

          <Route
            path="ventas"
            element={
              <ProtectedRoute
                userRole={userRole}
                allowedRoles={["admin", "empleado"]}
              >
                <Ventas />
              </ProtectedRoute>
            }
          />

          <Route
            path="ventas-realizadas"
            element={
              <ProtectedRoute
                userRole={userRole}
                allowedRoles={["admin", "empleado"]}
              >
                <VentasRealizadas />
              </ProtectedRoute>
            }
          />
        
          <Route
            path="perfil"
            element={
              <ProtectedRoute
                userRole={userRole}
                allowedRoles={["admin", "empleado"]}
              >
                <PerfilUsuario />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventario-admin"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
                <InventarioAdmin />
              </ProtectedRoute>
            }
          />


        </Route>

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
