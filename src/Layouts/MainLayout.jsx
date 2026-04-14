import Sidebar from "../components/Sidebar";
import Navbar from "../Components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex">
        <Sidebar />

        <div className="flex-1 bg-gray-100 min-h-screen">
            <Navbar />
            <div className="p-6">
            <Outlet />
            </div>
        </div>
        </div>
    );
}
