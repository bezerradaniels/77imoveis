import { Outlet } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import ScrollToTop from "../../components/common/ScrollToTop";

export default function DashboardUsuarioLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <ScrollToTop />
            <Sidebar />
            <main className="ml-64 min-h-screen">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
