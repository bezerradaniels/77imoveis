import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../app/providers";
import { paths } from "../paths";

export default function GuestOnly() {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) return <div className="p-6">Carregando…</div>;

  if (user) {
    if (role === "imobiliaria") return <Navigate to={paths.dashImobiliaria} replace />;
    if (role === "corretor") return <Navigate to={paths.dashCorretor} replace />;
    return <Navigate to={paths.dashUsuario} replace />;
  }

  return <Outlet />;
}
